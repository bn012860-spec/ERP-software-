import { NextFunction, Request, Response, Router } from "express";
import {
  createStudentAttendance,
  createTeacherAttendance,
  listStudentAttendance,
  listTeacherAttendance,
  updateStudentAttendance,
  updateTeacherAttendance,
} from "../controllers/attendance.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate-request.middleware";
import {
  CreateStudentAttendanceSchema,
  CreateTeacherAttendanceSchema,
  UpdateStudentAttendanceSchema,
  UpdateTeacherAttendanceSchema,
} from "../validation/attendance.schemas";

const router = Router();

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<Response>,
) => (req: Request, res: Response, next: NextFunction): void => {
  void fn(req, res, next).catch(next);
};

router.get("/students", authenticate, asyncHandler(listStudentAttendance));
router.post("/students", authenticate, validateRequest(CreateStudentAttendanceSchema), asyncHandler(createStudentAttendance));
router.patch("/students/:attendanceId", authenticate, validateRequest(UpdateStudentAttendanceSchema), asyncHandler(updateStudentAttendance));

router.get("/teachers", authenticate, asyncHandler(listTeacherAttendance));
router.post("/teachers", authenticate, validateRequest(CreateTeacherAttendanceSchema), asyncHandler(createTeacherAttendance));
router.patch("/teachers/:attendanceId", authenticate, validateRequest(UpdateTeacherAttendanceSchema), asyncHandler(updateTeacherAttendance));

export default router;
