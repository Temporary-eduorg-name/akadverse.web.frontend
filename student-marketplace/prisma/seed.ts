// import { PrismaClient } from "@prisma/client";
// import { faker } from "@faker-js/faker";
// import bcrypt from "bcrypt";

// const prisma = new PrismaClient();

// async function main() {
//   console.log("🌱 Starting database seed...");

//   try {
//     // Clear existing data
//     await prisma.cartItem.deleteMany();
//     await prisma.skillNotification.deleteMany();
//     await prisma.skillReview.deleteMany();
//     await prisma.skillCounterOffer.deleteMany();
//     await prisma.skillOffer.deleteMany();
//     await prisma.skill.deleteMany();
//     await prisma.notification.deleteMany();
//     await prisma.review.deleteMany();
//     await prisma.orderItem.deleteMany();
//     await prisma.order.deleteMany();
//     await prisma.variantValueOnProductVariant.deleteMany();
//     await prisma.productVariant.deleteMany();
//     await prisma.variantValue.deleteMany();
//     await prisma.variantField.deleteMany();
//     await prisma.cartItem.deleteMany();
//     await prisma.product.deleteMany();
//     await prisma.business.deleteMany();
//     await prisma.user.deleteMany();

//     console.log("✓ Cleared existing data");

//     // Create users
//     const users = await Promise.all(
//       Array.from({ length: 10 }).map(async () => {
//         const firstName = faker.person.firstName();
//         const lastName = faker.person.lastName();
//         return prisma.user.create({
//           data: {
//             firstName,
//             lastName,
//             email: faker.internet.email({ provider: "example.com" }),
//             password: await bcrypt.hash("password123", 10),
//             role: faker.helpers.arrayElement(["user", "admin"]),
//             location: faker.location.city(),
//           },
//         });
//       })
//     );

//     console.log(`✓ Created ${users.length} users`);

//     // Create businesses
//     const businesses = await Promise.all(
//       users.slice(0, 5).map((user) =>
//         prisma.business.create({
//           data: {
//             name: faker.company.name(),
//             industry: faker.helpers.arrayElement([
//               "Technology",
//               "Education",
//               "Healthcare",
//               "Finance",
//               "Retail",
//             ]),
//             description: faker.commerce.productDescription(),
//             paymentMethod: faker.helpers.arrayElement(["cash", "transfer"]),
//             bankName: faker.company.name(),
//             accountNumber: faker.finance.accountNumber(),
//             accountHolderName: `${user.firstName} ${user.lastName}`,
//             location: faker.location.city(),
//             serviceDays: "Monday-Friday",
//             serviceTimes: "9AM-5PM",
//             yearEstablished: faker.number.int({ min: 2015, max: 2024 }),
//             instagram: faker.internet.username(),
//             linkedin: faker.internet.username(),
//             website: faker.internet.url(),
//             userId: user.id,
//             visitors: faker.number.int({ min: 0, max: 5000 }),
//           },
//         })
//       )
//     );

//     console.log(`✓ Created ${businesses.length} businesses`);

//     // Create products with variants
//     const products = await Promise.all(
//       businesses.flatMap((business) =>
//         Array.from({ length: 3 }).map(async () => {
//           const product = await prisma.product.create({
//             data: {
//               name: faker.commerce.productName(),
//               description: faker.commerce.productDescription(),
//               price: parseFloat(faker.commerce.price({ min: 100, max: 5000 })),
//               cost: parseFloat(faker.commerce.price({ min: 50, max: 2500 })),
//               image: faker.image.url(),
//               stock: faker.number.int({ min: 0, max: 1000 }),
//               rating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
//               ratingCount: faker.number.int({ min: 0, max: 500 }),
//               businessId: business.id,
//             },
//           });

//           // Create variant fields
//           const colors = ["Red", "Blue", "Green", "Black", "White"];
//           const sizes = ["S", "M", "L", "XL", "XXL"];

//           const colorField = await prisma.variantField.create({
//             data: {
//               name: "Color",
//               productId: product.id,
//             },
//           });

//           const sizeField = await prisma.variantField.create({
//             data: {
//               name: "Size",
//               productId: product.id,
//             },
//           });

//           // Create variant values
//           const colorValues = await Promise.all(
//             colors.slice(0, 3).map((color) =>
//               prisma.variantValue.create({
//                 data: {
//                   value: color,
//                   fieldId: colorField.id,
//                 },
//               })
//             )
//           );

