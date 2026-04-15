import { NextResponse } from "next/server";

export async function GET() {
  try {
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey) {
      return NextResponse.json(
        { error: "Paystack key not configured" },
        { status: 500 }
      );
    }

    // Fetch list of banks from Paystack
    const response = await fetch("https://api.paystack.co/bank", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch banks" },
        { status: 400 }
      );
    }

    // Format banks for dropdown - return name and code
    const banks = data.data.map((bank: { name: string; code: string }) => ({
      code: bank.code,
      name: bank.name,
    }));

    return NextResponse.json({ banks }, { status: 200 });
  } catch (error) {
    console.error("Get banks error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching banks" },
      { status: 500 }
    );
  }
}
