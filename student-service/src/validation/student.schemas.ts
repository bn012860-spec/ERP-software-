import { StudentStatus } from "@prisma/client";
import { z } from "zod";

export const CreateStudentSchema = z.object({
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

export const UpdateStudentSchema = z
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

export const SortBySchema = z.enum(["createdAt", "firstName", "lastName", "studentCode"]);
export const OrderSchema = z.enum(["asc", "desc"]);
