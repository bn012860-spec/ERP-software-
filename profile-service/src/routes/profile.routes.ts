import { Router } from "express";
import {
  archiveStaff,
  archiveTeacher,
  createStaff,
  createTeacher,
  getStaffById,
  getTeacherById,
  listStaff,
  listTeachers,
  restoreStaff,
  restoreTeacher,
  updateStaff,
  updateTeacher,
} from "../controllers/profile.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validateRequest } from "../../../packages/shared/src/validate-request";
import {
  CreateStaffProfileSchema,
  CreateTeacherProfileSchema,
  UpdateStaffProfileSchema,
  UpdateTeacherProfileSchema,
} from "../validation/profile.schemas";

const router = Router();

router.get("/teachers", authenticate, listTeachers);
router.post("/teachers", authenticate, validateRequest(CreateTeacherProfileSchema), createTeacher);
router.get("/teachers/:teacherId", authenticate, getTeacherById);
router.patch("/teachers/:teacherId", authenticate, validateRequest(UpdateTeacherProfileSchema), updateTeacher);
router.delete("/teachers/:teacherId", authenticate, archiveTeacher);
router.post("/teachers/:teacherId/restore", authenticate, restoreTeacher);

router.get("/staff", authenticate, listStaff);
router.post("/staff", authenticate, validateRequest(CreateStaffProfileSchema), createStaff);
router.get("/staff/:staffId", authenticate, getStaffById);
router.patch("/staff/:staffId", authenticate, validateRequest(UpdateStaffProfileSchema), updateStaff);
router.delete("/staff/:staffId", authenticate, archiveStaff);
router.post("/staff/:staffId/restore", authenticate, restoreStaff);

export default router;
