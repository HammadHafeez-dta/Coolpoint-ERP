import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./shared/styles/globals.css";

createRoot(document.getElementById("root")!).render(<App />);

// Allow clicking anywhere on date/month inputs to open the picker natively
document.addEventListener("click", (e) => {
  const target = e.target as HTMLInputElement;
  if (target && target.tagName === "INPUT" && (target.type === "date" || target.type === "month")) {
    try {
      target.showPicker?.();
    } catch {}
  }
});
