import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import keycloak from "./keycloak";

keycloak
  .init({
    onLoad: "login-required",
    pkceMethod: "S256",
    checkLoginIframe: false,
  })
  .then((authenticated) => {
    if (!authenticated) {
      window.location.reload();
      return;
    }

    createRoot(document.getElementById("root")).render(
      <App keycloak={keycloak} />
    );
  })
  .catch((error) => {
    console.error("Keycloak initialization failed:", error);
  });
