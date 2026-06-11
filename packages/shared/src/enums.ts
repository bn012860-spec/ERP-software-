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

export const AttendanceType = {
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
} as const;

export type AttendanceType = (typeof AttendanceType)[keyof typeof AttendanceType];

export const AttendanceMarkSource = {
  MANUAL: "MANUAL",
  IMPORT: "IMPORT",
  SYSTEM: "SYSTEM",
} as const;

export type AttendanceMarkSource = (typeof AttendanceMarkSource)[keyof typeof AttendanceMarkSource];
