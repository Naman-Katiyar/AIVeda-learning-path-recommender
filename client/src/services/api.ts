const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

type ApiResult<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
};
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("aiveda_token");
  if (token) {
    localStorage.setItem("aiveda_token", token);
  }
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const result = (await response.json()) as ApiResult<T>;
  if (!response.ok || !result.success)
    throw new Error(result.message ?? "Something went wrong.");
  return result.data as T;
}
export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<{ token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getProfile: () =>
    request<{
      userId: string;
      occupation?: string;
      education?: string;
      skills?: Array<{ name: string; proficiency: number }>;
    }>("/profile", {
      method: "GET",
    }),
  updateProfile: (body: any) =>
    request("/profile", { method: "PUT", body: JSON.stringify(body) }),
  analyzeGoal: (goal: string) =>
    request("/ai/analyze-goal", {
      method: "POST",
      body: JSON.stringify({ goal }),
    }),
  createGoal: (goal: string) =>
    request("/goals", { method: "POST", body: JSON.stringify({ goal }) }),
  getPaths: () =>
    request<Array<{ id: string; items: any[] }>>("/paths", { method: "GET" }),
  generatePath: () => request("/paths/generate", { method: "POST" }),
  updateProgress: (
    itemId: string,
    status: "in_progress" | "completed" | "available",
  ) =>
    request(`/progress/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  getRecommendations: () =>
    request<Array<{ id: string; title: string; reason: string }>>(
      "/recommendations",
      { method: "GET" },
    ),
  getAnalytics: () =>
    request<{
      overallProgress: number;
      currentStreak: number;
      hoursLearned: number;
      completedTopics: number;
      recentActivity: any[];
    }>("/analytics/dashboard", { method: "GET" }),
  chat: (question: string, currentTopic?: string) =>
    request<{ answer: string }>("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ question, currentTopic }),
    }),
};
