import { z } from "zod";

export const CreateTeacherProfileSchema = z.object({
  userId: z.string().uuid(),
  employeeCode: z.string().min(1),
  departmentId: z.string().uuid(),
  designation: z.string().min(1),
  joiningDate: z.string().datetime(),
});

export const CreateStaffProfileSchema = z.object({
  userId: z.string().uuid(),
  employeeCode: z.string().min(1),
  departmentId: z.string().uuid(),
  role: z.string().min(1),
  joiningDate: z.string().datetime(),
});
