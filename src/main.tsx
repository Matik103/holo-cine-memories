import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@/i18n";
import { initSupabase } from "@/integrations/supabase/client";

// Initialize Supabase (from env or from Supabase public-config at runtime), then render.
initSupabase()
  .then(() => {
    createRoot(document.getElementById("root")!).render(<App />);
  })
  .catch((e) => {
    console.error("Supabase init failed:", e);
    document.getElementById("root")!.innerHTML = `<div style="padding:2rem;font-family:sans-serif;text-align:center;">Failed to load config. Check console.</div>`;
  });
