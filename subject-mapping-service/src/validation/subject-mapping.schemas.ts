import { z } from "zod";

export const CreateSubjectSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  credits: z.number().int().min(0),
});

export const CreateClassSubjectSchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
});

export const CreateTeacherSubjectSchema = z.object({
  teacherProfileId: z.string().uuid(),
  subjectId: z.string().uuid(),
});

export const CreateTeacherClassAssignmentSchema = z.object({
  teacherProfileId: z.string().uuid(),
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  academicYearId: z.string().uuid(),
});
