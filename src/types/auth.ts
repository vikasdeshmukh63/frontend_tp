export type UserRole = "admin" | "candidate" | "recruiter";

export type PublicUser = {
  id: number;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  headline: string | null;
  resumeUrl: string | null;
  location: string | null;
  yearsExperience: number | null;
  companyName: string | null;
  recruiterTitle: string | null;
  adminDepartment: string | null;
};

export type AuthSuccessBody = {
  token: string;
  user: PublicUser;
};

export type RegisterPendingBody = {
  message: string;
  email: string;
};

export type MessageBody = {
  message: string;
};

export type ProfileBody = {
  user: PublicUser;
};
