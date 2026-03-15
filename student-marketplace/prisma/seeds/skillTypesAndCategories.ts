import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SKILL_TYPES = [
  "Web Development",
  "Mobile App Development",
  "Photography",
  "Video Editing",
  "Graphic Design",
  "Content Writing",
  "Modelling",
  "Tutoring - Mathematics",
  "Tutoring - Sciences",
  "Digital Marketing",
  "Social Media Management",
];

const CATEGORIES = [
  "Food",
  "Clothing",
  "Electronics",
  "Cosmetics",
  "Services",
];

async function seedSkillTypesAndCategories() {
  console.log("🌱 Seeding skill types and categories...");

  try {
    // Seed skill types
    console.log("Adding skill types...");
    for (const skillName of SKILL_TYPES) {
      await prisma.$executeRaw`
        INSERT INTO SkillType (id, name, createdAt, updatedAt)
        VALUES (UUID(), ${skillName}, NOW(), NOW())
        ON DUPLICATE KEY UPDATE updatedAt = NOW()
      `;
    }
    console.log(`✅ Added ${SKILL_TYPES.length} skill types`);

    // Seed categories
    console.log("Adding categories...");
    for (const categoryName of CATEGORIES) {
      await prisma.$executeRaw`
        INSERT INTO Category (id, name, createdAt, updatedAt)
        VALUES (UUID(), ${categoryName}, NOW(), NOW())
        ON DUPLICATE KEY UPDATE updatedAt = NOW()
      `;
    }
    console.log(`✅ Added ${CATEGORIES.length} categories`);

    console.log("✅ Skill types and categories seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding skill types and categories:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedSkillTypesAndCategories()
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default seedSkillTypesAndCategories;
