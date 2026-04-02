import { apiFetch } from "@/lib/api/client";
import type { PublicUser } from "@/types/auth";

export type ListCompanyRecruitersResponse = {
  recruiters: PublicUser[];
};

/**
 * Recruiters sharing the same `companyName` as the authenticated user (auth service).
 */
export async function listCompanyRecruiters(
  token: string,
): Promise<ListCompanyRecruitersResponse> {
  return apiFetch<ListCompanyRecruitersResponse>("/api/users/company-recruiters", {
    token,
  });
}
