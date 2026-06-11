export const config = {
  port: Number(process.env.GATEWAY_PORT ?? 8080),
  jwtSecret: process.env.JWT_SECRET ?? "",
  services: {
    auth: process.env.AUTH_SERVICE_URL ?? "http://localhost:5000",
    students: process.env.STUDENT_SERVICE_URL ?? "http://localhost:5001",
    academic: process.env.ACADEMIC_SERVICE_URL ?? "http://localhost:5002",
    profiles: process.env.PROFILE_SERVICE_URL ?? "http://localhost:5004",
    attendance: process.env.ATTENDANCE_SERVICE_URL ?? "http://localhost:5005",
    billing: process.env.BILLING_SERVICE_URL ?? "http://localhost:5003",
  },
};
