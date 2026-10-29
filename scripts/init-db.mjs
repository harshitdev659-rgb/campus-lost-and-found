import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(pass) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pass, salt);
}

async function main() {
  console.log("🌱 Initializing Campus Lost & Found database seed...");

  // 1. Create or reset demo users
  const adminPass = await hashPassword("Admin@Pass123");
  const studentPass = await hashPassword("Student@Pass123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@campus.edu" },
    update: {},
    create: {
      name: "Campus Security Admin",
      email: "admin@campus.edu",
      studentId: "ADM-001",
      collegeDomain: "campus.edu",
      passwordHash: adminPass,
      role: "ADMIN",
      isVerified: true,
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: "student@campus.edu" },
    update: {},
    create: {
      name: "Marcus Vance",
      email: "student@campus.edu",
      studentId: "STU-2024-1184",
      collegeDomain: "campus.edu",
      passwordHash: studentPass,
      role: "STUDENT",
      isVerified: true,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "jane@campus.edu" },
    update: {},
    create: {
      name: "Jane Chen",
      email: "jane@campus.edu",
      studentId: "STU-2024-9921",
      collegeDomain: "campus.edu",
      passwordHash: studentPass,
      role: "STUDENT",
      isVerified: true,
    },
  });

  console.log("✅ Seeded Users: admin@campus.edu, student@campus.edu, jane@campus.edu");

  // 2. Clear old demo reports to keep seed clean
  const existingCount = await prisma.report.count();
  if (existingCount === 0) {
    // Report 1: Lost Laptop
    await prisma.report.create({
      data: {
        type: "LOST",
        title: "Space Gray MacBook Air M2 (13-inch)",
        description: "Left on a study desk on the 3rd floor quiet zone of Central Library. Contains physics research papers and a dark gray protective sleeve.",
        category: "Electronics",
        dateEvent: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        campusLocation: "Central Library",
        building: "Main Academic Complex",
        floor: "3rd Floor",
        room: "Silent Study Carrel #14",
        status: "ACTIVE",
        distinguishingFeatures: "Serial # C02G40... Lock screen is a NASA James Webb nebula photo. Slight sticker residue on bottom right corner.",
        userId: student1.id,
      },
    });

    // Report 2: Found Dorm Keys with Verification Questions
    const keysExpectedHash = await bcrypt.hash("blue yamaha", 10);
    const keysReport = await prisma.report.create({
      data: {
        type: "FOUND",
        title: "Ring of 4 Brass Keys with Motorcycle Keychain",
        description: "Found on a wooden bench outside the Central Cafeteria following the lunchtime rush. Handed temporarily to cafeteria helpdesk.",
        category: "Keys",
        dateEvent: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        campusLocation: "Central Cafeteria & Food Court",
        building: "Student Center & Union",
        status: "ACTIVE",
        distinguishingFeatures: "Keychain has embossed letters 'Yamaha R3' in faded white lettering. One key has a red rubber cap.",
        userId: student2.id,
        verificationQuestions: {
          create: [
            {
              questionText: "What brand or tag is attached to the main keychain ring?",
              expectedAnswerHash: keysExpectedHash,
              hint: "Motorcycle manufacturer / brand",
              isRequired: true,
              orderIndex: 0,
            },
            {
              questionText: "Does any specific key have a colored rubber cap?",
              hint: "Color of sleeve",
              isRequired: false,
              orderIndex: 1,
            },
          ],
        },
      },
    });

    // Report 3: Found Sony Noise Cancelling Headphones
    const headphonesExpectedHash = await bcrypt.hash("pink astronaut", 10);
    await prisma.report.create({
      data: {
        type: "FOUND",
        title: "Sony WH-1000XM4 Wireless Headphones (Black)",
        description: "Left on the desk in Engineering Block A after the 4:00 PM Robotics lecture. In original black zipper hard case with charging cable.",
        category: "Electronics",
        dateEvent: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        campusLocation: "Engineering Block A",
        building: "Block A - North Wing",
        floor: "2nd Floor",
        room: "Auditorium 201",
        status: "ACTIVE",
        distinguishingFeatures: "Inside the case zipper pocket there is a miniature pink astronaut enamel pin and an audio adapter.",
        userId: admin.id,
        verificationQuestions: {
          create: [
            {
              questionText: "What small pin or accessory is inside the inner headphone case pouch?",
              expectedAnswerHash: headphonesExpectedHash,
              hint: "Enamel pin design",
              isRequired: true,
              orderIndex: 0,
            },
          ],
        },
      },
    });

    // Report 4: Lost Student ID Card
    await prisma.report.create({
      data: {
        type: "LOST",
        title: "University RFID Student Campus Access Card",
        description: "Lost somewhere between the Sports Complex Gymnasium and North Parking Lot during the evening intramural basketball tournament.",
        category: "ID Cards",
        dateEvent: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        campusLocation: "Sports Complex & Gymnasium",
        building: "Main Arena",
        status: "ACTIVE",
        distinguishingFeatures: "ID starts with 2024-STU with a blue lanyard and transit pass clip.",
        userId: student2.id,
      },
    });

    // Report 5: Resolved Sample Report
    await prisma.report.create({
      data: {
        type: "FOUND",
        title: "Hydro Flask 32oz Water Bottle (Pacific Blue)",
        description: "Left on bench near central quadrangle trees.",
        category: "Bottles",
        dateEvent: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        campusLocation: "Campus Grounds & Quadrangle",
        status: "RESOLVED",
        distinguishingFeatures: "Dented bottom edge and National Parks sticker.",
        userId: admin.id,
      },
    });

    // Sample Notification
    await prisma.notification.create({
      data: {
        userId: student1.id,
        type: "SYSTEM_WELCOME",
        title: "Welcome to CampusFind!",
        message: "Your campus account has been configured with recognized university domain privileges.",
        linkUrl: "/dashboard",
      },
    });

    // Sample Audit Log
    await prisma.auditEvent.create({
      data: {
        actorId: admin.id,
        action: "PLATFORM_INITIALIZATION",
        targetType: "SYSTEM",
        metadata: JSON.stringify({ version: "1.0.0", status: "ONLINE" }),
      },
    });

    console.log("✅ Seeded 5 Realistic Campus Listings & Verification Questions");
  } else {
    console.log(`ℹ️ Database already contains ${existingCount} reports.`);
  }

  console.log("🎉 Database initialization completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
