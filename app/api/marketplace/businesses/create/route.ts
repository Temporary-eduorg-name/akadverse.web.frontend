import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const {
      name,
      industry,
      description,
      paymentMethod,
      bankName,
      accountNumber,
      accountHolderName,
      location,
      serviceDays,
      serviceTimes,
      instagram,
      linkedin,
      website,
    } = await req.json();

    // Validate required fields
    if (
      !name ||
      !industry ||
      !description ||
      !paymentMethod ||
      !location ||
      !serviceDays ||
      !serviceTimes
    ) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    const business = await prisma.business.create({
      data: {
        name,
        industry,
        description,
        paymentMethod,
        bankName: bankName || null,
        accountNumber: accountNumber || null,
        accountHolderName: accountHolderName || null,
        location,
        serviceDays,
        serviceTimes,
        instagram: instagram || null,
        linkedin: linkedin || null,
        website: website || null,
        userId: authResult.userId,
      },
    });

    return NextResponse.json(
      {
        message: "Business created successfully",
        business,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create business error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating business" },
      { status: 500 }
    );
  }
}
