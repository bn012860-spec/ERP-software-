import { Router } from "express";

export const subjectMappingRoutePlan = [
  { method: "POST", path: "/subjects" },
  { method: "GET", path: "/subjects" },
  { method: "POST", path: "/class-subjects" },
  { method: "GET", path: "/class-subjects" },
  { method: "POST", path: "/teacher-subjects" },
  { method: "GET", path: "/teacher-subjects" },
] as const;

const router = Router();

// Skeleton only: attach controllers and validateRequest middleware in a later step.

export default router;
