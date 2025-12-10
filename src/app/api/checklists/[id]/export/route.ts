import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/checklists/[id]/export - Export steps as CSV
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const checklist = await prisma.checklist.findUnique({
            where: { id },
            include: {
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

        // CSV headers
        const headers = [
            "title",
            "description",
            "durationMinutes",
            "startDatetime",
            "endDatetime",
            "status",
            "comments",
            "orderIndex",
        ];

        // Build CSV content
        const lines: string[] = [headers.join(",")];

        for (const step of checklist.steps) {
            const row = [
                escapeCSV(step.title),
                escapeCSV(step.description || ""),
                step.durationMinutes.toString(),
                step.startDatetime ? step.startDatetime.toISOString() : "",
                step.endDatetime ? step.endDatetime.toISOString() : "",
                step.status,
                escapeCSV(step.comments || ""),
                step.orderIndex.toString(),
            ];
            lines.push(row.join(","));
        }

        const csvContent = lines.join("\n");

        // Create safe filename
        const safeTitle = checklist.title
            .replace(/[^a-z0-9]/gi, "_")
            .substring(0, 50);
        const filename = `${safeTitle}_steps.csv`;

        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json(
            { error: "Failed to export checklist" },
            { status: 500 }
        );
    }
}

function escapeCSV(value: string): string {
    if (value.includes(",") || value.includes("\n") || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}
