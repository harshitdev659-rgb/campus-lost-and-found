import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are permitted." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 5MB limit. Please upload an image under 5MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verify magic bytes for common image types
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;
    const isGif = buffer.subarray(0, 3).toString() === "GIF";
    const isWebp =
      buffer.subarray(0, 4).toString() === "RIFF" &&
      buffer.subarray(8, 12).toString() === "WEBP";

    if (!isJpeg && !isPng && !isGif && !isWebp) {
      return NextResponse.json(
        { error: "File content did not match a valid image header." },
        { status: 400 }
      );
    }

    // Generate random unguessable filename
    const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const randomName = `${Date.now()}-${crypto.randomBytes(16).toString("hex")}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, randomName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${randomName}`;

    return NextResponse.json({
      url: publicUrl,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const msg = error instanceof Error ? error.message : "Failed to process image upload";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
