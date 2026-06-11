import { Router } from "express";
import {
  createAcademicYear,
  createClass,
  createDepartment,
  createProgram,
  createSection,
  getCurrentAcademicYear,
  listAcademicYears,
  listClasses,
  listDepartments,
  listPrograms,
  listSections,
} from "../controllers/structure.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate-request.middleware";
import {
  CreateAcademicYearSchema,
  CreateClassSchema,
  CreateDepartmentSchema,
  CreateProgramSchema,
  CreateSectionSchema,
} from "../validation/structure.schemas";

const router = Router();

router.get("/academic-years", authenticate, listAcademicYears);
router.get("/academic-years/current", authenticate, getCurrentAcademicYear);
router.post("/academic-years", authenticate, validateRequest(CreateAcademicYearSchema), createAcademicYear);
router.get("/departments", authenticate, listDepartments);
router.post("/departments", authenticate, validateRequest(CreateDepartmentSchema), createDepartment);
router.get("/programs", authenticate, listPrograms);
router.post("/programs", authenticate, validateRequest(CreateProgramSchema), createProgram);
router.get("/classes", authenticate, listClasses);
router.post("/classes", authenticate, validateRequest(CreateClassSchema), createClass);
router.get("/sections", authenticate, listSections);
router.post("/sections", authenticate, validateRequest(CreateSectionSchema), createSection);

export default router;
