import { Request, Response } from "express";
import prisma from "../config/prisma";

export const listAcademicYears = async (_req: Request, res: Response): Promise<Response> => {
  const data = await prisma.academicYear.findMany({ orderBy: { startDate: "desc" } });
  return res.json(data);
};

export const createAcademicYear = async (req: Request, res: Response): Promise<Response> => {
  const data = await prisma.academicYear.create({ data: req.body });
  return res.status(201).json(data);
};

export const listDepartments = async (_req: Request, res: Response): Promise<Response> => {
  const data = await prisma.department.findMany({ orderBy: { name: "asc" } });
  return res.json(data);
};

export const createDepartment = async (req: Request, res: Response): Promise<Response> => {
  const data = await prisma.department.create({ data: req.body });
  return res.status(201).json(data);
};

export const listPrograms = async (_req: Request, res: Response): Promise<Response> => {
  const data = await prisma.program.findMany({ orderBy: { name: "asc" } });
  return res.json(data);
};

export const createProgram = async (req: Request, res: Response): Promise<Response> => {
  const data = await prisma.program.create({ data: req.body });
  return res.status(201).json(data);
};

export const listClasses = async (_req: Request, res: Response): Promise<Response> => {
  const data = await prisma.class.findMany({ orderBy: { createdAt: "desc" } });
  return res.json(data);
};

export const createClass = async (req: Request, res: Response): Promise<Response> => {
  const data = await prisma.class.create({ data: req.body });
  return res.status(201).json(data);
};

export const listSections = async (_req: Request, res: Response): Promise<Response> => {
  const data = await prisma.section.findMany({ orderBy: { createdAt: "desc" } });
  return res.json(data);
};

export const createSection = async (req: Request, res: Response): Promise<Response> => {
  const data = await prisma.section.create({ data: req.body });
  return res.status(201).json(data);
};
