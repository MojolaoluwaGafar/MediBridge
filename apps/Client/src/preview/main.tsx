import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router";
import "../index.css";
import "./preview.css";
import PortalPreview from "./PortalPreview";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MemoryRouter>
      <PortalPreview />
    </MemoryRouter>
  </StrictMode>
);
