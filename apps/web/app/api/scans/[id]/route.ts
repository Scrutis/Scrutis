import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@scrutis/db";
import { scan, scanResult } from "@scrutis/db/src/schema";
import { eq } from "drizzle-orm";

// GET /api/scans/[id] - Get a specific scan with its results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    const scans = await db
      .select()
      .from(scan)
      .where(eq(scan.id, id))
      .limit(1);

    if (scans.length === 0) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    const scanData = scans[0];

    // Check if user owns this scan
    if (scanData.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get scan results
    const results = await db
      .select()
      .from(scanResult)
      .where(eq(scanResult.scanId, id));

    return NextResponse.json({
      scan: scanData,
      results,
    });
  } catch (error) {
    console.error("Error fetching scan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
