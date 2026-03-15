const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        location: true,
        _count: {
          select: {
            businesses: true,
            skills: true,
          },
        },
      },
    });

    console.log("\n╔════════════════════════════════════════════════════════════════════╗");
    console.log("║                    📋 ALL USERS IN DATABASE                         ║");
    console.log("╚════════════════════════════════════════════════════════════════════╝\n");

    console.log(`Total Users: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Location: ${user.location || "N/A"}`);
      console.log(`   Businesses: ${user._count.businesses}`);
      console.log(`   Skills: ${user._count.skills}`);
      console.log("");
    });

    console.log("\n╔════════════════════════════════════════════════════════════════════╗");
    console.log("║ ⚠️  NOTE: Passwords are hashed in the database with bcrypt         ║");
    console.log("║    The fullSeed.ts script generates random passwords using Faker.js ║");
    console.log("║    These passwords were only shown in console during seeding        ║");
    console.log("╚════════════════════════════════════════════════════════════════════╝\n");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

getAllUsers();
