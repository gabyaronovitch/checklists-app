import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/checklists - List all checklists with computed stats
export async function GET() {
    try {
        const checklists = await prisma.checklist.findMany({
            orderBy: { updatedAt: "desc" },
            include: {
                category: true,
                steps: {
                    orderBy: { orderIndex: "asc" },
                },
            },
        });

        // Compute stats for each checklist
        const checklistsWithStats = checklists.map((checklist) => {
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

            // Get date range
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

            // Calculate total duration
            const totalDurationMinutes = checklist.steps.reduce(
                (acc, step) => acc + step.durationMinutes,
                0
            );

            return {
                ...checklist,
                stats: {
                    totalSteps,
                    completedSteps: completedSteps.length,
                    completionPercentage,
                    startDatetime,
                    endDatetime,
                    totalDurationMinutes,
                },
            };
        });

        return NextResponse.json(checklistsWithStats);
    } catch (error) {
        console.error("Failed to fetch checklists:", error);
        return NextResponse.json(
            { error: "Failed to fetch checklists" },
            { status: 500 }
        );
    }
}

// POST /api/checklists - Create a new checklist (optionally with steps)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, categoryId, steps } = body;

        if (!title) {
            return NextResponse.json(
                { error: "Checklist title is required" },
                { status: 400 }
            );
        }

        // Create checklist with optional steps
        const checklist = await prisma.checklist.create({
            data: {
                title,
                description: description || null,
                categoryId: categoryId || null,
                isDefault: false,
                steps: steps && steps.length > 0 ? {
                    create: steps.map((step: {
                        title: string;
                        description?: string;
                        durationMinutes?: number;
                        startDatetime?: string;
                        endDatetime?: string;
                        status?: string;
                        comments?: string;
                        orderIndex?: number;
                    }, index: number) => ({
                        title: step.title,
                        description: step.description || null,
                        durationMinutes: step.durationMinutes || 60,
                        startDatetime: step.startDatetime ? new Date(step.startDatetime) : null,
                        endDatetime: step.endDatetime ? new Date(step.endDatetime) : null,
                        status: step.status || "draft",
                        comments: step.comments || null,
                        orderIndex: step.orderIndex ?? index,
                    })),
                } : undefined,
            },
            include: {
                category: true,
                steps: {
                    orderBy: { orderIndex: "asc" },
                },
            },
        });

        return NextResponse.json(checklist, { status: 201 });
    } catch (error) {
        console.error("Failed to create checklist:", error);
        return NextResponse.json(
            { error: "Failed to create checklist" },
            { status: 500 }
        );
    }
}

