import { Request, Response, Router } from "express";
import { sendError, validateRequest } from "@erp/shared";
import {
  CreateClassSubjectSchema,
  CreateSubjectSchema,
  CreateTeacherSubjectSchema,
} from "../validation/subject-mapping.schemas";

const router = Router();

const notImplemented = (_req: Request, res: Response): Response => {
  return sendError(res, 501, "Subject mapping endpoint is scaffolded only", "NOT_IMPLEMENTED");
};

router.post("/subjects", validateRequest(CreateSubjectSchema), notImplemented);
router.get("/subjects", notImplemented);
router.post("/class-subjects", validateRequest(CreateClassSubjectSchema), notImplemented);
router.get("/class-subjects", notImplemented);
router.post("/teacher-subjects", validateRequest(CreateTeacherSubjectSchema), notImplemented);
router.get("/teacher-subjects", notImplemented);

export default router;