//           const sizeValues = await Promise.all(
//             sizes.slice(0, 3).map((size) =>
//               prisma.variantValue.create({
//                 data: {
//                   value: size,
//                   fieldId: sizeField.id,
//                 },
//               })
//             )
//           );

//           // Create product variants
//           for (const colorValue of colorValues) {
//             for (const sizeValue of sizeValues) {
//               const variant = await prisma.productVariant.create({
//                 data: {
//                   productId: product.id,
//                   price: parseFloat(
//                     faker.commerce.price({ min: 100, max: 5000 })
//                   ),
//                   isCustomPrice: faker.datatype.boolean(),
//                   stock: faker.number.int({ min: 0, max: 500 }),
//                 },
//               });

//               await prisma.variantValueOnProductVariant.create({
//                 data: {
//                   variantId: variant.id,
//                   valueId: colorValue.id,
//                 },
//               });

//               await prisma.variantValueOnProductVariant.create({
//                 data: {
//                   variantId: variant.id,
//                   valueId: sizeValue.id,
//                 },
//               });
//             }
//           }

//           return product;
//         })
//       )
//     );

//     console.log(`✓ Created ${products.length} products with variants`);

//     // Create orders
//     const orders = await Promise.all(
//       users.slice(5, 8).flatMap((user) =>
//         Array.from({ length: 2 }).map((_, idx) =>
//           prisma.order.create({
//             data: {
//               status: faker.helpers.arrayElement([
//                 "pending",
//                 "processing",
//                 "shipped",
//                 "delivered",
//               ]),
//               totalAmount: faker.number.float({ min: 500, max: 50000 }),
//               userId: user.id,
//               businessId: businesses[idx % businesses.length].id,
//               paymentStatus: faker.helpers.arrayElement([
//                 "pending",
//                 "verified",
//                 "failed",
//               ]),
//               paystackReference: faker.string.uuid(),
//             },
//           })
//         )
//       )
//     );

//     console.log(`✓ Created ${orders.length} orders`);

//     // Create order items
//     for (const order of orders) {
//       const itemCount = faker.number.int({ min: 1, max: 3 });
//       for (let i = 0; i < itemCount; i++) {
//         const product = products[Math.floor(Math.random() * products.length)];
//         await prisma.orderItem.create({
//           data: {
//             quantity: faker.number.int({ min: 1, max: 5 }),
//             price: parseFloat(faker.commerce.price({ min: 100, max: 5000 })),
//             orderId: order.id,
//             productId: product.id,
//             selectedVariants: JSON.stringify({
//               Color: "Red",
//               Size: "M",
//             }),
//           },
//         });
//       }
//     }

//     console.log(`✓ Created order items`);

//     // Create reviews
//     const reviews = await Promise.all(
//       businesses.flatMap((business) =>
//         Array.from({ length: 3 }).map(() =>
//           prisma.review.create({
//             data: {
//               rating: faker.number.int({ min: 1, max: 5 }),
//               comment: faker.lorem.sentences(2),
//               businessId: business.id,
//             },
//           })
//         )
//       )
//     );

//     console.log(`✓ Created ${reviews.length} reviews`);

//     // Create notifications
//     const notifications = await Promise.all(
//       users.flatMap((user) =>
//         Array.from({ length: 2 }).map(() =>
//           prisma.notification.create({
//             data: {
//               userId: user.id,
//               type: faker.helpers.arrayElement([
//                 "order",
//                 "payment",
//                 "review",
//               ]),
//               message: faker.lorem.sentence(),
//               read: faker.datatype.boolean(),
//               link: `/orders/${faker.string.uuid()}`,
//             },
//           })
//         )
//       )
//     );

//     console.log(`✓ Created ${notifications.length} notifications`);

//     // Create skills
//     const skills = await Promise.all(
//       users.slice(0, 7).map((user) =>
//         prisma.skill.create({
//           data: {
//             name: faker.helpers.arrayElement([
//               "Web Development",
//               "UI/UX Design",
//               "Data Science",
//               "Mobile Development",
//               "DevOps",
//               "Cloud Architecture",
//               "Machine Learning",
//               "Product Management",
//             ]),
//             description: faker.lorem.paragraphs(2),
//             displayName: `${user.firstName} ${user.lastName}`,
//             yearsOfExperience: faker.number.int({ min: 1, max: 15 }),
//             expertiseLevel: faker.helpers.arrayElement([
//               "beginner",
//               "semi-pro",
//               "pro",
//               "master",
//             ]),
//             paymentMethod: faker.helpers.arrayElement(["cash", "transfer"]),
//             startingPrice: parseFloat(
//               faker.commerce.price({ min: 1000, max: 50000 })
//             ),
//             timeOfEstablishment: faker.date.past({ years: 5 }),
//             serviceDays: "Monday-Friday",
//             serviceTimes: "10AM-6PM",
//             mostActiveSocial: faker.helpers.arrayElement([
//               "instagram",
//               "linkedin",
//               "twitter",
//             ]),
//             instagram: faker.internet.username(),
//             linkedin: faker.internet.username(),
//             twitter: faker.internet.username(),
//             achievements: faker.lorem.paragraphs(1),
//             visitors: faker.number.int({ min: 0, max: 2000 }),
//             userId: user.id,
//           },
//         })
//       )
//     );

