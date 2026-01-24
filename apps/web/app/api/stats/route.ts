import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@scrutis/db";
import { scan } from "@scrutis/db/src/schema";
import { eq, and, sql, inArray } from "drizzle-orm";

// GET /api/stats - Get dashboard statistics for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get total scans count
    const totalScansResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(scan)
      .where(eq(scan.userId, userId));

    const totalScans = Number(totalScansResult[0]?.count || 0);

    // Get clean scans count (result = 'clean')
    const cleanScansResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(scan)
      .where(
        and(
          eq(scan.userId, userId),
          eq(scan.result, "clean")
        )
      );

    const cleanScans = Number(cleanScansResult[0]?.count || 0);

    // Get infected scans count (result = 'infected')
    const infectedScansResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(scan)
      .where(
        and(
          eq(scan.userId, userId),
          eq(scan.result, "infected")
        )
      );

    const infectedScans = Number(infectedScansResult[0]?.count || 0);

    // Get queued/pending scans count
    const queuedScansResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(scan)
      .where(
        and(
          eq(scan.userId, userId),
          inArray(scan.status, ['pending', 'scanning'])
        )
      );

    const queuedScans = Number(queuedScansResult[0]?.count || 0);

    // Calculate infection rate
    const infectionRate = totalScans > 0 
      ? ((infectedScans / totalScans) * 100).toFixed(1) 
      : "0.0";

    return NextResponse.json({
      totalScans,
      cleanScans,
      infectedScans,
      queuedScans,
      infectionRate: `${infectionRate}%`,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
