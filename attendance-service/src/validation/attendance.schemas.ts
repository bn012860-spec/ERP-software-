import { AttendanceMarkSource, AttendanceStatus } from "../../../packages/shared/src";
import { z } from "zod";

const AttendanceDateSchema = z.string().min(1).refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "attendanceDate must be a valid date",
});

export const CreateStudentAttendanceSchema = z.object({
  studentId: z.string().uuid(),
  classId: z.string().uuid(),
  sectionId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  attendanceDate: AttendanceDateSchema,
  status: z.nativeEnum(AttendanceStatus),
  markedByTeacherProfileId: z.string().uuid().optional(),
  markSource: z.nativeEnum(AttendanceMarkSource).optional(),
  remarks: z.string().optional(),
});

export const UpdateStudentAttendanceSchema = z
  .object({
    status: z.nativeEnum(AttendanceStatus).optional(),
    markedByTeacherProfileId: z.string().uuid().nullable().optional(),
    markSource: z.nativeEnum(AttendanceMarkSource).optional(),
    remarks: z.string().nullable().optional(),
  })
  .strict();

export const CreateTeacherAttendanceSchema = z.object({
  teacherProfileId: z.string().uuid(),
  attendanceDate: AttendanceDateSchema,
  status: z.nativeEnum(AttendanceStatus),
  markSource: z.nativeEnum(AttendanceMarkSource).optional(),
  remarks: z.string().optional(),
});

export const UpdateTeacherAttendanceSchema = z
  .object({
    status: z.nativeEnum(AttendanceStatus).optional(),
    markSource: z.nativeEnum(AttendanceMarkSource).optional(),
    remarks: z.string().nullable().optional(),
  })
  .strict();

export const AttendanceSortBySchema = z.enum(["attendanceDate", "createdAt", "updatedAt"]);
export const AttendanceOrderSchema = z.enum(["asc", "desc"]);
