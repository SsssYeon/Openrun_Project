const API_BASE = process.env.REACT_APP_API_BASE ?? "/api";

export async function apiFetch<T = any>(path: string, init: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        credentials: "include",           // 쿠키 포함
        headers: {
            "Content-Type": "application/json",
            ...(init.headers || {}),
        },
        ...init,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
}
