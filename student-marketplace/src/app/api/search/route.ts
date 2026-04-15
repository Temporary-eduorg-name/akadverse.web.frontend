import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const skillType = searchParams.get("skillType") || "";

    // Build the where clause for products
    const productWhere: any = {
      OR: [
        {
          name: {
            contains: query,
          },
        },
        {
          description: {
            contains: query,
          },
        },
      ],
    };

    // Add category filter if provided
    if (category) {
      productWhere.business = {
        industry: {
          equals: category,
        },
      };
    }

    // Only fetch products if skillType filter is NOT applied
    let products: any[] = [];
    if (!skillType) {
      products = await prisma.product.findMany({
        where: productWhere,
        include: {
          business: {
            select: {
              id: true,
              name: true,
              industry: true,
            },
          },
        },
        take: 50,
      });
    }

    const businessWhere: any = {
      OR: [
        {
          name: {
            contains: query,
          },
        },
        {
          description: {
            contains: query,
          },
        },
        {
          industry: {
            contains: query,
          },
        },
      ],
    };

    if (category) {
      businessWhere.AND = [
        {
          industry: {
            equals: category,
          },
        },
      ];
    }

    const businesses = await prisma.business.findMany({
      where: businessWhere,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      take: 20,
    });

    // Search for skills - always include them
    let skills: any[] = [];
    const skillWhere: any = {
      AND: [
        {
          OR: [
            {
              name: {
                contains: query,
              },
            },
            {
              description: {
                contains: query,
              },
            },
            {
              displayName: {
                contains: query,
              },
            },
            {
              user: {
                OR: [
                  {
                    firstName: {
                      contains: query,
                    },
                  },
                  {
                    lastName: {
                      contains: query,
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    // Add skillType/category filter if provided
    if (skillType) {
      // When skillType filter is applied, show skills with matching name (contains for tolerance)
      skillWhere.AND.push({
        name: {
          contains: skillType,
        },
      });
    } else if (category) {
      // When category is filtered, show skills whose name matches the category
      skillWhere.AND.push({
        name: {
          contains: category,
        },
      });
    }

    skills = await prisma.skill.findMany({
      where: skillWhere,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            offers: true,
            reviews: true,
          },
        },
      },
      take: 20,
    });

    const categories = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name
      FROM Category
      ORDER BY name ASC
    `;

    return NextResponse.json(
      {
        products,
        businesses,
        skills,
        categories: categories.map((item) => item.name),
        query,
        selectedCategory: category,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "An error occurred while searching" },
      { status: 500 }
    );
  }
}
