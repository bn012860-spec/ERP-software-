import { Router } from "express";
import { createStaff, createTeacher, listStaff, listTeachers } from "../controllers/profile.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validateRequest } from "../../../packages/shared/src/validate-request";
import { CreateStaffProfileSchema, CreateTeacherProfileSchema } from "../validation/profile.schemas";

const router = Router();

router.get("/teachers", authenticate, listTeachers);
router.post("/teachers", authenticate, validateRequest(CreateTeacherProfileSchema), createTeacher);
router.get("/staff", authenticate, listStaff);
router.post("/staff", authenticate, validateRequest(CreateStaffProfileSchema), createStaff);

export default router;
