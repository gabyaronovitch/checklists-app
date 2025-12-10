import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/steps/reorder - Reorder steps via drag-and-drop
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { checklistId, stepIds } = body;

        if (!checklistId || !stepIds || !Array.isArray(stepIds)) {
            return NextResponse.json(
                { error: "checklistId and stepIds array are required" },
                { status: 400 }
            );
        }

        // Check if checklist is default
        const checklist = await prisma.checklist.findUnique({
            where: { id: checklistId },
        });

        if (!checklist) {
            return NextResponse.json(
                { error: "Checklist not found" },
                { status: 404 }
            );
        }

        if (checklist.isDefault) {
            return NextResponse.json(
                { error: "Cannot reorder steps in default checklists" },
                { status: 403 }
            );
        }

        // Update order indexes based on the new order
        await Promise.all(
            stepIds.map((stepId: string, index: number) =>
                prisma.step.update({
                    where: { id: stepId },
                    data: { orderIndex: index },
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to reorder steps:", error);
        return NextResponse.json(
            { error: "Failed to reorder steps" },
            { status: 500 }
        );
    }
}
