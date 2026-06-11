import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __studentPrisma: PrismaClient | undefined;
}

const prisma = global.__studentPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__studentPrisma = prisma;
}

export default prisma;
