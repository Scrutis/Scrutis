import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@scrutis/db";
import { scan, project } from "@scrutis/db/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

// GET /api/scans - List all scans for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scans = await db
      .select()
      .from(scan)
      .where(eq(scan.userId, session.user.id))
      .orderBy(desc(scan.createdAt))
      .limit(50);

    return NextResponse.json({ scans });
  } catch (error) {
    console.error("Error fetching scans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/scans - Create a new scan
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, target, projectId, fileHash, fileSize, metadata } = body;

    // Validate required fields
    if (!type || !target) {
      return NextResponse.json(
        { error: "Type and target are required" },
        { status: 400 }
      );
    }

    // Validate type
    if (type !== "file" && type !== "url") {
      return NextResponse.json(
        { error: "Type must be 'file' or 'url'" },
        { status: 400 }
      );
    }

    // Validate projectId if provided
    if (projectId) {
      const projectExists = await db
        .select()
        .from(project)
        .where(eq(project.id, projectId))
        .limit(1);
      
      if (projectExists.length === 0 || projectExists[0]?.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Project not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Create scan
    const scanId = randomUUID();
    const newScan = await db
      .insert(scan)
      .values({
        id: scanId,
        userId: session.user.id,
        projectId: projectId || null,
        type,
        target,
        status: "pending",
        fileHash: fileHash || null,
        fileSize: fileSize || null,
        metadata: metadata || null,
      })
      .returning();

    // Optionally trigger worker to process scan immediately
    // (Worker also polls automatically, so this is optional)
    const workerUrl = process.env.WORKER_API_URL || 'http://localhost:3001';
    fetch(`${workerUrl}/api/scans/process/${scanId}`, {
      method: 'POST',
    }).catch((error) => {
      // Silently fail - worker will pick it up via polling
      console.log('Worker not available, scan will be processed by polling:', error.message);
    });

    return NextResponse.json({ scan: newScan[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating scan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
