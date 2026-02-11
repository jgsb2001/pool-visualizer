const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  data: T;
  ok: boolean;
  status: number;
}

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const data = (await response.json()) as T;
  return { data, ok: response.ok, status: response.status };
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
  });
  const data = (await response.json()) as T;
  return { data, ok: response.ok, status: response.status };
}
