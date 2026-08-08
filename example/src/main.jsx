import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// The uploader ships its own stylesheet. Import it once.
import "@fastpix/fp-react-uploader/styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
