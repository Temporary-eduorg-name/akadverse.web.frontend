import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const businessId = id;
    const {
      name,
      industry,
      description,
      location,
      serviceDays,
      serviceTimes,
      instagram,
      linkedin,
      website,
    } = await req.json();

    // Verify ownership
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    if (business.userId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const updated = await prisma.business.update({
      where: { id: businessId },
      data: {
        name,
        industry,
        description,
        location,
        serviceDays,
        serviceTimes,
        instagram,
        linkedin,
        website,
      },
    });

    return NextResponse.json(
      {
        message: "Business updated successfully",
        business: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update business error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating business" },
      { status: 500 }
    );
  }
}
