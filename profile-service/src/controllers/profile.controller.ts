import { Request, Response } from "express";
import prisma from "../config/prisma";

export const listTeachers = async (_req: Request, res: Response): Promise<Response> => {
  const data = await prisma.teacherProfile.findMany({ where: { deletedAt: null, status: "ACTIVE" }, orderBy: { createdAt: "desc" } });
  return res.json(data);
};

export const createTeacher = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as Record<string, string>;
  const data = await prisma.teacherProfile.create({
    data: {
      ...payload,
      joiningDate: new Date(payload.joiningDate),
    },
  });
  return res.status(201).json(data);
};

export const listStaff = async (_req: Request, res: Response): Promise<Response> => {
  const data = await prisma.staffProfile.findMany({ where: { deletedAt: null, status: "ACTIVE" }, orderBy: { createdAt: "desc" } });
  return res.json(data);
};

export const createStaff = async (req: Request, res: Response): Promise<Response> => {
  const payload = req.body as Record<string, string>;
  const data = await prisma.staffProfile.create({
    data: {
      ...payload,
      joiningDate: new Date(payload.joiningDate),
    },
  });
  return res.status(201).json(data);
};
