import { ResourceStatus } from "../../../packages/shared/src";
import { z } from "zod";

export const CreateTeacherProfileSchema = z.object({
  userId: z.string().uuid(),
  employeeCode: z.string().min(1),
  departmentId: z.string().uuid(),
  designation: z.string().min(1),
  joiningDate: z.string().datetime(),
});

export const UpdateTeacherProfileSchema = z
  .object({
    employeeCode: z.string().min(1).optional(),
    departmentId: z.string().uuid().optional(),
    designation: z.string().min(1).optional(),
    joiningDate: z.string().datetime().optional(),
    status: z.nativeEnum(ResourceStatus).optional(),
  })
  .strict();

export const CreateStaffProfileSchema = z.object({
  userId: z.string().uuid(),
  employeeCode: z.string().min(1),
  departmentId: z.string().uuid(),
  role: z.string().min(1),
  joiningDate: z.string().datetime(),
});

export const UpdateStaffProfileSchema = z
  .object({
    employeeCode: z.string().min(1).optional(),
    departmentId: z.string().uuid().optional(),
    role: z.string().min(1).optional(),
    joiningDate: z.string().datetime().optional(),
    status: z.nativeEnum(ResourceStatus).optional(),
  })
  .strict();
