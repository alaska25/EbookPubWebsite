import axios from "axios";
import { pushToast } from "../utils/toastStore.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  // Without a timeout, a sleeping or slow backend leaves the UI stuck on
  // "loading" indefinitely.
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("adyoolau_user");
    const token = stored ? JSON.parse(stored)?.token : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // Corrupted storage: send the request without a token instead of
    // throwing and failing every call.
  }
  return config;
});

// Turns a method + URL into a human-readable toast message. Falls back to a
// generic verb per HTTP method when there's no specific match.
function describeAction(method, url = "") {
  const path = url.split("?")[0];

  if (/\/auth\/login/i.test(path)) return "Logged in successfully";
  if (/\/auth\/logout/i.test(path)) return "Logged out successfully";
  if (/\/auth\/register/i.test(path)) return "Account created successfully";
  if (/\/paypal\/capture-order/i.test(path)) return "Payment confirmed";
  if (/\/paypal\/create-order/i.test(path)) return "Checkout started";
  if (/\/auth\/photo/i.test(path)) return "Photo updated";
  if (/\/account\/password/i.test(path)) return "Password updated";
  if (/\/account\/profile/i.test(path)) return "Profile saved";

  switch (method?.toUpperCase()) {
    case "POST":
      return "Created successfully";
    case "PUT":
    case "PATCH":
      return "Updated successfully";
    case "DELETE":
      return "Deleted successfully";
    default:
      return "Action completed successfully";
  }
}

api.interceptors.response.use(
  (response) => {
    const { method, url, silent } = response.config;
    // GET requests stay silent by default — toasting every page load/fetch
    // would be noisy. Set { silent: false } on a specific GET call to opt in,
    // or { silent: true } on a mutation to opt out (e.g. googleLogin in
    // AuthContext.jsx, which pushes its own toast manually).
    const isGet = method?.toUpperCase() === "GET";
    const shouldToast = silent === true ? false : silent === false ? true : !isGet;

    if (shouldToast) {
      pushToast({ type: "success", message: describeAction(method, url) });
    }
    return response;
  },
  (error) => {
    if (error.config?.silent !== true) {
      const message =
        error.response?.data?.message ||
        (error.code === "ECONNABORTED"
          ? "Request timed out. Please try again."
          : "Something went wrong. Please try again.");
      pushToast({ type: "error", message });
    }
    return Promise.reject(error);
  }
);

export default api;