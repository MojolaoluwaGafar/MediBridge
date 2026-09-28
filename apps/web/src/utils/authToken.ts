export const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

export const clearAuth = (): void => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};

