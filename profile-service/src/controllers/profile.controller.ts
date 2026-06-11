import { Prisma, RecordStatus } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "../config/prisma";

const buildTeacherWhere = (req: Request): Prisma.TeacherProfileWhereInput => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const departmentId = typeof req.query.departmentId === "string" ? req.query.departmentId.trim() : "";

  return {
    deletedAt: null,
    status: "ACTIVE",
    ...(departmentId ? { departmentId } : {}),
    ...(search
      ? {
          OR: [
            { employeeCode: { contains: search, mode: "insensitive" } },
            { designation: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
};

const buildStaffWhere = (req: Request): Prisma.StaffProfileWhereInput => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const departmentId = typeof req.query.departmentId === "string" ? req.query.departmentId.trim() : "";

  return {
    deletedAt: null,
    status: "ACTIVE",
    ...(departmentId ? { departmentId } : {}),
    ...(search
      ? {
          OR: [
            { employeeCode: { contains: search, mode: "insensitive" } },
            { role: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
};

export const listTeachers = async (req: Request, res: Response): Promise<Response> => {
  const data = await prisma.teacherProfile.findMany({ where: buildTeacherWhere(req), orderBy: { createdAt: "desc" } });
  return res.json(data);
};

export const createTeacher = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as Record<string, string>;
  const data = await prisma.teacherProfile.create({ data: { ...payload, joiningDate: new Date(payload.joiningDate) } });
  return res.status(201).json(data);
};

export const getTeacherById = async (req: Request, res: Response): Promise<Response> => {
  const data = await prisma.teacherProfile.findFirst({ where: { id: req.params.teacherId, deletedAt: null } });
  if (!data) return res.status(404).json({ error: "Teacher profile not found" });
  return res.json(data);
};

export const updateTeacher = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as Record<string, unknown>;
  const existing = await prisma.teacherProfile.findFirst({ where: { id: req.params.teacherId, deletedAt: null } });
  if (!existing) return res.status(404).json({ error: "Teacher profile not found" });

  const data = await prisma.teacherProfile.update({
    where: { id: req.params.teacherId },
    data: {
      ...payload,
      ...(typeof payload.joiningDate === "string" ? { joiningDate: new Date(payload.joiningDate) } : {}),
    },
  });
  return res.json(data);
};

export const archiveTeacher = async (req: Request, res: Response): Promise<Response> => {
  const existing = await prisma.teacherProfile.findFirst({ where: { id: req.params.teacherId, deletedAt: null } });
  if (!existing) return res.status(404).json({ error: "Teacher profile not found" });

  const data = await prisma.teacherProfile.update({
    where: { id: req.params.teacherId },
    data: { status: RecordStatus.ARCHIVED, deletedAt: new Date() },
  });
  return res.json(data);
};

export const restoreTeacher = async (req: Request, res: Response): Promise<Response> => {
  const existing = await prisma.teacherProfile.findUnique({ where: { id: req.params.teacherId } });
  if (!existing) return res.status(404).json({ error: "Teacher profile not found" });
  if (!existing.deletedAt && existing.status !== RecordStatus.ARCHIVED) return res.status(400).json({ error: "Teacher profile is already active" });

  const data = await prisma.teacherProfile.update({
    where: { id: req.params.teacherId },
    data: { status: RecordStatus.ACTIVE, deletedAt: null },
  });
  return res.json(data);
};

export const listStaff = async (req: Request, res: Response): Promise<Response> => {
  const data = await prisma.staffProfile.findMany({ where: buildStaffWhere(req), orderBy: { createdAt: "desc" } });
  return res.json(data);
};

export const createStaff = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as Record<string, string>;
  const data = await prisma.staffProfile.create({ data: { ...payload, joiningDate: new Date(payload.joiningDate) } });
  return res.status(201).json(data);
};

export const getStaffById = async (req: Request, res: Response): Promise<Response> => {
  const data = await prisma.staffProfile.findFirst({ where: { id: req.params.staffId, deletedAt: null } });
  if (!data) return res.status(404).json({ error: "Staff profile not found" });
  return res.json(data);
};

export const updateStaff = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as Record<string, unknown>;
  const existing = await prisma.staffProfile.findFirst({ where: { id: req.params.staffId, deletedAt: null } });
  if (!existing) return res.status(404).json({ error: "Staff profile not found" });

  const data = await prisma.staffProfile.update({
    where: { id: req.params.staffId },
    data: {
      ...payload,
      ...(typeof payload.joiningDate === "string" ? { joiningDate: new Date(payload.joiningDate) } : {}),
    },
  });
  return res.json(data);
};

export const archiveStaff = async (req: Request, res: Response): Promise<Response> => {
  const existing = await prisma.staffProfile.findFirst({ where: { id: req.params.staffId, deletedAt: null } });
  if (!existing) return res.status(404).json({ error: "Staff profile not found" });

  const data = await prisma.staffProfile.update({
    where: { id: req.params.staffId },
    data: { status: RecordStatus.ARCHIVED, deletedAt: new Date() },
  });
  return res.json(data);
};

export const restoreStaff = async (req: Request, res: Response): Promise<Response> => {
  const existing = await prisma.staffProfile.findUnique({ where: { id: req.params.staffId } });
  if (!existing) return res.status(404).json({ error: "Staff profile not found" });
  if (!existing.deletedAt && existing.status !== RecordStatus.ARCHIVED) return res.status(400).json({ error: "Staff profile is already active" });

  const data = await prisma.staffProfile.update({
    where: { id: req.params.staffId },
    data: { status: RecordStatus.ACTIVE, deletedAt: null },
  });
  return res.json(data);
};
