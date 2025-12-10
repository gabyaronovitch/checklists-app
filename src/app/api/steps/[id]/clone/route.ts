import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/steps/[id]/clone - Clone a step
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get the original step
        const original = await prisma.step.findUnique({
            where: { id },
            include: { checklist: true },
        });

        if (!original) {
            return NextResponse.json({ error: "Step not found" }, { status: 404 });
        }

        if (original.checklist.isDefault) {
            return NextResponse.json(
                { error: "Cannot clone steps in default checklists" },
                { status: 403 }
            );
        }

        // Shift all steps after the original
        await prisma.step.updateMany({
            where: {
                checklistId: original.checklistId,
                orderIndex: { gt: original.orderIndex },
            },
            data: {
                orderIndex: { increment: 1 },
            },
        });

        // Create the cloned step right after the original
        const clonedStep = await prisma.step.create({
            data: {
                checklistId: original.checklistId,
                title: `${original.title} (Copy)`,
                description: original.description,
                durationMinutes: original.durationMinutes,
                status: "draft",
                orderIndex: original.orderIndex + 1,
            },
        });

        return NextResponse.json(clonedStep, { status: 201 });
    } catch (error) {
        console.error("Failed to clone step:", error);
        return NextResponse.json(
            { error: "Failed to clone step" },
            { status: 500 }
        );
    }
}
