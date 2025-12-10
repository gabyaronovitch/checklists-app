import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/steps/[id] - Update a step
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const {
            title,
            description,
            durationMinutes,
            startDatetime,
            endDatetime,
            status,
            comments,
        } = body;

        // Check if the step's checklist is default
        const existing = await prisma.step.findUnique({
            where: { id },
            include: { checklist: true },
        });

        if (!existing) {
            return NextResponse.json({ error: "Step not found" }, { status: 404 });
        }

        if (existing.checklist.isDefault) {
            return NextResponse.json(
                { error: "Cannot edit steps in default checklists" },
                { status: 403 }
            );
        }

        const step = await prisma.step.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(durationMinutes !== undefined && { durationMinutes }),
                ...(startDatetime !== undefined && {
                    startDatetime: startDatetime ? new Date(startDatetime) : null,
                }),
                ...(endDatetime !== undefined && {
                    endDatetime: endDatetime ? new Date(endDatetime) : null,
                }),
                ...(status !== undefined && { status }),
                ...(comments !== undefined && { comments }),
            },
        });

        return NextResponse.json(step);
    } catch (error) {
        console.error("Failed to update step:", error);
        return NextResponse.json(
            { error: "Failed to update step" },
            { status: 500 }
        );
    }
}

// DELETE /api/steps/[id] - Delete a step
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if the step's checklist is default
        const existing = await prisma.step.findUnique({
            where: { id },
            include: { checklist: true },
        });

        if (!existing) {
            return NextResponse.json({ error: "Step not found" }, { status: 404 });
        }

        if (existing.checklist.isDefault) {
            return NextResponse.json(
                { error: "Cannot delete steps from default checklists" },
                { status: 403 }
            );
        }

        await prisma.step.delete({
            where: { id },
        });

        // Re-order remaining steps
        const remainingSteps = await prisma.step.findMany({
            where: { checklistId: existing.checklistId },
            orderBy: { orderIndex: "asc" },
        });

        await Promise.all(
            remainingSteps.map((step, index) =>
                prisma.step.update({
                    where: { id: step.id },
                    data: { orderIndex: index },
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete step:", error);
        return NextResponse.json(
            { error: "Failed to delete step" },
            { status: 500 }
        );
    }
}
