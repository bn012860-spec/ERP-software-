import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { AppError, AttendanceMarkSource, AttendanceStatus, ErrorCode, buildPaginationMeta, logError, logInfo, logWarn, sendSuccess } from "@erp/shared";
import prisma from "../config/prisma";
import { StudentAttendanceListQuerySchema, TeacherAttendanceListQuerySchema } from "../validation/attendance.schemas";

const getRequestId = (req: Request): string | null =>
  typeof req.headers["x-request-id"] === "string" ? req.headers["x-request-id"] : null;

const logEvent = (req: Request, type: string, level: "info" | "warn" | "error", extra?: Record<string, unknown>): void => {
  const payload = {
    service: "attendance-service",
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

const toAttendanceDay = (value: string): Date => {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const buildAttendanceDateFilter = (attendanceDate?: string, fromDate?: string, toDate?: string): Prisma.DateTimeFilter | Date | undefined => {
  if (attendanceDate) return toAttendanceDay(attendanceDate);
  if (!fromDate && !toDate) return undefined;

  return {
    ...(fromDate ? { gte: toAttendanceDay(fromDate) } : {}),
    ...(toDate ? { lte: toAttendanceDay(toDate) } : {}),
  };
};

export const listStudentAttendance = async (req: Request, res: Response): Promise<Response> => {
  const query = StudentAttendanceListQuerySchema.parse(req.query);
  const { page, limit, sortBy, order, studentId, classId, sectionId, academicYearId, status, attendanceDate, fromDate, toDate } = query;
  const skip = (page - 1) * limit;
  const attendanceDateFilter = buildAttendanceDateFilter(attendanceDate, fromDate, toDate);

  const where: Prisma.StudentAttendanceWhereInput = {
    ...(studentId ? { studentId } : {}),
    ...(classId ? { classId } : {}),
    ...(sectionId ? { sectionId } : {}),
    ...(academicYearId ? { academicYearId } : {}),
    ...(status ? { status } : {}),
    ...(attendanceDateFilter ? { attendanceDate: attendanceDateFilter } : {}),
  };

  const [total, data] = await Promise.all([
    prisma.studentAttendance.count({ where }),
    prisma.studentAttendance.findMany({ where, skip, take: limit, orderBy: { [sortBy]: order } }),
  ]);

  logEvent(req, "student_attendance_list_success", "info", { page, limit, total, sortBy, order });

  return sendSuccess(res, data, {
    pagination: buildPaginationMeta(page, limit, total),
    filters: { studentId, classId, sectionId, academicYearId, status, attendanceDate, fromDate, toDate },
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
  const query = TeacherAttendanceListQuerySchema.parse(req.query);
  const { page, limit, sortBy, order, teacherProfileId, status, attendanceDate, fromDate, toDate } = query;
  const skip = (page - 1) * limit;
  const attendanceDateFilter = buildAttendanceDateFilter(attendanceDate, fromDate, toDate);

  const where: Prisma.TeacherAttendanceWhereInput = {
    ...(teacherProfileId ? { teacherProfileId } : {}),
    ...(status ? { status } : {}),
    ...(attendanceDateFilter ? { attendanceDate: attendanceDateFilter } : {}),
  };

  const [total, data] = await Promise.all([
    prisma.teacherAttendance.count({ where }),
    prisma.teacherAttendance.findMany({ where, skip, take: limit, orderBy: { [sortBy]: order } }),
  ]);

  logEvent(req, "teacher_attendance_list_success", "info", { page, limit, total, sortBy, order });

  return sendSuccess(res, data, {
    pagination: buildPaginationMeta(page, limit, total),
    filters: { teacherProfileId, status, attendanceDate, fromDate, toDate },
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
