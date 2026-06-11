import { Request, Response } from "express";
import { ErrorCode, sendError, sendSuccess } from "../../../packages/shared/src";
import prisma from "../config/prisma";

export const listAcademicYears = async (_req: Request, res: Response): Promise<Response> => {
  const data = await prisma.academicYear.findMany({ where: { status: "ACTIVE" }, orderBy: { startDate: "desc" } });
  return sendSuccess(res, data);
};

export const getCurrentAcademicYear = async (_req: Request, res: Response): Promise<Response> => {
  const current = await prisma.academicYear.findFirst({ where: { isCurrent: true, status: "ACTIVE" } });

  if (!current) {
    return sendError(res, 404, "Current academic year not found", ErrorCode.NOT_FOUND);
  }

  return sendSuccess(res, current);
};

export const createAcademicYear = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as {
    name: string;
    startDate: string;
    endDate: string;
    isCurrent?: boolean;
  };

  const data = await prisma.$transaction(async (tx) => {
    if (payload.isCurrent) {
      await tx.academicYear.updateMany({ where: { isCurrent: true }, data: { isCurrent: false } });
    }

    return tx.academicYear.create({
      data: {
        name: payload.name,
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
        isCurrent: payload.isCurrent ?? false,
      },
    });
  });

  return sendSuccess(res, data, undefined, 201);
};

export const listDepartments = async (_req: Request, res: Response): Promise<Response> => {
  const data = await prisma.department.findMany({ where: { deletedAt: null, status: "ACTIVE" }, orderBy: { name: "asc" } });
  return sendSuccess(res, data);
};

export const createDepartment = async (req: Request, res: Response): Promise<Response> => {
  const data = await prisma.department.create({ data: req.body });
  return sendSuccess(res, data, undefined, 201);
};

export const listPrograms = async (_req: Request, res: Response): Promise<Response> => {
  const data = await prisma.program.findMany({ where: { deletedAt: null, status: "ACTIVE" }, orderBy: { name: "asc" } });
  return sendSuccess(res, data);
};

export const createProgram = async (req: Request, res: Response): Promise<Response> => {
  const data = await prisma.program.create({ data: req.body });
  return sendSuccess(res, data, undefined, 201);
};

export const listClasses = async (_req: Request, res: Response): Promise<Response> => {
  const data = await prisma.class.findMany({ where: { deletedAt: null, status: "ACTIVE" }, orderBy: { createdAt: "desc" } });
  return sendSuccess(res, data);
};

export const createClass = async (req: Request, res: Response): Promise<Response> => {
  const data = await prisma.class.create({ data: req.body });
  return sendSuccess(res, data, undefined, 201);
};

export const listSections = async (_req: Request, res: Response): Promise<Response> => {
  const data = await prisma.section.findMany({ where: { deletedAt: null, status: "ACTIVE" }, orderBy: { createdAt: "desc" } });
  return sendSuccess(res, data);
};

export const createSection = async (req: Request, res: Response): Promise<Response> => {
  const data = await prisma.section.create({ data: req.body });
  return sendSuccess(res, data, undefined, 201);
};
