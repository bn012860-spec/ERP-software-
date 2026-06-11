import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { AppError, AttendanceMarkSource, AttendanceStatus, ErrorCode, buildPaginationMeta, sendSuccess } from "@erp/shared";
import prisma from "../config/prisma";
import { AttendanceOrderSchema, AttendanceSortBySchema } from "../validation/attendance.schemas";

const logEvent = (req: Request, type: string, level: "info" | "warn" | "error", extra?: Record<string, unknown>): void => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: "attendance-service",
      type,
      level,
      requestId: req.headers["x-request-id"] ?? null,
      method: req.method,
      path: req.originalUrl,
      ...extra,
    }),
  );
};

const getPagination = (req: Request): { page: number; limit: number; skip: number } => {
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);

  return { page, limit, skip: (page - 1) * limit };
};

const getSort = (req: Request): { sortBy: "attendanceDate" | "createdAt" | "updatedAt"; order: "asc" | "desc" } => {
  const sortBy = AttendanceSortBySchema.safeParse(req.query.sortBy).success
    ? (req.query.sortBy as "attendanceDate" | "createdAt" | "updatedAt")
    : "attendanceDate";
  const order = AttendanceOrderSchema.safeParse(req.query.order).success
    ? (req.query.order as "asc" | "desc")
    : "desc";

  return { sortBy, order };
};

const optionalString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

const optionalStatus = (value: unknown): AttendanceStatus | undefined =>
  typeof value === "string" && Object.values(AttendanceStatus).includes(value as AttendanceStatus)
    ? (value as AttendanceStatus)
    : undefined;

const toAttendanceDay = (value: string): Date => {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

export const listStudentAttendance = async (req: Request, res: Response): Promise<Response> => {
  const { page, limit, skip } = getPagination(req);
  const { sortBy, order } = getSort(req);
  const studentId = optionalString(req.query.studentId);
  const classId = optionalString(req.query.classId);
  const sectionId = optionalString(req.query.sectionId);
  const academicYearId = optionalString(req.query.academicYearId);
  const status = optionalStatus(req.query.status);
  const attendanceDate = optionalString(req.query.attendanceDate);

  const where: Prisma.StudentAttendanceWhereInput = {
    ...(studentId ? { studentId } : {}),
    ...(classId ? { classId } : {}),
    ...(sectionId ? { sectionId } : {}),
    ...(academicYearId ? { academicYearId } : {}),
    ...(status ? { status } : {}),
    ...(attendanceDate ? { attendanceDate: toAttendanceDay(attendanceDate) } : {}),
  };

  const [total, data] = await Promise.all([
    prisma.studentAttendance.count({ where }),
    prisma.studentAttendance.findMany({ where, skip, take: limit, orderBy: { [sortBy]: order } }),
  ]);

  logEvent(req, "student_attendance_list_success", "info", { page, limit, total, sortBy, order });

  return sendSuccess(res, data, {
    pagination: buildPaginationMeta(page, limit, total),
    filters: { studentId, classId, sectionId, academicYearId, status, attendanceDate },
    sort: { sortBy, order },
  });
};

export const createStudentAttendance = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as Record<string, string | undefined>;
  const attendanceDate = toAttendanceDay(payload.attendanceDate as string);

  const existing = await prisma.studentAttendance.findUnique({
    where: {
      studentId_attendanceDate: {
        studentId: payload.studentId as string,
        attendanceDate,
      },
    },
  });

  if (existing) {
    logEvent(req, "student_attendance_conflict", "warn", { studentId: payload.studentId, attendanceDate });
    throw new AppError(409, "Student attendance already exists for this date", ErrorCode.RESOURCE_ALREADY_EXISTS);
  }

  const data = await prisma.studentAttendance.create({
    data: {
      studentId: payload.studentId as string,
      classId: payload.classId as string,
      sectionId: payload.sectionId as string,
      academicYearId: payload.academicYearId as string,
      attendanceDate,
      status: payload.status as AttendanceStatus,
      markedByTeacherProfileId: payload.markedByTeacherProfileId,
      markSource: payload.markSource as AttendanceMarkSource | undefined,
      remarks: payload.remarks,
    },
  });

  logEvent(req, "student_attendance_create_success", "info", { attendanceId: data.id, studentId: data.studentId });
  return sendSuccess(res, data, undefined, 201);
};

