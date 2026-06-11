import { NextFunction, Request, Response, Router } from "express";
import { archiveStudent, createStudent, getStudentById, listStudents, restoreStudent, updateStudent } from "../controllers/student.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate-request.middleware";
import { CreateStudentSchema, UpdateStudentSchema } from "../validation/student.schemas";

const router = Router();

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<Response>,
) => (req: Request, res: Response, next: NextFunction): void => {
  void fn(req, res, next).catch(next);
};

router.get("/", authenticate, asyncHandler(listStudents));
router.post("/", authenticate, validateRequest(CreateStudentSchema), asyncHandler(createStudent));
router.get("/:studentId", authenticate, asyncHandler(getStudentById));
router.patch("/:studentId", authenticate, validateRequest(UpdateStudentSchema), asyncHandler(updateStudent));
router.delete("/:studentId", authenticate, asyncHandler(archiveStudent));
router.post("/:studentId/restore", authenticate, asyncHandler(restoreStudent));

export default router;
