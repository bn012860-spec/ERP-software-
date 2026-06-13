import { Prisma, StudentStatus } from "@prisma/client";
import { Request, Response } from "express";
import { ErrorCode, ResourceStatus, buildPaginationMeta, logError, logInfo, logWarn, sendSuccess } from "@erp/shared";
import prisma from "../config/prisma";
import { AppError } from "../middleware/error-handler.middleware";
import { OrderSchema, SortBySchema } from "../validation/student.schemas";

const getRequestId = (req: Request): string | null =>
  typeof req.headers["x-request-id"] === "string" ? req.headers["x-request-id"] : null;

const logEvent = (req: Request, type: string, level: "info" | "warn" | "error", extra?: Record<string, unknown>): void => {
  const payload = {
    service: "student-service",
    type,
    requestId: getRequestId(req),
    method: req.method,
    path: req.originalUrl,
    ...extra,
  };

  if (level === "error") {
    logError(payload);
    return;
  }

  if (level === "warn") {
    logWarn(payload);
    return;
  }

  logInfo(payload);
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

  return sendSuccess(res, students, {
    pagination: buildPaginationMeta(page, limit, total),
    filters: {
      status: typeof statusQuery === "string" ? statusQuery : null,
      classId: typeof classIdQuery === "string" ? classIdQuery : null,
      search: typeof searchQuery === "string" ? searchQuery : null,
    },
    sort: { sortBy, order },
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
  return sendSuccess(res, student, undefined, 201);
};

export const getStudentById = async (req: Request, res: Response): Promise<Response> => {
  const { studentId } = req.params;
  const student = await prisma.student.findFirst({ where: { id: studentId, deletedAt: null } });

  if (!student) {
    logEvent(req, "student_get_not_found", "warn", { studentId });
    throw new AppError(404, "Student not found", ErrorCode.NOT_FOUND);
  }

  logEvent(req, "student_get_success", "info", { studentId });
  return sendSuccess(res, student);
};

export const updateStudent = async (req: Request, res: Response): Promise<Response> => {
  const { studentId } = req.params;
  const payload = req.body as Record<string, unknown>;

  const existing = await prisma.student.findFirst({ where: { id: studentId, deletedAt: null } });
  if (!existing) {
    logEvent(req, "student_update_not_found", "warn", { studentId });
    throw new AppError(404, "Student not found", ErrorCode.NOT_FOUND);
  }

  const updateData: Prisma.StudentUpdateInput = {
    ...payload,
    ...(typeof payload.dateOfBirth === "string" ? { dateOfBirth: new Date(payload.dateOfBirth) } : {}),
  };

  const student = await prisma.student.update({ where: { id: studentId }, data: updateData });
  logEvent(req, "student_update_success", "info", { studentId });
  return sendSuccess(res, student);
};

export const archiveStudent = async (req: Request, res: Response): Promise<Response> => {
  const { studentId } = req.params;
  const existing = await prisma.student.findFirst({ where: { id: studentId, deletedAt: null } });

  if (!existing) {
    logEvent(req, "student_archive_not_found", "warn", { studentId });
    throw new AppError(404, "Student not found", ErrorCode.NOT_FOUND);
  }

  const student = await prisma.student.update({
    where: { id: studentId },
    data: { status: ResourceStatus.ARCHIVED, deletedAt: new Date() },
  });

  logEvent(req, "student_archive_success", "info", { studentId });
  return sendSuccess(res, student);
};

export const restoreStudent = async (req: Request, res: Response): Promise<Response> => {
  const { studentId } = req.params;
  const existing = await prisma.student.findUnique({ where: { id: studentId } });

  if (!existing) {
    logEvent(req, "student_restore_not_found", "warn", { studentId });
    throw new AppError(404, "Student not found", ErrorCode.NOT_FOUND);
  }

  if (!existing.deletedAt && existing.status !== ResourceStatus.ARCHIVED) {
    logEvent(req, "student_restore_skipped", "warn", { studentId, reason: "already_active" });
    throw new AppError(400, "Student is already active", ErrorCode.CONFLICT);
  }

  const student = await prisma.student.update({
    where: { id: studentId },
    data: { status: ResourceStatus.ACTIVE, deletedAt: null },
  });

  logEvent(req, "student_restore_success", "info", { studentId });
  return sendSuccess(res, student);
};
