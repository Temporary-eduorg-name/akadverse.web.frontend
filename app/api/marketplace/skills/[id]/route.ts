import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch a specific skill
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const authResult = verifyAuth(req);

    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const skill = await prisma.skill.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            offers: true,
            reviews: true,
          },
        },
      },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Verify ownership
    if (skill.userId !== authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ skill });
  } catch (error) {
    console.error("Get skill error:", error);
    return NextResponse.json(
      { error: "Failed to fetch skill" },
      { status: 500 }
    );
  }
}

// PUT - Update a skill
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const authResult = verifyAuth(req);

    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const skill = await prisma.skill.findUnique({
      where: { id: params.id },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Verify ownership
    if (skill.userId !== authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    const updatedSkill = await prisma.skill.update({
      where: { id: params.id },
      data: {
        description: body.description,
        displayName: body.displayName,
        yearsOfExperience: body.yearsOfExperience ? parseInt(body.yearsOfExperience) : undefined,
        expertiseLevel: body.expertiseLevel,
        startingPrice: body.startingPrice ? parseFloat(body.startingPrice) : undefined,
        serviceDays: body.serviceDays,
        serviceTimes: body.serviceTimes,
        mostActiveSocial: body.mostActiveSocial,
        instagram: body.instagram,
        linkedin: body.linkedin,
        twitter: body.twitter,
        website: body.website,
        achievements: body.achievements,
      },
    });

    return NextResponse.json({
      message: "Skill updated successfully",
      skill: updatedSkill,
    });
  } catch (error) {
    console.error("Update skill error:", error);
    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a skill
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const authResult = verifyAuth(req);

    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const skill = await prisma.skill.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            offers: true,
          },
        },
      },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Verify ownership
    if (skill.userId !== authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if skill has active offers
    if (skill._count.offers > 0) {
      return NextResponse.json(
        { error: "Cannot delete skill with existing offers. Please complete or cancel all offers first." },
        { status: 400 }
      );
    }

    await prisma.skill.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Skill deleted successfully",
    });
  } catch (error) {
    console.error("Delete skill error:", error);
    return NextResponse.json(
      { error: "Failed to delete skill" },
      { status: 500 }
    );
  }
}
