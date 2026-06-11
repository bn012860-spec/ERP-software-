import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { ErrorCode, ResourceStatus, sendError, sendSuccess } from "../../../packages/shared/src";
import prisma from "../config/prisma";

const buildTeacherWhere = (req: Request): Prisma.TeacherProfileWhereInput => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const departmentId = typeof req.query.departmentId === "string" ? req.query.departmentId.trim() : "";

  return {
    deletedAt: null,
    status: ResourceStatus.ACTIVE,
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
    status: ResourceStatus.ACTIVE,
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
  return sendSuccess(res, data);
};

export const createTeacher = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as Record<string, string>;
  const data = await prisma.teacherProfile.create({ data: { ...payload, joiningDate: new Date(payload.joiningDate) } });
  return sendSuccess(res, data, undefined, 201);
};

export const getTeacherById = async (req: Request, res: Response): Promise<Response> => {
  const data = await prisma.teacherProfile.findFirst({ where: { id: req.params.teacherId, deletedAt: null } });
  if (!data) return sendError(res, 404, "Teacher profile not found", ErrorCode.NOT_FOUND);
  return sendSuccess(res, data);
};

export const updateTeacher = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as Record<string, unknown>;
  const existing = await prisma.teacherProfile.findFirst({ where: { id: req.params.teacherId, deletedAt: null } });
  if (!existing) return sendError(res, 404, "Teacher profile not found", ErrorCode.NOT_FOUND);

  const data = await prisma.teacherProfile.update({
    where: { id: req.params.teacherId },
    data: {
      ...payload,
      ...(typeof payload.joiningDate === "string" ? { joiningDate: new Date(payload.joiningDate) } : {}),
    },
  });
  return sendSuccess(res, data);
};

export const archiveTeacher = async (req: Request, res: Response): Promise<Response> => {
  const existing = await prisma.teacherProfile.findFirst({ where: { id: req.params.teacherId, deletedAt: null } });
  if (!existing) return sendError(res, 404, "Teacher profile not found", ErrorCode.NOT_FOUND);

  const data = await prisma.teacherProfile.update({
    where: { id: req.params.teacherId },
    data: { status: ResourceStatus.ARCHIVED, deletedAt: new Date() },
  });
  return sendSuccess(res, data);
};

export const restoreTeacher = async (req: Request, res: Response): Promise<Response> => {
  const existing = await prisma.teacherProfile.findUnique({ where: { id: req.params.teacherId } });
  if (!existing) return sendError(res, 404, "Teacher profile not found", ErrorCode.NOT_FOUND);
  if (!existing.deletedAt && existing.status !== ResourceStatus.ARCHIVED) return sendError(res, 400, "Teacher profile is already active", ErrorCode.CONFLICT);

  const data = await prisma.teacherProfile.update({
    where: { id: req.params.teacherId },
    data: { status: ResourceStatus.ACTIVE, deletedAt: null },
  });
  return sendSuccess(res, data);
};

export const listStaff = async (req: Request, res: Response): Promise<Response> => {
  const data = await prisma.staffProfile.findMany({ where: buildStaffWhere(req), orderBy: { createdAt: "desc" } });
  return sendSuccess(res, data);
};

export const createStaff = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as Record<string, string>;
  const data = await prisma.staffProfile.create({ data: { ...payload, joiningDate: new Date(payload.joiningDate) } });
  return sendSuccess(res, data, undefined, 201);
};

export const getStaffById = async (req: Request, res: Response): Promise<Response> => {
  const data = await prisma.staffProfile.findFirst({ where: { id: req.params.staffId, deletedAt: null } });
  if (!data) return sendError(res, 404, "Staff profile not found", ErrorCode.NOT_FOUND);
  return sendSuccess(res, data);
};

export const updateStaff = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as Record<string, unknown>;
  const existing = await prisma.staffProfile.findFirst({ where: { id: req.params.staffId, deletedAt: null } });
  if (!existing) return sendError(res, 404, "Staff profile not found", ErrorCode.NOT_FOUND);

  const data = await prisma.staffProfile.update({
    where: { id: req.params.staffId },
    data: {
      ...payload,
      ...(typeof payload.joiningDate === "string" ? { joiningDate: new Date(payload.joiningDate) } : {}),
    },
  });
  return sendSuccess(res, data);
};

export const archiveStaff = async (req: Request, res: Response): Promise<Response> => {
  const existing = await prisma.staffProfile.findFirst({ where: { id: req.params.staffId, deletedAt: null } });
  if (!existing) return sendError(res, 404, "Staff profile not found", ErrorCode.NOT_FOUND);

  const data = await prisma.staffProfile.update({
    where: { id: req.params.staffId },
    data: { status: ResourceStatus.ARCHIVED, deletedAt: new Date() },
  });
  return sendSuccess(res, data);
};

export const restoreStaff = async (req: Request, res: Response): Promise<Response> => {
  const existing = await prisma.staffProfile.findUnique({ where: { id: req.params.staffId } });
  if (!existing) return sendError(res, 404, "Staff profile not found", ErrorCode.NOT_FOUND);
  if (!existing.deletedAt && existing.status !== ResourceStatus.ARCHIVED) return sendError(res, 400, "Staff profile is already active", ErrorCode.CONFLICT);

  const data = await prisma.staffProfile.update({
    where: { id: req.params.staffId },
    data: { status: ResourceStatus.ACTIVE, deletedAt: null },
  });
  return sendSuccess(res, data);
};
