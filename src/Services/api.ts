import axios from "axios";

const API = axios.create({
  // Base URL stops at /api
  baseURL: "http://localhost:8000/api", 
  withCredentials: true,
});

// ---------------------------
// Auth API calls
// ---------------------------
export const loginAPI = (employee_id: string, password: string) =>
  // Must match path('api/auth/', include('accounts.urls')) in your main urls.py
  API.post("/auth/login/", { employee_id, password });

export const changePasswordAPI = (
  old_password: string, 
  new_password: string, 
  confirm_password: string
) =>
  API.post("/auth/change-password/", {
    old_password,
    new_password,
    confirm_password,
  });

export const logoutAPI = () => API.post("/auth/logout/");

export default API;