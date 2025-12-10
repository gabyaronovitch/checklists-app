import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/checklists/[id]/clone - Clone a checklist with all its steps
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get the original checklist with steps
        const original = await prisma.checklist.findUnique({
            where: { id },
            include: {
                steps: {
                    orderBy: { orderIndex: "asc" },
                },
            },
        });

        if (!original) {
            return NextResponse.json(
                { error: "Checklist not found" },
                { status: 404 }
            );
        }

        // Create the cloned checklist with steps
        const clonedChecklist = await prisma.checklist.create({
            data: {
                title: `${original.title} (Copy)`,
                description: original.description,
                categoryId: original.categoryId,
                isDefault: false, // Clones are never default
                steps: {
                    create: original.steps.map((step) => ({
                        title: step.title,
                        description: step.description,
                        durationMinutes: step.durationMinutes,
                        status: "draft", // Reset status to draft
                        comments: null, // Clear comments
                        orderIndex: step.orderIndex,
                    })),
                },
            },
            include: {
                category: true,
                steps: {
                    orderBy: { orderIndex: "asc" },
                },
            },
        });

        return NextResponse.json(clonedChecklist, { status: 201 });
    } catch (error) {
        console.error("Failed to clone checklist:", error);
        return NextResponse.json(
            { error: "Failed to clone checklist" },
            { status: 500 }
        );
    }
}
