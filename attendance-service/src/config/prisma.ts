import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __attendancePrisma: PrismaClient | undefined;
}

const prisma = global.__attendancePrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__attendancePrisma = prisma;
}

export default prisma;
