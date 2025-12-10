import { Step, StepStatus } from "./types";

// CSV column headers (all Step fields except checklistId)
export const CSV_HEADERS = [
    "title",
    "description",
    "durationMinutes",
    "startDatetime",
    "endDatetime",
    "status",
    "comments",
    "orderIndex",
];

// Valid step statuses
const VALID_STATUSES: StepStatus[] = ["draft", "started", "paused", "rejected", "completed"];

export interface CSVParseResult {
    success: boolean;
    steps: Partial<Step>[];
    errors: string[];
}

/**
 * Validate that the file is a valid CSV
 */
export function validateCSVFile(file: File): { valid: boolean; error?: string } {
    // Check file extension
    if (!file.name.toLowerCase().endsWith(".csv")) {
        return { valid: false, error: "File must have a .csv extension" };
    }

    // Check MIME type (browsers may report different types for CSV)
    const validMimeTypes = [
        "text/csv",
        "text/plain",
        "application/csv",
        "application/vnd.ms-excel",
    ];
    if (!validMimeTypes.includes(file.type) && file.type !== "") {
        return { valid: false, error: `Invalid file type: ${file.type}. Expected CSV file.` };
    }

    // Check file size (max 1MB for safety)
    const maxSize = 1024 * 1024; // 1MB
    if (file.size > maxSize) {
        return { valid: false, error: "File is too large. Maximum size is 1MB." };
    }

    return { valid: true };
}

/**
 * Parse CSV content into step data
 */
export function parseCSV(content: string): CSVParseResult {
    const errors: string[] = [];
    const steps: Partial<Step>[] = [];

    // Split into lines and remove empty lines
    const lines = content.split(/\r?\n/).filter((line) => line.trim());

    if (lines.length === 0) {
        return { success: false, steps: [], errors: ["CSV file is empty"] };
    }

    // Parse header row
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map((h) => h.toLowerCase().trim());

    // Validate required header: title
    if (!headers.includes("title")) {
        return {
            success: false,
            steps: [],
            errors: ["CSV must include a 'title' column"],
        };
    }

    // Create header index map
    const headerIndex: Record<string, number> = {};
    headers.forEach((header, index) => {
        headerIndex[header] = index;
    });

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values = parseCSVLine(line);
        const rowNum = i + 1;

        try {
            const step = parseStepRow(values, headerIndex, rowNum);
            if (step) {
                steps.push(step);
            }
        } catch (error) {
            errors.push(`Row ${rowNum}: ${error instanceof Error ? error.message : "Parse error"}`);
        }
    }

    if (steps.length === 0 && errors.length === 0) {
        errors.push("No valid steps found in CSV");
    }

    return {
        success: errors.length === 0 && steps.length > 0,
        steps,
        errors,
    };
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (inQuotes) {
            if (char === '"' && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else if (char === '"') {
                // End of quoted value
                inQuotes = false;
            } else {
                current += char;
            }
        } else {
            if (char === '"') {
                // Start of quoted value
                inQuotes = true;
            } else if (char === ",") {
                // End of field
                result.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }
    }

    // Add last field
    result.push(current.trim());

    return result;
}

/**
 * Parse a single row into a Step object
 */
function parseStepRow(
    values: string[],
    headerIndex: Record<string, number>,
    rowNum: number
): Partial<Step> | null {
    const getValue = (field: string): string | undefined => {
        const index = headerIndex[field];
        return index !== undefined ? values[index] : undefined;
    };

    const title = getValue("title");
    if (!title || !title.trim()) {
        throw new Error("Title is required");
    }

    const step: Partial<Step> = {
        title: title.trim(),
    };

    // Optional fields
    const description = getValue("description");
    if (description) {
        step.description = description;
    }

    const durationMinutes = getValue("durationminutes");
    if (durationMinutes) {
        const parsed = parseInt(durationMinutes, 10);
        if (isNaN(parsed) || parsed < 0) {
            throw new Error(`Invalid durationMinutes: ${durationMinutes}`);
        }
        step.durationMinutes = parsed;
    }

    const startDatetime = getValue("startdatetime");
    if (startDatetime) {
        const date = new Date(startDatetime);
        if (isNaN(date.getTime())) {
            throw new Error(`Invalid startDatetime: ${startDatetime}`);
        }
        step.startDatetime = date.toISOString();
    }

    const endDatetime = getValue("enddatetime");
    if (endDatetime) {
        const date = new Date(endDatetime);
        if (isNaN(date.getTime())) {
            throw new Error(`Invalid endDatetime: ${endDatetime}`);
        }
        step.endDatetime = date.toISOString();
    }

    const status = getValue("status");
    if (status) {
        const normalizedStatus = status.toLowerCase().trim() as StepStatus;
        if (!VALID_STATUSES.includes(normalizedStatus)) {
            throw new Error(`Invalid status: ${status}. Valid values: ${VALID_STATUSES.join(", ")}`);
        }
        step.status = normalizedStatus;
    }

    const comments = getValue("comments");
    if (comments) {
        step.comments = comments;
    }

    const orderIndex = getValue("orderindex");
    if (orderIndex) {
        const parsed = parseInt(orderIndex, 10);
        if (isNaN(parsed) || parsed < 0) {
            throw new Error(`Invalid orderIndex: ${orderIndex}`);
        }
        step.orderIndex = parsed;
    }

    return step;
}

/**
 * Convert steps to CSV string for export
 */
export function stepsToCSV(steps: Step[]): string {
    const lines: string[] = [];

    // Header row
    lines.push(CSV_HEADERS.join(","));

    // Data rows
    for (const step of steps) {
        const row = [
            escapeCSVValue(step.title),
            escapeCSVValue(step.description || ""),
            step.durationMinutes.toString(),
            step.startDatetime || "",
            step.endDatetime || "",
            step.status,
            escapeCSVValue(step.comments || ""),
            step.orderIndex.toString(),
        ];
        lines.push(row.join(","));
    }

    return lines.join("\n");
}

/**
 * Escape a value for CSV (quote if contains comma, newline, or quote)
 */
function escapeCSVValue(value: string): string {
    if (value.includes(",") || value.includes("\n") || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

/**
 * Trigger download of CSV file
 */
export function downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
