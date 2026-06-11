import { Prisma, StudentStatus } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AppError } from "../middleware/error-handler.middleware";
import { OrderSchema, SortBySchema } from "../validation/student.schemas";

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
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);
  const skip = (page - 1) * limit;

  const statusQuery = req.query.status;
  const classIdQuery = req.query.classId;
  const searchQuery = req.query.search;
  const sortBy = SortBySchema.safeParse(req.query.sortBy).success ? (req.query.sortBy as "createdAt" | "firstName" | "lastName" | "studentCode") : "createdAt";
  const order = OrderSchema.safeParse(req.query.order).success ? (req.query.order as "asc" | "desc") : "desc";

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
    prisma.student.findMany({ where, skip, take: limit, orderBy: { [sortBy]: order } }),
  ]);

  logEvent(req, "student_list_success", "info", { page, limit, total, sortBy, order });

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
};

export const createStudent = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as Record<string, string>;

  const student = await prisma.student.create({
    data: {
      ...payload,
      dateOfBirth: new Date(payload.dateOfBirth),
    },
  });

  logEvent(req, "student_create_success", "info", { studentId: student.id });
  return res.status(201).json(student);
};

export const getStudentById = async (req: Request, res: Response): Promise<Response> => {
  const { studentId } = req.params;
  const student = await prisma.student.findFirst({ where: { id: studentId, deletedAt: null } });

  if (!student) {
    logEvent(req, "student_get_not_found", "warn", { studentId });
    throw new AppError(404, "Student not found");
  }

  logEvent(req, "student_get_success", "info", { studentId });
  return res.json(student);
};

export const updateStudent = async (req: Request, res: Response): Promise<Response> => {
  const { studentId } = req.params;
  const payload = req.body as Record<string, unknown>;

  const existing = await prisma.student.findFirst({ where: { id: studentId, deletedAt: null } });
  if (!existing) {
    logEvent(req, "student_update_not_found", "warn", { studentId });
    throw new AppError(404, "Student not found");
  }

  const updateData: Prisma.StudentUpdateInput = {
    ...payload,
    ...(typeof payload.dateOfBirth === "string" ? { dateOfBirth: new Date(payload.dateOfBirth) } : {}),
  };

  const student = await prisma.student.update({ where: { id: studentId }, data: updateData });
  logEvent(req, "student_update_success", "info", { studentId });
  return res.json(student);
};

export const archiveStudent = async (req: Request, res: Response): Promise<Response> => {
  const { studentId } = req.params;
  const existing = await prisma.student.findFirst({ where: { id: studentId, deletedAt: null } });

  if (!existing) {
    logEvent(req, "student_archive_not_found", "warn", { studentId });
    throw new AppError(404, "Student not found");
  }

  const student = await prisma.student.update({
    where: { id: studentId },
    data: { status: StudentStatus.ARCHIVED, deletedAt: new Date() },
  });

  logEvent(req, "student_archive_success", "info", { studentId });
  return res.json(student);
};

export const restoreStudent = async (req: Request, res: Response): Promise<Response> => {
  const { studentId } = req.params;
  const existing = await prisma.student.findUnique({ where: { id: studentId } });

  if (!existing) {
    logEvent(req, "student_restore_not_found", "warn", { studentId });
    throw new AppError(404, "Student not found");
  }

  if (!existing.deletedAt && existing.status !== StudentStatus.ARCHIVED) {
    logEvent(req, "student_restore_skipped", "warn", { studentId, reason: "already_active" });
    throw new AppError(400, "Student is already active");
  }

  const student = await prisma.student.update({
    where: { id: studentId },
    data: { status: StudentStatus.ACTIVE, deletedAt: null },
  });

  logEvent(req, "student_restore_success", "info", { studentId });
  return res.json(student);
};
