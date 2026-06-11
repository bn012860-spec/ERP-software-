import { z } from "zod";

export const CreateTeacherClassAssignmentSchema = z.object({
  teacherProfileId: z.string().uuid(),
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  academicYearId: z.string().uuid(),
});
