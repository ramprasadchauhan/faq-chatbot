import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Tag1 from "./Tag1.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Tag1 />
  </StrictMode>
);
