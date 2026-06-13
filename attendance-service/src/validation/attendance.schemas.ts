import { AttendanceMarkSource, AttendanceStatus, DateRangeQuerySchema, PaginationQuerySchema, createSortingQuerySchema } from "@erp/shared";
import { z } from "zod";

const AttendanceDateSchema = z.string().trim().min(1).refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "attendanceDate must be a valid date",
});

const OptionalQueryStringSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined),
  z.string().optional(),
);
const OptionalStatusQuerySchema = z.preprocess(
  (value) => (typeof value === "string" && Object.values(AttendanceStatus).includes(value as AttendanceStatus) ? value : undefined),
  z.nativeEnum(AttendanceStatus).optional(),
);
const OptionalAttendanceDateQuerySchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim().length > 0 && !Number.isNaN(Date.parse(value)) ? value.trim() : undefined),
  z.string().optional(),
);

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

const AttendanceSortingQuerySchema = createSortingQuerySchema(["attendanceDate", "createdAt", "updatedAt"], "attendanceDate");

export const StudentAttendanceListQuerySchema = PaginationQuerySchema.merge(AttendanceSortingQuerySchema)
  .merge(DateRangeQuerySchema)
  .extend({
    studentId: OptionalQueryStringSchema,
    classId: OptionalQueryStringSchema,
    sectionId: OptionalQueryStringSchema,
    academicYearId: OptionalQueryStringSchema,
    status: OptionalStatusQuerySchema,
    attendanceDate: OptionalAttendanceDateQuerySchema,
  })
  .passthrough();

export const TeacherAttendanceListQuerySchema = PaginationQuerySchema.merge(AttendanceSortingQuerySchema)
  .merge(DateRangeQuerySchema)
  .extend({
    teacherProfileId: OptionalQueryStringSchema,
    status: OptionalStatusQuerySchema,
    attendanceDate: OptionalAttendanceDateQuerySchema,
  })
  .passthrough();
