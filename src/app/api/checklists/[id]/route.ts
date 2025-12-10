import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/checklists/[id] - Get a single checklist with steps
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const checklist = await prisma.checklist.findUnique({
            where: { id },
            include: {
                category: true,
                steps: {
                    orderBy: { orderIndex: "asc" },
                },
            },
        });

        if (!checklist) {
            return NextResponse.json(
                { error: "Checklist not found" },
                { status: 404 }
            );
        }

        // Compute stats
        const nonRejectedSteps = checklist.steps.filter(
            (step) => step.status !== "rejected"
        );
        const completedSteps = nonRejectedSteps.filter(
            (step) => step.status === "completed"
        );
        const totalSteps = nonRejectedSteps.length;
        const completionPercentage =
            totalSteps > 0
                ? Math.round((completedSteps.length / totalSteps) * 100)
                : 0;

        const stepsWithStart = checklist.steps.filter((s) => s.startDatetime);
        const stepsWithEnd = checklist.steps.filter((s) => s.endDatetime);
        const startDatetime = stepsWithStart.length
            ? new Date(
                Math.min(...stepsWithStart.map((s) => s.startDatetime!.getTime()))
            )
            : null;
        const endDatetime = stepsWithEnd.length
            ? new Date(
                Math.max(...stepsWithEnd.map((s) => s.endDatetime!.getTime()))
            )
            : null;

        const totalDurationMinutes = checklist.steps.reduce(
            (acc, step) => acc + step.durationMinutes,
            0
        );

        return NextResponse.json({
            ...checklist,
            stats: {
                totalSteps,
                completedSteps: completedSteps.length,
                completionPercentage,
                startDatetime,
                endDatetime,
                totalDurationMinutes,
            },
        });
    } catch (error) {
        console.error("Failed to fetch checklist:", error);
        return NextResponse.json(
            { error: "Failed to fetch checklist" },
            { status: 500 }
        );
    }
}

// PUT /api/checklists/[id] - Update a checklist
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description, categoryId } = body;

        // Check if it's a default checklist
        const existing = await prisma.checklist.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Checklist not found" },
                { status: 404 }
            );
        }

        if (existing.isDefault) {
            return NextResponse.json(
                { error: "Cannot edit default checklists" },
                { status: 403 }
            );
        }

        const checklist = await prisma.checklist.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(categoryId !== undefined && { categoryId }),
            },
            include: {
                category: true,
                steps: {
                    orderBy: { orderIndex: "asc" },
                },
            },
        });

        return NextResponse.json(checklist);
    } catch (error) {
        console.error("Failed to update checklist:", error);
        return NextResponse.json(
            { error: "Failed to update checklist" },
            { status: 500 }
        );
    }
}

// DELETE /api/checklists/[id] - Delete a checklist
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if it's a default checklist
        const existing = await prisma.checklist.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Checklist not found" },
                { status: 404 }
            );
        }

        if (existing.isDefault) {
            return NextResponse.json(
                { error: "Cannot delete default checklists" },
                { status: 403 }
            );
        }

        // Steps are deleted automatically due to onDelete: Cascade
        await prisma.checklist.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete checklist:", error);
        return NextResponse.json(
            { error: "Failed to delete checklist" },
            { status: 500 }
        );
    }
}
