import { error } from "next/dist/build/output/log";

const BASE_URL = process.env.NEXT_BASE_URL;

const refresh_token = async (): Promise<any> => {
  const res = await fetch(`${BASE_URL}/api/auth/refresh_token`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-type": "application/json",
    },
  });
  const data: any = res.json;
  if (res.status == 401) {
    throw new Error(data.message);
  }
  return data;
};

const api_fetch = async (
  endpoint: string,
  options?: RequestInit,
): Promise<any> => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-type": "application/json",
      ...options?.headers,
    },
  });
  const data: any = await res.json();

  if (res.status == 401) {
    const refresh_data = await refresh_token();
    if (!refresh_data.success) {
      throw new Error(refresh_data.message);
    }
    const retry_res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-type": "application/json",
        ...options?.headers,
      },
    });

    const retry_data = await retry_res.json();
    if (!retry_data.success || !retry_res.ok) {
      throw new Error(retry_data.message || "Request failed after refresh");
    }
    return retry_data;
  }

  if (!res.ok || !data.success) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
};

export default api_fetch;
