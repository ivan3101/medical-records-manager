export const patientPermissions = {
  admin: { resources: "patient", permissions: "*" },
  archivo: { resources: "patient", permissions: ["read", "create", "modify", "delete"] },
  profesor: { resources: "patient", permissions: ["read"] }
};