import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import App from "./App.tsx";
import "./index.css";
import i18n from "@/i18n";
import { initSupabase } from "@/integrations/supabase/client";

// Initialize Supabase (from env or from Supabase public-config at runtime), then render.
initSupabase()
  .then(() => {
    createRoot(document.getElementById("root")!).render(
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    );
  })
  .catch((e) => {
    document.getElementById("root")!.innerHTML = `<div style="padding:2rem;font-family:sans-serif;text-align:center;">Failed to load config. Check console.</div>`;
  });
