import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __profilePrisma: PrismaClient | undefined;
}

const prisma = global.__profilePrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__profilePrisma = prisma;
}

export default prisma;
