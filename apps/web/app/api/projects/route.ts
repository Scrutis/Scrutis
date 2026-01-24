import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@scrutis/db";
import { project } from "@scrutis/db/src/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

// GET /api/projects - List all projects for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await db
      .select()
      .from(project)
      .where(eq(project.userId, session.user.id))
      .orderBy(desc(project.createdAt));

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    const projectId = randomUUID();
    const newProject = await db
      .insert(project)
      .values({
        id: projectId,
        userId: session.user.id,
        name,
        description: description || null,
      })
      .returning();

    return NextResponse.json({ project: newProject[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
