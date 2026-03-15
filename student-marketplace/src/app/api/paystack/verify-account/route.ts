import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { accountNumber, bankName } = await req.json();

    if (!accountNumber || !bankName) {
      return NextResponse.json(
        { error: "Account number and bank name are required" },
        { status: 400 }
      );
    }

    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey) {
      return NextResponse.json(
        { error: "Paystack key not configured" },
        { status: 500 }
      );
    }

    // First, get the bank code from bank name
    const bankListResponse = await fetch("https://api.paystack.co/bank", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
      },
    });

    const bankListData = await bankListResponse.json();
    const bank = bankListData.data.find(
      (b: { name: string }) => b.name.toLowerCase() === bankName.toLowerCase()
    );

    if (!bank) {
      return NextResponse.json(
        { error: "Bank not found" },
        { status: 400 }
      );
    }

    // Now verify the account with the bank code
    const verifyResponse = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bank.code}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackKey}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      return NextResponse.json(
        { error: verifyData.message || "Failed to verify account" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        accountHolderName: verifyData.data.account_name,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Paystack verification error:", error);
    return NextResponse.json(
      { error: "An error occurred while verifying account" },
      { status: 500 }
    );
  }
}
