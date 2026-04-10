export const getIdentityServiceHealth = () => {
  return {
    status: "ok" as const,
    service: "identity-service",
    boundedContext: "authentication"
  };
};

export const getIdentityServiceDescriptor = () => {
  return {
    name: "identity-service",
    kind: "domain-service" as const,
    basePath: "/services/identity",
    healthPath: "/services/identity/health",
    responsibilities: [
      "Menangani login dan penerbitan JWT",
      "Memvalidasi kredensial demo",
      "Menjadi kandidat auth service terpisah"
    ],
    integrations: ["API Gateway", "JWT secret", "API key validation"]
  };
};
