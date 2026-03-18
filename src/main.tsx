import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"

// Apply stored theme class before React renders to prevent flash
const storedTheme = localStorage.getItem('flockmate-theme') || 'dark';
document.documentElement.classList.add(storedTheme);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
