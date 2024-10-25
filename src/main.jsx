import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Tag1 from "./Tag1.jsx";
import Tag from "./Tag.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <App /> */}
    <Tag1 />
    {/* <Tag /> */}
  </StrictMode>
);
