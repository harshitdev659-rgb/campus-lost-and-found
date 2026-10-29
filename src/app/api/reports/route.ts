import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { hashVerificationAnswer } from "@/lib/verification";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";

const createReportSchema = z.object({
  type: z.enum(["LOST", "FOUND"]),
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  category: z.string().min(1, "Please select a category"),
  dateEvent: z.string(), // ISO date
  campusLocation: z.string().min(2, "Campus location is required"),
  building: z.string().optional(),
  block: z.string().optional(),
  floor: z.string().optional(),
  room: z.string().optional(),
  coordinates: z.string().optional(),
  imageUrl: z.string().optional(),
  isDraft: z.boolean().optional().default(false),
  contactPreference: z.enum(["IN_APP", "EMAIL_ANONYMIZED"]).optional().default("IN_APP"),
  distinguishingFeatures: z.string().optional(),
  verificationQuestions: z
    .array(
      z.object({
        questionText: z.string().min(3, "Question text required"),
        answerType: z.enum(["TEXT", "SERIAL_NUMBER", "FEATURE_SELECTION"]).default("TEXT"),
        expectedAnswer: z.string().optional(),
        hint: z.string().optional(),
        isRequired: z.boolean().default(true),
      })
    )
    .optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const currentUser = await getAuthUser(req);

    const q = searchParams.get("q")?.trim() || "";
    const type = searchParams.get("type"); // LOST, FOUND, or null for all
    const category = searchParams.get("category");
    const campusLocation = searchParams.get("campusLocation");
    const status = searchParams.get("status") || "ACTIVE"; // default to ACTIVE items for public discovery
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sort = searchParams.get("sort") || "newest"; // newest, oldest, relevance
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const skip = (page - 1) * limit;

    // Build Prisma where clause
    const where: any = {
      isDraft: false,
    };

    // Ordinary users only see ACTIVE, CLAIMED, or RESOLVED items. Never HIDDEN unless admin.
    if (currentUser?.role === "ADMIN") {
      if (status !== "ALL") {
        where.status = status;
      }
    } else {
      if (status === "ALL") {
        where.status = { not: "HIDDEN" };
      } else {
        where.status = status;
      }
    }

    if (type && (type === "LOST" || type === "FOUND")) {
      where.type = type;
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (campusLocation && campusLocation !== "ALL") {
      where.campusLocation = campusLocation;
    }

    if (startDate || endDate) {
      where.dateEvent = {};
      if (startDate) where.dateEvent.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.dateEvent.lte = end;
      }
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { campusLocation: { contains: q } },
        { building: { contains: q } },
        { room: { contains: q } },
      ];
    }

    // Determine sorting
    let orderBy: any = { createdAt: "desc" };
    if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sort === "event_recent") {
      orderBy = { dateEvent: "desc" };
    }

    const [total, reports] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              collegeDomain: true,
            },
          },
          _count: {
            select: {
              claims: true,
              savedBy: true,
            },
          },
        },
      }),
    ]);

    // Privacy filter: Mask distinguishingFeatures from public discovery
    const sanitizedReports = reports.map((r) => {
      const isOwner = currentUser?.id === r.userId;
      const isAdmin = currentUser?.role === "ADMIN";
      return {
        ...r,
        distinguishingFeatures: isOwner || isAdmin ? r.distinguishingFeatures : undefined,
        hasDistinguishingFeatures: !!r.distinguishingFeatures,
      };
    });

    return NextResponse.json({
      reports: sanitizedReports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List reports error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve lost and found reports." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    const parseResult = createReportSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Process verification questions if found item
    const questionsToCreate = [];
    if (data.type === "FOUND" && data.verificationQuestions && data.verificationQuestions.length > 0) {
      for (let i = 0; i < data.verificationQuestions.length; i++) {
        const q = data.verificationQuestions[i];
        let expectedAnswerHash: string | null = null;
        if (q.expectedAnswer && q.expectedAnswer.trim()) {
          expectedAnswerHash = await hashVerificationAnswer(q.expectedAnswer);
        }

        questionsToCreate.push({
          questionText: q.questionText.trim(),
          answerType: q.answerType,
          expectedAnswerHash,
          hint: q.hint?.trim() || null,
          isRequired: q.isRequired ?? true,
          orderIndex: i,
        });
      }
    }

    const report = await prisma.report.create({
      data: {
        type: data.type,
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        dateEvent: new Date(data.dateEvent),
        campusLocation: data.campusLocation.trim(),
        building: data.building?.trim() || null,
        block: data.block?.trim() || null,
        floor: data.floor?.trim() || null,
        room: data.room?.trim() || null,
        coordinates: data.coordinates?.trim() || null,
        imageUrl: data.imageUrl || null,
        isDraft: data.isDraft || false,
        status: data.isDraft ? "DRAFT" : "ACTIVE",
        contactPreference: data.contactPreference,
        distinguishingFeatures: data.distinguishingFeatures?.trim() || null,
        userId: user.id,
        verificationQuestions: {
          create: questionsToCreate,
        },
      },
      include: {
        verificationQuestions: {
          select: {
            id: true,
            questionText: true,
            answerType: true,
            hint: true,
            isRequired: true,
            orderIndex: true,
          },
        },
      },
    });

    await logAuditEvent({
      actorId: user.id,
      action: "CREATE_REPORT",
      targetType: "REPORT",
      targetId: report.id,
      metadata: { type: report.type, category: report.category, title: report.title },
    });

    return NextResponse.json({ report, message: "Report published successfully" }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create report error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create report.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