//     console.log(`✓ Created ${skills.length} skills`);

//     // Create skill offers
//     const skillOffers = await Promise.all(
//       skills.flatMap((skill) =>
//         Array.from({ length: 2 }).map(() => {
//           const buyerId =
//             users[Math.floor(Math.random() * users.length)].id;
//           return prisma.skillOffer.create({
//             data: {
//               status: faker.helpers.arrayElement([
//                 "pending",
//                 "negotiated",
//                 "ongoing",
//                 "completed",
//                 "rejected",
//               ]),
//               offerFrom: faker.date.future({ days: 7 }),
//               offerTo: faker.date.future({ days: 30 }),
//               description: faker.lorem.paragraphs(1),
//               originalPrice: skill.startingPrice,
//               currentPrice: parseFloat(
//                 faker.commerce.price({
//                   min: skill.startingPrice * 0.8,
//                   max: skill.startingPrice * 1.2,
//                 })
//               ),
//               skillId: skill.id,
//               buyerId: buyerId,
//             },
//           });
//         })
//       )
//     );

//     console.log(`✓ Created ${skillOffers.length} skill offers`);

//     // Create counter offers
//     for (const offer of skillOffers.slice(0, Math.floor(skillOffers.length / 2))) {
//       await prisma.skillCounterOffer.create({
//         data: {
//           offerId: offer.id,
//           counterPrice:
//             (offer.currentPrice || offer.originalPrice) *
//             faker.number.float({ min: 0.8, max: 1.2 }),
//           reason: faker.lorem.sentences(1),
//         },
//       });
//     }

//     console.log(`✓ Created counter offers`);

//     // Create skill reviews
//     const skillReviews = await Promise.all(
//       skills.flatMap((skill) =>
//         Array.from({ length: 2 }).map(() =>
//           prisma.skillReview.create({
//             data: {
//               skillId: skill.id,
//               buyerId:
//                 users[Math.floor(Math.random() * users.length)].id,
//               rating: faker.number.int({ min: 1, max: 5 }),
//               comment: faker.lorem.sentences(2),
//               sentiment: faker.helpers.arrayElement([
//                 "positive",
//                 "negative",
//                 "neutral",
//               ]),
//             },
//           })
//         )
//       )
//     );

//     console.log(`✓ Created ${skillReviews.length} skill reviews`);

//     // Create skill notifications
//     const skillNotifications = await Promise.all(
//       skills.flatMap((skill) =>
//         Array.from({ length: 2 }).map(() =>
//           prisma.skillNotification.create({
//             data: {
//               skillId: skill.id,
//               message: faker.lorem.sentence(),
//               type: faker.helpers.arrayElement([
//                 "new_offer",
//                 "offer_accepted",
//                 "offer_rejected",
//                 "offer_fulfilled",
//               ]),
//               read: faker.datatype.boolean(),
//             },
//           })
//         )
//       )
//     );

//     console.log(`✓ Created ${skillNotifications.length} skill notifications`);

//     // Create cart items
//     const cartItems = await Promise.all(
//       users.slice(5, 8).flatMap((user) =>
//         Array.from({ length: 2 }).map(() => {
//           const product =
//             products[Math.floor(Math.random() * products.length)];
//           return prisma.cartItem.create({
//             data: {
//               quantity: faker.number.int({ min: 1, max: 5 }),
//               userId: user.id,
//               productId: product.id,
//               selectedVariants: JSON.stringify({
//                 Color: "Blue",
//                 Size: "L",
//               }),
//             },
//           });
//         })
//       )
//     );

//     console.log(`✓ Created ${cartItems.length} cart items`);

//     console.log("✨ Database seed completed successfully!");
//   } catch (error) {
//     console.error("❌ Error during seed:", error);
//     throw error;
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main()
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });


