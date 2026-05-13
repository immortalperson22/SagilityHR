import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize dark mode BEFORE rendering to prevent flash
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark' || !savedTheme) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

createRoot(document.getElementById("root")!).render(<App />);
