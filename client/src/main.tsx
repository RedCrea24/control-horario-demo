import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initStore } from "./lib/store";
import App from "./App";
import "./index.css";

// Initialize mock database in localStorage
initStore();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
