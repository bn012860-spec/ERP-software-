import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __academicStructurePrisma: PrismaClient | undefined;
}

const prisma = global.__academicStructurePrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__academicStructurePrisma = prisma;
}

export default prisma;
