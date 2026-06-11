import { Prisma, StudentStatus } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma";

const CreateStudentSchema = z.object({
  userId: z.string().min(1),
  studentCode: z.string().min(1),
  rollNumber: z.string().min(1),
  admissionNumber: z.string().min(1),
  classId: z.string().min(1),
  sectionId: z.string().min(1),
  departmentId: z.string().min(1),
  academicYearId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().min(1),
  gender: z.string().min(1),
  phone: z.string().optional(),
});

const UpdateStudentSchema = z
  .object({
    studentCode: z.string().min(1).optional(),
    rollNumber: z.string().min(1).optional(),
    admissionNumber: z.string().min(1).optional(),
    classId: z.string().min(1).optional(),
    sectionId: z.string().min(1).optional(),
    departmentId: z.string().min(1).optional(),
    academicYearId: z.string().min(1).optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    dateOfBirth: z.string().min(1).optional(),
    gender: z.string().min(1).optional(),
    phone: z.string().nullable().optional(),
    status: z.nativeEnum(StudentStatus).optional(),
  })
  .strict();

const SortBySchema = z.enum(["createdAt", "firstName", "lastName", "studentCode"]);
const OrderSchema = z.enum(["asc", "desc"]);

const logEvent = (req: Request, type: string, level: "info" | "warn" | "error", extra?: Record<string, unknown>): void => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: "student-service",
      type,
      level,
      requestId: req.headers["x-request-id"] ?? null,
      method: req.method,
      path: req.originalUrl,
      ...extra,
    }),
  );
};

export const listStudents = async (req: Request, res: Response): Promise<Response> => {
  try {
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);
    const skip = (page - 1) * limit;

    const statusQuery = req.query.status;
    const classIdQuery = req.query.classId;
    const searchQuery = req.query.search;
    const sortBy = SortBySchema.safeParse(req.query.sortBy).success ? (req.query.sortBy as z.infer<typeof SortBySchema>) : "createdAt";
    const order = OrderSchema.safeParse(req.query.order).success ? (req.query.order as z.infer<typeof OrderSchema>) : "desc";

    const where: Prisma.StudentWhereInput = {
      deletedAt: null,
      ...(typeof statusQuery === "string" && Object.values(StudentStatus).includes(statusQuery as StudentStatus)
        ? { status: statusQuery as StudentStatus }
        : {}),
      ...(typeof classIdQuery === "string" && classIdQuery.trim().length > 0
        ? { classId: classIdQuery.trim() }
        : {}),
      ...(typeof searchQuery === "string" && searchQuery.trim().length > 0
        ? {
            OR: [
              { firstName: { contains: searchQuery.trim(), mode: "insensitive" } },
              { lastName: { contains: searchQuery.trim(), mode: "insensitive" } },
              { studentCode: { contains: searchQuery.trim(), mode: "insensitive" } },
              { admissionNumber: { contains: searchQuery.trim(), mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
    ]);

    logEvent(req, "student_list_success", "info", {
      page,
      limit,
      count: students.length,
      total,
      sortBy,
      order,
    });

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      filters: {
        status: typeof statusQuery === "string" ? statusQuery : null,
        classId: typeof classIdQuery === "string" ? classIdQuery : null,
        search: typeof searchQuery === "string" ? searchQuery : null,
      },
      sort: { sortBy, order },
      data: students,
    });
  } catch (err) {
    logEvent(req, "student_list_error", "error", { error: err instanceof Error ? err.message : "Unknown error" });
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createStudent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const parsed = CreateStudentSchema.safeParse(req.body);

    if (!parsed.success) {
      logEvent(req, "student_create_validation_failed", "warn", { reason: "invalid_payload" });
      return res.status(400).json({ error: "Invalid student payload", issues: parsed.error.flatten() });
    }

    const student = await prisma.student.create({
      data: {
        ...parsed.data,
        dateOfBirth: new Date(parsed.data.dateOfBirth),
      },
    });

    logEvent(req, "student_create_success", "info", { studentId: student.id });
    return res.status(201).json(student);
  } catch (err) {
    logEvent(req, "student_create_error", "error", { error: err instanceof Error ? err.message : "Unknown error" });
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getStudentById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { studentId } = req.params;

    const student = await prisma.student.findFirst({ where: { id: studentId, deletedAt: null } });

    if (!student) {
      logEvent(req, "student_get_not_found", "warn", { studentId });
      return res.status(404).json({ error: "Student not found" });
    }

    logEvent(req, "student_get_success", "info", { studentId });
    return res.json(student);
  } catch (err) {
    logEvent(req, "student_get_error", "error", { error: err instanceof Error ? err.message : "Unknown error" });
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateStudent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { studentId } = req.params;

    const parsed = UpdateStudentSchema.safeParse(req.body);

    if (!parsed.success) {
      logEvent(req, "student_update_validation_failed", "warn", { reason: "invalid_payload", studentId });
      return res.status(400).json({ error: "Invalid update payload", issues: parsed.error.flatten() });
    }

    const existing = await prisma.student.findFirst({ where: { id: studentId, deletedAt: null } });

    if (!existing) {
      logEvent(req, "student_update_not_found", "warn", { studentId });
      return res.status(404).json({ error: "Student not found" });
    }

    const updateData: Prisma.StudentUpdateInput = {
      ...parsed.data,
      ...(parsed.data.dateOfBirth ? { dateOfBirth: new Date(parsed.data.dateOfBirth) } : {}),
    };

    const student = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
    });

    logEvent(req, "student_update_success", "info", { studentId });
    return res.json(student);
  } catch (err) {
    logEvent(req, "student_update_error", "error", { error: err instanceof Error ? err.message : "Unknown error" });
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const archiveStudent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { studentId } = req.params;

    const existing = await prisma.student.findFirst({ where: { id: studentId, deletedAt: null } });

    if (!existing) {
      logEvent(req, "student_archive_not_found", "warn", { studentId });
      return res.status(404).json({ error: "Student not found" });
    }

    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        status: StudentStatus.ARCHIVED,
        deletedAt: new Date(),
      },
    });

    logEvent(req, "student_archive_success", "info", { studentId });
    return res.json(student);
  } catch (err) {
    logEvent(req, "student_archive_error", "error", { error: err instanceof Error ? err.message : "Unknown error" });
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const restoreStudent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { studentId } = req.params;

    const existing = await prisma.student.findUnique({ where: { id: studentId } });

    if (!existing) {
      logEvent(req, "student_restore_not_found", "warn", { studentId });
      return res.status(404).json({ error: "Student not found" });
    }

    if (!existing.deletedAt && existing.status !== StudentStatus.ARCHIVED) {
      logEvent(req, "student_restore_skipped", "warn", { studentId, reason: "already_active" });
      return res.status(400).json({ error: "Student is already active" });
    }

    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        status: StudentStatus.ACTIVE,
        deletedAt: null,
      },
    });

    logEvent(req, "student_restore_success", "info", { studentId });
    return res.json(student);
  } catch (err) {
    logEvent(req, "student_restore_error", "error", { error: err instanceof Error ? err.message : "Unknown error" });
    return res.status(500).json({ error: "Internal server error" });
  }
};
