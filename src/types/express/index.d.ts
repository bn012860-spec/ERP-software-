export {};

declare global {
  namespace Express {
    interface UserContext {
      userId: string;
      role: string;
    }

    interface Request {
      user?: UserContext;
    }
  }
}
