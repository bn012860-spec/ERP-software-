import { Router } from "express";
import {
  createAcademicYear,
  createClass,
  createDepartment,
  createProgram,
  createSection,
  listAcademicYears,
  listClasses,
  listDepartments,
  listPrograms,
  listSections,
} from "../controllers/structure.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/academic-years", authenticate, listAcademicYears);
router.post("/academic-years", authenticate, createAcademicYear);
router.get("/departments", authenticate, listDepartments);
router.post("/departments", authenticate, createDepartment);
router.get("/programs", authenticate, listPrograms);
router.post("/programs", authenticate, createProgram);
router.get("/classes", authenticate, listClasses);
router.post("/classes", authenticate, createClass);
router.get("/sections", authenticate, listSections);
router.post("/sections", authenticate, createSection);

export default router;
