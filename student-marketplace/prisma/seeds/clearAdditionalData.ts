import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearAdditionalData() {
  try {
    console.log("\n🗑️  Clearing additional data (keeping SkillTypes and Categories)...\n");

    // Delete in correct order (respecting foreign keys)
    await prisma.cartItem.deleteMany({});
    console.log("✓ Cleared CartItems");

    await prisma.orderItem.deleteMany({});
    console.log("✓ Cleared OrderItems");

    await prisma.order.deleteMany({});
    console.log("✓ Cleared Orders");

    await prisma.review.deleteMany({});
    console.log("✓ Cleared Reviews");

    await prisma.notification.deleteMany({});
    console.log("✓ Cleared Notifications");

    await prisma.skillCounterOffer.deleteMany({});
    console.log("✓ Cleared SkillCounterOffers");

    await prisma.skillReview.deleteMany({});
    console.log("✓ Cleared SkillReviews");

    await prisma.skillOffer.deleteMany({});
    console.log("✓ Cleared SkillOffers");

    await prisma.skillNotification.deleteMany({});
    console.log("✓ Cleared SkillNotifications");

    await prisma.skill.deleteMany({});
    console.log("✓ Cleared Skills");

    await prisma.variantValueOnProductVariant.deleteMany({});
    console.log("✓ Cleared VariantValueOnProductVariant");

    await prisma.productVariant.deleteMany({});
    console.log("✓ Cleared ProductVariants");

    await prisma.variantValue.deleteMany({});
    console.log("✓ Cleared VariantValues");

    await prisma.variantField.deleteMany({});
    console.log("✓ Cleared VariantFields");

    await prisma.product.deleteMany({});
    console.log("✓ Cleared Products");

    await prisma.business.deleteMany({});
    console.log("✓ Cleared Businesses");

    await prisma.user.deleteMany({});
    console.log("✓ Cleared Users");

    console.log("\n✅ ADDITIONAL DATA CLEARED SUCCESSFULLY!");
    console.log("✅ SkillTypes and Categories have been preserved!\n");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearAdditionalData();
