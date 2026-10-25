"use client";
export async function api<T = Record<string, unknown>>(
  url: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.error?.details
        ?.map(
          (issue: { path: string[]; message: string }) =>
            `${issue.path.join(" ")}: ${issue.message}`,
        )
        .join(" · ") ||
        data.error?.message ||
        "Request failed. Please try again.",
    );
  return data as T;
}
