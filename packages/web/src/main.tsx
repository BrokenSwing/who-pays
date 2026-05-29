import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { RegistryProvider } from "@effect-atom/atom-react";
import { router } from "./router";
import "./tailwind.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RegistryProvider>
      <RouterProvider router={router} />
    </RegistryProvider>
  </StrictMode>,
);