export const updateStudentAttendance = async (req: Request, res: Response): Promise<Response> => {
  const { attendanceId } = req.params;
  const payload = req.body as Record<string, unknown>;
  const existing = await prisma.studentAttendance.findUnique({ where: { id: attendanceId } });

  if (!existing) {
    logEvent(req, "student_attendance_not_found", "warn", { attendanceId });
    throw new AppError(404, "Student attendance not found", ErrorCode.NOT_FOUND);
  }

  const data = await prisma.studentAttendance.update({
    where: { id: attendanceId },
    data: payload as Prisma.StudentAttendanceUpdateInput,
  });

  logEvent(req, "student_attendance_update_success", "info", { attendanceId });
  return sendSuccess(res, data);
};

export const listTeacherAttendance = async (req: Request, res: Response): Promise<Response> => {
  const { page, limit, skip } = getPagination(req);
  const { sortBy, order } = getSort(req);
  const teacherProfileId = optionalString(req.query.teacherProfileId);
  const status = optionalStatus(req.query.status);
  const attendanceDate = optionalString(req.query.attendanceDate);

  const where: Prisma.TeacherAttendanceWhereInput = {
    ...(teacherProfileId ? { teacherProfileId } : {}),
    ...(status ? { status } : {}),
    ...(attendanceDate ? { attendanceDate: toAttendanceDay(attendanceDate) } : {}),
  };

  const [total, data] = await Promise.all([
    prisma.teacherAttendance.count({ where }),
    prisma.teacherAttendance.findMany({ where, skip, take: limit, orderBy: { [sortBy]: order } }),
  ]);

  logEvent(req, "teacher_attendance_list_success", "info", { page, limit, total, sortBy, order });

  return sendSuccess(res, data, {
    pagination: buildPaginationMeta(page, limit, total),
    filters: { teacherProfileId, status, attendanceDate },
    sort: { sortBy, order },
  });
};

export const createTeacherAttendance = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as Record<string, string | undefined>;
  const attendanceDate = toAttendanceDay(payload.attendanceDate as string);

  const existing = await prisma.teacherAttendance.findUnique({
    where: {
      teacherProfileId_attendanceDate: {
        teacherProfileId: payload.teacherProfileId as string,
        attendanceDate,
      },
    },
  });

  if (existing) {
    logEvent(req, "teacher_attendance_conflict", "warn", { teacherProfileId: payload.teacherProfileId, attendanceDate });
    throw new AppError(409, "Teacher attendance already exists for this date", ErrorCode.RESOURCE_ALREADY_EXISTS);
  }

  const data = await prisma.teacherAttendance.create({
    data: {
      teacherProfileId: payload.teacherProfileId as string,
      attendanceDate,
      status: payload.status as AttendanceStatus,
      markSource: payload.markSource as AttendanceMarkSource | undefined,
      remarks: payload.remarks,
    },
  });

  logEvent(req, "teacher_attendance_create_success", "info", { attendanceId: data.id, teacherProfileId: data.teacherProfileId });
  return sendSuccess(res, data, undefined, 201);
};

export const updateTeacherAttendance = async (req: Request, res: Response): Promise<Response> => {
  const { attendanceId } = req.params;
  const payload = req.body as Record<string, unknown>;
  const existing = await prisma.teacherAttendance.findUnique({ where: { id: attendanceId } });

  if (!existing) {
    logEvent(req, "teacher_attendance_not_found", "warn", { attendanceId });
    throw new AppError(404, "Teacher attendance not found", ErrorCode.NOT_FOUND);
  }

  const data = await prisma.teacherAttendance.update({
    where: { id: attendanceId },
    data: payload as Prisma.TeacherAttendanceUpdateInput,
  });

  logEvent(req, "teacher_attendance_update_success", "info", { attendanceId });
  return sendSuccess(res, data);
};
