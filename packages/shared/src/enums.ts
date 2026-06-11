export const ResourceStatus = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type ResourceStatus = (typeof ResourceStatus)[keyof typeof ResourceStatus];

export const AttendanceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
  EXCUSED: "EXCUSED",
} as const;

export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];
