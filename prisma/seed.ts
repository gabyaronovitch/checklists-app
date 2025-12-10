import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Use the same database path as prisma.config.ts
const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: databaseUrl.replace("file:", "") });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding database...");

    // Delete all non-default checklists to ensure fresh install only has defaults
    // Steps are automatically deleted due to CASCADE
    const deletedCount = await prisma.checklist.deleteMany({
        where: { isDefault: false },
    });
    if (deletedCount.count > 0) {
        console.log(`Deleted ${deletedCount.count} non-default checklist(s)`);
    }

    // Create default categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { name: "Business Analysis" },
            update: {},
            create: { name: "Business Analysis", color: "#3b82f6" }, // blue
        }),
        prisma.category.upsert({
            where: { name: "Marketing" },
            update: {},
            create: { name: "Marketing", color: "#10b981" }, // green
        }),
        prisma.category.upsert({
            where: { name: "Development" },
            update: {},
            create: { name: "Development", color: "#8b5cf6" }, // purple
        }),
        prisma.category.upsert({
            where: { name: "Quality Assurance" },
            update: {},
            create: { name: "Quality Assurance", color: "#f59e0b" }, // amber
        }),
    ]);

    const [businessAnalysis, marketing] = categories;

    // Check if default checklists already exist
    const existingDefaults = await prisma.checklist.count({
        where: { isDefault: true },
    });

    if (existingDefaults === 0) {
        // Create Project Launch Checklist
        const projectLaunch = await prisma.checklist.create({
            data: {
                title: "Project Launch Checklist",
                description:
                    "A comprehensive checklist for launching a new project successfully",
                categoryId: businessAnalysis.id,
                isDefault: true,
                steps: {
                    create: [
                        {
                            title: "Define Project Scope",
                            description:
                                "Document the project objectives, deliverables, and boundaries",
                            durationMinutes: 240,
                            status: "draft",
                            orderIndex: 0,
                        },
                        {
                            title: "Identify Stakeholders",
                            description:
                                "List all project stakeholders and their roles/responsibilities",
                            durationMinutes: 120,
                            status: "draft",
                            orderIndex: 1,
                        },
                        {
                            title: "Create Project Timeline",
                            description:
                                "Develop a detailed timeline with milestones and deadlines",
                            durationMinutes: 180,
                            status: "draft",
                            orderIndex: 2,
                        },
                        {
                            title: "Allocate Resources",
                            description: "Assign team members, budget, and tools needed",
                            durationMinutes: 120,
                            status: "draft",
                            orderIndex: 3,
                        },
                        {
                            title: "Design System Architecture",
                            description: "Create technical design and architecture documents",
                            durationMinutes: 480,
                            status: "draft",
                            orderIndex: 4,
                        },
                        {
                            title: "Development Phase",
                            description: "Implement core features according to specifications",
                            durationMinutes: 960,
                            status: "draft",
                            orderIndex: 5,
                        },
                        {
                            title: "Internal Testing",
                            description: "Perform unit tests, integration tests, and QA review",
                            durationMinutes: 480,
                            status: "draft",
                            orderIndex: 6,
                        },
                        {
                            title: "User Acceptance Testing",
                            description: "Conduct UAT with stakeholders and gather feedback",
                            durationMinutes: 240,
                            status: "draft",
                            orderIndex: 7,
                        },
                        {
                            title: "Prepare Launch Documentation",
                            description: "Create user guides, release notes, and support docs",
                            durationMinutes: 180,
                            status: "draft",
                            orderIndex: 8,
                        },
                        {
                            title: "Deploy to Production",
                            description: "Execute deployment plan and verify system health",
                            durationMinutes: 120,
                            status: "draft",
                            orderIndex: 9,
                        },
                    ],
                },
            },
        });

        // Create Marketing Campaign Checklist
        const marketingCampaign = await prisma.checklist.create({
            data: {
                title: "Marketing Campaign Checklist",
                description:
                    "Step-by-step guide for planning and executing marketing campaigns",
                categoryId: marketing.id,
                isDefault: true,
                steps: {
                    create: [
                        {
                            title: "Define Campaign Objectives",
                            description:
                                "Set clear, measurable goals for the campaign (awareness, leads, sales)",
                            durationMinutes: 120,
                            status: "draft",
                            orderIndex: 0,
                        },
                        {
                            title: "Identify Target Audience",
                            description:
                                "Research and define buyer personas and audience segments",
                            durationMinutes: 180,
                            status: "draft",
                            orderIndex: 1,
                        },
                        {
                            title: "Develop Key Messages",
                            description:
                                "Create compelling value propositions and messaging framework",
                            durationMinutes: 240,
                            status: "draft",
                            orderIndex: 2,
                        },
                        {
                            title: "Create Content Assets",
                            description:
                                "Produce blog posts, graphics, videos, and other campaign materials",
                            durationMinutes: 480,
                            status: "draft",
                            orderIndex: 3,
                        },
                        {
                            title: "Select Distribution Channels",
                            description:
                                "Choose appropriate channels (social, email, paid, organic)",
                            durationMinutes: 90,
                            status: "draft",
                            orderIndex: 4,
                        },
                        {
                            title: "Set Up Tracking",
                            description:
                                "Configure analytics, UTM parameters, and conversion tracking",
                            durationMinutes: 120,
                            status: "draft",
                            orderIndex: 5,
                        },
                        {
                            title: "Launch Campaign",
                            description: "Execute the campaign across all selected channels",
                            durationMinutes: 60,
                            status: "draft",
                            orderIndex: 6,
                        },
                        {
                            title: "Monitor & Optimize",
                            description:
                                "Track performance metrics and adjust strategy as needed",
                            durationMinutes: 240,
                            status: "draft",
                            orderIndex: 7,
                        },
                    ],
                },
            },
        });

        // Create Root-Cause Analysis Checklist
        const rootCauseAnalysis = await prisma.checklist.create({
            data: {
                title: "Root-Cause Analysis",
                description:
                    "Systematic approach to identify the underlying causes of problems",
                categoryId: businessAnalysis.id,
                isDefault: true,
                steps: {
                    create: [
                        {
                            title: "Define the Problem",
                            description:
                                "Clearly state what happened, when, where, and impact",
                            durationMinutes: 60,
                            status: "draft",
                            orderIndex: 0,
                        },
                        {
                            title: "Collect Data",
                            description:
                                "Gather all relevant information, logs, reports, and observations",
                            durationMinutes: 180,
                            status: "draft",
                            orderIndex: 1,
                        },
                        {
                            title: "Identify Possible Causes",
                            description:
                                "Brainstorm potential causes using techniques like 5 Whys or Fishbone",
                            durationMinutes: 120,
                            status: "draft",
                            orderIndex: 2,
                        },
                        {
                            title: "Analyze Root Cause",
                            description:
                                "Determine the fundamental cause by analyzing evidence",
                            durationMinutes: 180,
                            status: "draft",
                            orderIndex: 3,
                        },
                        {
                            title: "Develop Solutions",
                            description:
                                "Create corrective and preventive action plans",
                            durationMinutes: 120,
                            status: "draft",
                            orderIndex: 4,
                        },
                        {
                            title: "Implement & Verify",
                            description:
                                "Execute solutions and monitor to ensure problem is resolved",
                            durationMinutes: 240,
                            status: "draft",
                            orderIndex: 5,
                        },
                    ],
                },
            },
        });

        console.log("Created default checklists:", {
            projectLaunch: projectLaunch.id,
            marketingCampaign: marketingCampaign.id,
            rootCauseAnalysis: rootCauseAnalysis.id,
        });
    } else {
        console.log("Default checklists already exist, skipping...");
    }

    console.log("Seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
