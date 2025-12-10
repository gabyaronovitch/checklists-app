import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/checklists/[id]/steps - List all steps for a checklist
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const steps = await prisma.step.findMany({
            where: { checklistId: id },
            orderBy: { orderIndex: "asc" },
        });

        return NextResponse.json(steps);
    } catch (error) {
        console.error("Failed to fetch steps:", error);
        return NextResponse.json(
            { error: "Failed to fetch steps" },
            { status: 500 }
        );
    }
}

// POST /api/checklists/[id]/steps - Create a new step
export async function POST(
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
            status,
            orderIndex,
            insertAfter,
            insertBefore,
        } = body;

        // Check if checklist exists and is not default
        const checklist = await prisma.checklist.findUnique({
            where: { id },
            include: { steps: true },
        });

        if (!checklist) {
            return NextResponse.json(
                { error: "Checklist not found" },
                { status: 404 }
            );
        }

        if (checklist.isDefault) {
            return NextResponse.json(
                { error: "Cannot add steps to default checklists" },
                { status: 403 }
            );
        }

        // Calculate order index
        let newOrderIndex: number;

        if (insertAfter !== undefined) {
            // Insert after a specific step
            const targetStep = checklist.steps.find((s) => s.id === insertAfter);
            if (!targetStep) {
                return NextResponse.json(
                    { error: "Target step not found" },
                    { status: 400 }
                );
            }
            newOrderIndex = targetStep.orderIndex + 1;
            // Shift all steps after this one
            await prisma.step.updateMany({
                where: {
                    checklistId: id,
                    orderIndex: { gte: newOrderIndex },
                },
                data: {
                    orderIndex: { increment: 1 },
                },
            });
        } else if (insertBefore !== undefined) {
            // Insert before a specific step
            const targetStep = checklist.steps.find((s) => s.id === insertBefore);
            if (!targetStep) {
                return NextResponse.json(
                    { error: "Target step not found" },
                    { status: 400 }
                );
            }
            newOrderIndex = targetStep.orderIndex;
            // Shift all steps at or after this one
            await prisma.step.updateMany({
                where: {
                    checklistId: id,
                    orderIndex: { gte: newOrderIndex },
                },
                data: {
                    orderIndex: { increment: 1 },
                },
            });
        } else if (orderIndex !== undefined) {
            newOrderIndex = orderIndex;
        } else {
            // Add at the end
            const maxOrder = Math.max(
                ...checklist.steps.map((s) => s.orderIndex),
                -1
            );
            newOrderIndex = maxOrder + 1;
        }

        const step = await prisma.step.create({
            data: {
                checklistId: id,
                title: title || "New Step",
                description: description || null,
                durationMinutes: durationMinutes || 60,
                status: status || "draft",
                orderIndex: newOrderIndex,
            },
        });

        return NextResponse.json(step, { status: 201 });
    } catch (error) {
        console.error("Failed to create step:", error);
        return NextResponse.json(
            { error: "Failed to create step" },
            { status: 500 }
        );
    }
}
