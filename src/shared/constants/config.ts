export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL || "https://backend.cp.synctecho.com/api";

export const APP_URL: string =
  import.meta.env.VITE_APP_URL || "https://cp.synctecho.com";

export const APP_ENV: string =
  import.meta.env.VITE_APP_ENV || (import.meta.env.DEV ? "development" : "production");

export const IS_DEV: boolean = APP_ENV === "development" || import.meta.env.DEV;
export const IS_PROD: boolean = APP_ENV === "production" || import.meta.env.PROD;
