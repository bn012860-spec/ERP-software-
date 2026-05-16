import { Router } from "express";
import { archiveStudent, createStudent, getStudentById, listStudents, restoreStudent, updateStudent } from "../controllers/student.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, listStudents);
router.post("/", authenticate, createStudent);
router.get("/:studentId", authenticate, getStudentById);
router.patch("/:studentId", authenticate, updateStudent);
router.delete("/:studentId", authenticate, archiveStudent);
router.post("/:studentId/restore", authenticate, restoreStudent);

export default router;
