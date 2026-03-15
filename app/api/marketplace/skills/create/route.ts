import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

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

    const formData = await req.formData();

    // Extract all fields
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const displayName = formData.get("displayName") as string;
    const yearsOfExperience = parseInt(formData.get("yearsOfExperience") as string);
    const expertiseLevel = formData.get("expertiseLevel") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const startingPrice = parseFloat(formData.get("startingPrice") as string);
    const serviceDays = formData.get("serviceDays") as string;
    const serviceTimes = formData.get("serviceTimes") as string;
    const mostActiveSocial = formData.get("mostActiveSocial") as string;
    const instagram = formData.get("instagram") as string;
    const linkedin = formData.get("linkedin") as string;
    const twitter = formData.get("twitter") as string;
    const website = formData.get("website") as string;
    const achievements = formData.get("achievements") as string;
    const profilePictureFile = formData.get("profilePicture") as File | null;

    // Validate required fields
    if (!name || !description || !displayName || !yearsOfExperience || !expertiseLevel || !paymentMethod || !startingPrice || !serviceDays || !serviceTimes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let profilePictureUrl = null;
    let profilePicturePublicId = null;

    // Upload profile picture if provided
    if (profilePictureFile) {
      try {
        const buffer = Buffer.from(await profilePictureFile.arrayBuffer());
        const cloudinaryResult = await uploadToCloudinary(buffer, "skill-profiles");
        profilePictureUrl = cloudinaryResult.secure_url;
        profilePicturePublicId = cloudinaryResult.public_id;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload profile picture" },
          { status: 400 }
        );
      }
    }

    // Create skill record
    const skill = await prisma.skill.create({
      data: {
        name,
        description,
        displayName,
        yearsOfExperience,
        expertiseLevel,
        paymentMethod,
        startingPrice,
        serviceDays,
        serviceTimes,
        mostActiveSocial: mostActiveSocial || null,
        instagram: instagram || null,
        linkedin: linkedin || null,
        twitter: twitter || null,
        website: website || null,
        achievements: achievements || null,
        profilePicture: profilePictureUrl,
        profilePicturePublicId: profilePicturePublicId,
        userId: authResult.userId,
        visitors: 0,
      },
    });

    return NextResponse.json(
      {
        message: "Skill created successfully",
        skill,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create skill error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating skill" },
      { status: 500 }
    );
  }
}
