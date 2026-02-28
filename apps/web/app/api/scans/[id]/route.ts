import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@scrutis/db";
import { scan, scanResult, project } from "@scrutis/db/schema";
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

    const scanData = scans[0]!;

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

// PATCH /api/scans/[id] - Update scan metadata (e.g., project)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { projectId } = body as { projectId?: string | null };

    const scans = await db
      .select()
      .from(scan)
      .where(eq(scan.id, id))
      .limit(1);

    if (scans.length === 0) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    const scanData = scans[0]!;
    if (scanData.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (projectId) {
      const projects = await db
        .select()
        .from(project)
        .where(eq(project.id, projectId))
        .limit(1);

      if (projects.length === 0 || projects[0]!.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Project not found or access denied" },
          { status: 404 }
        );
      }
    }

    const updated = await db
      .update(scan)
      .set({
        projectId: projectId || null,
        updatedAt: new Date(),
      })
      .where(eq(scan.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    return NextResponse.json({ scan: updated[0] });
  } catch (error) {
    console.error("Error updating scan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
