import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./global.css";
import { ReplaysProvider } from "./ReplaysContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ReplaysProvider>
      <App />
    </ReplaysProvider>
  </StrictMode>
);
