/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");
const { v2: cloudinary } = require("cloudinary");
const sharp = require("sharp");

const prisma = new PrismaClient();

// Cloudinary config - using environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UserCredentials {
  email: string;
  password: string;
}

interface UploadResult {
  fileName: string;
  secure_url: string;
  public_id: string;
  success: boolean;
  error?: string;
}

const CATEGORIES = ["electronics", "food", "clothing", "accessories", "services"];
const SKILLS = [
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

const EXPERTISE_LEVELS = ["beginner", "semi-pro", "pro", "master"];
const PAYMENT_METHODS = ["cash", "transfer"];
const SOCIAL_PLATFORMS = ["instagram", "linkedin", "twitter", "website"];
const SENTIMENTS = ["positive", "negative", "neutral"];

async function generateAndUploadImage(
  productName: string,
  category: string
): Promise<UploadResult> {
  try {
    // Create a simple colored image based on category
    const colors: { [key: string]: string } = {
      electronics: "#00BFFF",
      food: "#FF6347",
      clothing: "#9370DB",
      accessories: "#FFD700",
      services: "#32CD32",
    };

    const color = colors[category] || "#808080";

    // Create a simple SVG image and convert to PNG
    const svgImage = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="${color}"/>
        <text x="200" y="200" font-size="24" font-weight="bold" text-anchor="middle" 
              dominant-baseline="middle" fill="white" word-spacing="10">
          ${productName.substring(0, 20)}
        </text>
      </svg>
    `;

    // Convert SVG to buffer
    const buffer = await sharp(Buffer.from(svgImage))
      .png()
      .toBuffer();

    // Upload to Cloudinary with "plug" folder
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "plug",
          resource_type: "auto",
          public_id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(buffer);
    });

    const uploadResult = result as any;
    console.log(
      `✓ Image uploaded to Cloudinary: ${uploadResult.public_id} (${uploadResult.secure_url})`
    );

    return {
      fileName: productName,
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      success: true,
    };
  } catch (error: any) {
    console.error(`✗ Failed to upload image for ${productName}:`, error.message);
    return {
      fileName: productName,
      secure_url: "",
      public_id: "",
      success: false,
      error: error.message,
    };
  }
}

async function seedDatabase() {
  try {
    console.log("\n🌱 Starting comprehensive database seed...\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await prisma.cartItem.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.skillCounterOffer.deleteMany({});
    await prisma.skillOffer.deleteMany({});
    await prisma.skillReview.deleteMany({});
    await prisma.skillNotification.deleteMany({});
    await prisma.skill.deleteMany({});
    await prisma.variantValueOnProductVariant.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.variantValue.deleteMany({});
    await prisma.variantField.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.business.deleteMany({});
    await prisma.user.deleteMany({});

    // Seed skill types and categories
    console.log("\n📋 Seeding skill types and categories...");
    const SKILL_TYPES_LIST = [
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

    const CATEGORIES_LIST = [
      "Food",
      "Clothing",
      "Electronics",
      "Cosmetics",
      "Services",
    ];

    // Seed skill types
    for (const skillName of SKILL_TYPES_LIST) {
      await prisma.$executeRaw`
        INSERT INTO SkillType (id, name, createdAt, updatedAt)
        VALUES (UUID(), ${skillName}, NOW(), NOW())
        ON DUPLICATE KEY UPDATE updatedAt = NOW()
      `;
    }
    console.log(`  ✓ Added ${SKILL_TYPES_LIST.length} skill types`);

    // Seed categories
    for (const categoryName of CATEGORIES_LIST) {
      await prisma.$executeRaw`
        INSERT INTO Category (id, name, createdAt, updatedAt)
        VALUES (UUID(), ${categoryName}, NOW(), NOW())
        ON DUPLICATE KEY UPDATE updatedAt = NOW()
      `;
    }
    console.log(`  ✓ Added ${CATEGORIES_LIST.length} categories`);

    const userCredentials: UserCredentials[] = [];
    const users = [];

    // Create 20 users
    console.log("\n👥 Creating 20 users...");
    for (let i = 0; i < 20; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ provider: "gmail.com" });
      const plainPassword = faker.internet.password({ length: 12 });
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          location: faker.location.city() + ", UK",
        },
      });

      users.push(user);
      userCredentials.push({
        email,
        password: plainPassword,
      });

      console.log(`  ✓ Created user: ${email}`);
    }

    const businesses = [];

    // Create 30 businesses (6 per category)
    console.log("\n🏢 Creating 30 businesses...");
    for (const category of CATEGORIES) {
      for (let i = 0; i < 6; i++) {
        const businessUser = users[Math.floor(Math.random() * users.length)];
        const businessName =
          faker.company.name() +
          " " +
          (category.charAt(0).toUpperCase() + category.slice(1));

        const business = await prisma.business.create({
          data: {
            name: businessName,
            industry: category,
            description: faker.lorem.paragraph(3),
            location: faker.location.city() + ", UK",
            serviceDays: "Monday-Sunday",
            serviceTimes: "9AM-10PM",
            yearEstablished: faker.date.past({ years: 10 }).getFullYear(),
            paymentMethod: faker.datatype.boolean() ? "cash" : "transfer",
            bankName: faker.datatype.boolean() ? faker.company.name() : undefined,
            accountNumber: faker.datatype.boolean()
              ? faker.string.numeric(10)
              : undefined,
            accountHolderName: faker.datatype.boolean()
              ? faker.person.fullName()
              : undefined,
            userId: businessUser.id,
          },
        });

        businesses.push(business);
        console.log(`  ✓ Created business: ${businessName} (${category})`);
      }
    }

    let totalImagesUploaded = 0;
    let totalImagesFailed = 0;

    // Create products with images
    console.log("\n📦 Creating products with Cloudinary images...");
    for (const business of businesses) {
      const productCount = faker.number.int({ min: 3, max: 8 });

      for (let i = 0; i < productCount; i++) {
        const productName =
          faker.commerce.productName() + " - " + business.industry;

        // Generate and upload image
        const imageResult = await generateAndUploadImage(
          productName,
          business.industry
        );

        if (imageResult.success) {
          totalImagesUploaded++;
        } else {
          totalImagesFailed++;
        }

        const product = await prisma.product.create({
          data: {
            name: productName,
            description: faker.commerce.productDescription(),
            price: parseFloat(faker.commerce.price({ min: 50, max: 1000 })),
            cost: parseFloat(faker.commerce.price({ min: 20, max: 500 })),
            stock: faker.number.int({ min: 5, max: 100 }),
            businessId: business.id,
            secure_url: imageResult.secure_url,
            public_id: imageResult.public_id,
            rating: faker.number.int({ min: 1, max: 5 }),
            ratingCount: faker.number.int({ min: 0, max: 200 }),
          },
        });

        console.log(`  ✓ Created product: ${productName}`);
      }
    }

    // Create skills for users
    console.log("\n💼 Creating skills...");
    const skills = [];
    for (const user of users) {
      const userSkillCount = faker.number.int({ min: 1, max: 3 });
      const shuffledSkills = SKILLS.sort(() => Math.random() - 0.5);

      for (let i = 0; i < userSkillCount; i++) {
        const skillName = shuffledSkills[i];
        const displayNameChoice = faker.number.int({ min: 0, max: 2 }); // 0: firstName, 1: lastName, 2: fullName
        let displayName = "";
        if (displayNameChoice === 0) {
          displayName = user.firstName;
        } else if (displayNameChoice === 1) {
          displayName = user.lastName;
        } else {
          displayName = `${user.firstName} ${user.lastName}`;
        }

        // Generate and upload profile picture
        const profileImageResult = await generateAndUploadImage(
          `${skillName}_${user.firstName}`,
          "services"
        );

        const skill = await prisma.skill.create({
          data: {
            name: skillName,
            displayName: displayName,
            description: faker.lorem.paragraphs(2),
            yearsOfExperience: faker.number.int({ min: 1, max: 15 }),
            expertiseLevel:
              EXPERTISE_LEVELS[
                Math.floor(Math.random() * EXPERTISE_LEVELS.length)
              ],
            paymentMethod:
              PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
            profilePicture: profileImageResult.secure_url,
            profilePicturePublicId: profileImageResult.public_id,
            startingPrice: parseFloat(faker.commerce.price({ min: 50, max: 500 })),
            timeOfEstablishment: faker.date.past({ years: 5 }),
            serviceDays: "Monday-Sunday",
            serviceTimes: "9AM-10PM",
            mostActiveSocial: SOCIAL_PLATFORMS[
              Math.floor(Math.random() * SOCIAL_PLATFORMS.length)
            ],
            instagram: faker.internet.username(),
            linkedin: faker.internet.username(),
            twitter: faker.internet.username(),
            website: faker.internet.url(),
            achievements: faker.lorem.paragraphs(1),
            visitors: faker.number.int({ min: 10, max: 500 }),
            userId: user.id,
          },
        });

        skills.push(skill);
        if (profileImageResult.success) {
          totalImagesUploaded++;
        } else {
          totalImagesFailed++;
        }
      }

      console.log(`  ✓ Created ${userSkillCount} skills for ${user.email}`);
    }

    // Create some orders
    console.log("\n📋 Creating sample orders...");
    let orderCount = 0;
    for (let i = 0; i < 15; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const business =
        businesses[Math.floor(Math.random() * businesses.length)];
      const products = await prisma.product.findMany({
        where: { businessId: business.id },
        take: faker.number.int({ min: 1, max: 3 }),
      });

      if (products.length > 0) {
        let totalAmount = 0;
        const orderItems = [];

        for (const product of products) {
          const quantity = faker.number.int({ min: 1, max: 5 });
          const itemTotal = product.price * quantity;
          totalAmount += itemTotal;

          orderItems.push({
            quantity,
            price: product.price,
            productId: product.id,
          });
        }

        const order = await prisma.order.create({
          data: {
            status: faker.datatype.boolean(0.7)
              ? "completed"
              : faker.datatype.boolean()
              ? "pending"
              : "cancelled",
            totalAmount,
            userId: user.id,
            businessId: business.id,
            items: {
              createMany: {
                data: orderItems,
              },
            },
          },
        });

        orderCount++;
        console.log(`  ✓ Created order: ${order.id} with ${products.length} items`);
      }
    }

    // Create reviews
    console.log("\n⭐ Creating reviews...");
    let reviewCount = 0;
    for (let i = 0; i < 25; i++) {
      const business =
        businesses[Math.floor(Math.random() * businesses.length)];
      await prisma.review.create({
        data: {
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.lorem.sentence(),
          businessId: business.id,
        },
      });
      reviewCount++;
    }
    console.log(`  ✓ Created ${reviewCount} reviews`);

    // Create skill offers
    console.log("\n🤝 Creating skill offers...");
    let skillOfferCount = 0;
    if (skills.length > 0) {
      for (let i = 0; i < Math.min(30, users.length * skills.length); i++) {
        const skill = skills[Math.floor(Math.random() * skills.length)];
        const buyer = users.find((u) => u.id !== skill.userId);

        if (buyer) {
          const offerFrom = faker.date.future({ days: 10 });
          const offerTo = new Date(offerFrom);
          offerTo.setDate(offerTo.getDate() + faker.number.int({ min: 5, max: 30 }));

          const offerStatus = faker.datatype.boolean(0.6)
            ? "accepted"
            : faker.datatype.boolean(0.5)
            ? "pending"
            : faker.datatype.boolean()
            ? "rejected"
            : "fulfilled";

          const offer = await prisma.skillOffer.create({
            data: {
              status: offerStatus,
              offerFrom,
              offerTo,
              description: faker.lorem.sentence(),
              originalPrice: skill.startingPrice,
              currentPrice: faker.datatype.boolean(0.4)
                ? parseFloat(faker.commerce.price({ min: skill.startingPrice - 50, max: skill.startingPrice + 100 }))
                : undefined,
              skillId: skill.id,
              buyerId: buyer.id,
              fulfillmentOtp: offerStatus === "accepted" || offerStatus === "fulfilled" ? faker.string.numeric(6) : undefined,
              fulfillmentOtpExpiry: offerStatus === "accepted" || offerStatus === "fulfilled" ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined,
              fulfillmentOtpAttempts: offerStatus === "fulfilled" ? faker.number.int({ min: 1, max: 3 }) : 0,
            },
          });

          // Create notifications for offers
          const notificationMessage = 
            offerStatus === "pending"
              ? `New offer for ${skill.name} from ${buyer.firstName}`
              : offerStatus === "accepted"
              ? `Your offer for ${skill.name} was accepted`
              : offerStatus === "rejected"
              ? `Your offer for ${skill.name} was rejected`
              : `Your offer for ${skill.name} has been fulfilled`;

          await prisma.skillNotification.create({
            data: {
              skillId: skill.id,
              message: notificationMessage,
              type: 
                offerStatus === "pending"
                  ? "new_offer"
                  : offerStatus === "accepted"
                  ? "offer_accepted"
                  : offerStatus === "rejected"
                  ? "offer_rejected"
                  : "offer_fulfilled",
              read: faker.datatype.boolean(0.3),
            },
          });

          skillOfferCount++;
        }
      }
    }
    console.log(`  ✓ Created ${skillOfferCount} skill offers`);

    // Create skill reviews
    console.log("\n⭐ Creating skill reviews...");
    let skillReviewCount = 0;
    if (skills.length > 0) {
      for (let i = 0; i < Math.min(25, skills.length); i++) {
        const skill = skills[Math.floor(Math.random() * skills.length)];
        const buyer = users.find((u) => u.id !== skill.userId);

        if (buyer) {
          const review = await prisma.skillReview.create({
            data: {
              skillId: skill.id,
              buyerId: buyer.id,
              rating: faker.number.int({ min: 1, max: 5 }),
              comment: faker.lorem.sentences(2),
              sentiment: SENTIMENTS[Math.floor(Math.random() * SENTIMENTS.length)],
            },
          });

          skillReviewCount++;
        }
      }
    }
    console.log(`  ✓ Created ${skillReviewCount} skill reviews`);

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(70));

    console.log("\n📊 STATISTICS:");
    console.log(`  • Users created: ${users.length}`);
    console.log(`  • Businesses created: ${businesses.length}`);
    console.log(`  • Products created: ${businesses.length * 5} (avg)`);
    console.log(`  • Images uploaded successfully: ${totalImagesUploaded}`);
    console.log(`  • Images failed to upload: ${totalImagesFailed}`);
    console.log(`  • Orders created: ${orderCount}`);
    console.log(`  • Business reviews created: ${reviewCount}`);
    console.log(`  • Skills created: ${skills.length}`);
    console.log(`  • Skill offers created: ${skillOfferCount}`);
    console.log(`  • Skill reviews created: ${skillReviewCount}`);
    console.log(`  • Skill types created: 11`);
    console.log(`  • Categories created: 5`);

    console.log("\n" + "=".repeat(70));
    console.log("🔐 USER CREDENTIALS (Email & Password):");
    console.log("=".repeat(70) + "\n");

    for (let i = 0; i < userCredentials.length; i++) {
      console.log(`${i + 1}. Email: ${userCredentials[i].email}`);
      console.log(`   Password: ${userCredentials[i].password}\n`);
    }

    console.log("=".repeat(70));
    console.log("📸 CLOUDINARY UPLOAD STATUS:");
    console.log("=".repeat(70));
    console.log(
      `✓ Images saved in: https://console.cloudinary.com/[your-account]/media_library/folders/plug`
    );
    console.log(`✓ Total uploads: ${totalImagesUploaded} successful`);
    if (totalImagesFailed > 0) {
      console.log(`⚠️  Failed uploads: ${totalImagesFailed}`);
    }

    console.log("\n🎉 All data has been seeded successfully!\n");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
