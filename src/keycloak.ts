import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "task-management",
  clientId: "task-dashboard-ui",
});

export default keycloak;
