import { getAiApiBaseUrl } from "@/config/env";
import { ApiError } from "@/lib/api/client";
import type { JdExtractionResponse } from "@/types/jd-extraction";

export async function parseJobDescriptionPdf(
  file: File,
  token: string,
): Promise<JdExtractionResponse> {
  const base = getAiApiBaseUrl();
  const res = await fetch(`${base}/api/v1/parse-jd`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: (() => {
      const fd = new FormData();
      fd.append("file", file);
      return fd;
    })(),
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { detail: text || res.statusText };
  }

  if (!res.ok) {
    const body = data as { detail?: unknown };
    let msg = res.statusText;
    const d = body?.detail;
    if (typeof d === "string") {
      msg = d;
    } else if (Array.isArray(d)) {
      msg = d
        .map((item) =>
          typeof item === "object" && item && "msg" in item
            ? String((item as { msg: string }).msg)
            : String(item),
        )
        .join(", ");
    } else if (d && typeof d === "object" && "error" in d) {
      msg = String((d as { error: string }).error);
    }
    throw new ApiError(msg || "JD parse failed", res.status);
  }

  return data as JdExtractionResponse;
}
