import { OpenAPI } from "@/src/api/core/OpenAPI";

export function initializeOpenApi() {
  OpenAPI.BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  
  OpenAPI.TOKEN = async () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("helix_token") || "";
    }
    return "";
  };

  // Optional: Global error interceptor via monkey-patching fetch for 401s
  if (typeof window !== "undefined") {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        localStorage.removeItem("helix_token");
        window.location.href = "/login";
      }
      return response;
    };
  }
}
