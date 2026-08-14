const viteEnv = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env ?? {};
const BASE_URL = (viteEnv.VITE_API_URL as string) || "/api";

// ---- Token management ----
export const getToken = () => localStorage.getItem("lms_token");
export const setToken = (t: string) => localStorage.setItem("lms_token", t);
export const clearToken = () => localStorage.removeItem("lms_token");

// ---- Base fetch ----
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error("Unauthenticated");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.message || body?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

// ---- Types matching typical Laravel responses ----
export type ApiUser = {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Student";
  created_at?: string;
  updated_at?: string;
};

export type ApiCourse = {
  id: number;
  Name: string;
  Description: string;
  instructor?: { id: number; name: string } | string;
  slides_count?: number;
  // may also have pivot data for enrolled students
};

export type ApiSlide = {
  id: number;
  name: string;
  course_id: number;
  storage_path?: string;
  status: "pending" | "processing" | "done" | "failed";
  duration?: string;
  page_count?: number;
  order?: number;
  created_at?: string;
};

export type AiQueryPayload = {
  question: string;
  course_id?: number;
  slide_id?: number;
};

export type AiSummarizePayload = {
  slide_id?: number;
  course_id?: number;
};

// ---- Auth ----
export const auth = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: ApiUser }>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, password_confirmation: string) =>
    apiFetch<{ token: string; user: ApiUser }>("/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, password_confirmation }),
    }),

  me: () => apiFetch<ApiUser>("/user"),
};

type AdminUsersResponse = {
  message: string;
  data: ApiUser[];
};

type AdminUserResponse = {
  message: string;
  data: ApiUser;
};

// ---- Courses ----
export const coursesApi = {
  list: () => apiFetch<ApiCourse[]>("/courses"),
  show: (id: number) => apiFetch<ApiCourse>(`/courses/${id}`),
  create: (data: Partial<ApiCourse>) =>
    apiFetch<ApiCourse>("/courses", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<ApiCourse>) =>
    apiFetch<ApiCourse>(`/courses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  destroy: (id: number) =>
    apiFetch<void>(`/courses/${id}`, { method: "DELETE" }),
};

// ---- Slides ----
export const slidesApi = {
  list: () => apiFetch<ApiSlide[]>("/slides"),

  show: async (id: number): Promise<ApiSlide> => {
    const response = await apiFetch<{ data: ApiSlide }>(`/slides/${id}`);

    return response.data;
  },

  byCourse: async (courseId: number): Promise<ApiSlide[]> => {
    const response = await apiFetch<{ data: ApiSlide[] }>(
      `/courses/${courseId}/slides`
    );

    return response.data;
  },

  create: (formData: FormData) =>
    apiFetch<ApiSlide>("/slides", {
      method: "POST",
      body: formData,
    }),

  update: (id: number, data: Partial<ApiSlide>) =>
    apiFetch<ApiSlide>(`/slides/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  destroy: (id: number) =>
    apiFetch<void>(`/slides/${id}`, {
      method: "DELETE",
    }),
};

// ---- AI ----
export const aiApi = {
  query: (payload: AiQueryPayload) =>
    apiFetch<{ answer: string }>("/ai/query", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  summarize: (payload: AiSummarizePayload) =>
    apiFetch<{ summary: string; concepts?: string[]; key_points?: string[]; definitions?: Array<{ term: string; definition: string }> }>("/ai/summarize", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ---- Admin users ----
export const adminApi = {
  listUsers: async () => (await apiFetch<AdminUsersResponse>("/admin/users")).data,
  showUser: async (id: number) => (await apiFetch<AdminUserResponse>(`/admin/user/${id}`)).data,
  registerAdmin: async (payload: { name: string; email: string; password: string; password_confirmation: string }) =>
    (await apiFetch<AdminUserResponse>("/admin/register", {
      method: "POST",
      body: JSON.stringify(payload),
    })).data,
};
