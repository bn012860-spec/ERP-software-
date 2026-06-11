import { z } from "zod";

export const CreateAcademicYearSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isCurrent: z.boolean().optional(),
});

export const CreateDepartmentSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
});

export const CreateProgramSchema = z.object({
  departmentId: z.string().uuid(),
  name: z.string().min(1),
  code: z.string().min(1),
  durationYears: z.number().int().min(1),
});

export const CreateClassSchema = z.object({
  programId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  name: z.string().min(1),
  semester: z.number().int().min(1),
  sectionCount: z.number().int().min(1),
});

export const CreateSectionSchema = z.object({
  classId: z.string().uuid(),
  name: z.string().min(1),
  capacity: z.number().int().min(1),
});
