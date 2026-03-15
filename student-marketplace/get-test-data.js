const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getTestData() {
  try {
    const users = await prisma.user.findMany({
      include: {
        businesses: {
          select: {
            id: true,
            name: true,
            industry: true,
          },
        },
      },
    });

    console.log(
      "\n╔════════════════════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║              🔑 USERS, PASSWORDS & ASSOCIATED BUSINESSES                   ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════════════════════╝\n"
    );

    users.forEach((user, index) => {
      console.log(
        `\n📌 USER ${index + 1}: ${user.firstName} ${user.lastName}`
      );
      console.log(
        `   Email:    user${index + 1}@test.com`
      );
      console.log(
        `   Password: Password${index + 1}!`
      );
      console.log(`   Location: ${user.location}`);
      console.log(`\n   🏢 Businesses (${user.businesses.length}):`);

      user.businesses.forEach((business, bIndex) => {
        console.log(
          `      ${bIndex + 1}. ${business.name} (${business.industry})`
        );
        console.log(`         ID: ${business.id}`);
      });
    });

    console.log(
      "\n╔════════════════════════════════════════════════════════════════════════════╗\n"
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

getTestData();
