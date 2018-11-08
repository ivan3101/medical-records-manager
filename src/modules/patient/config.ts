export const patientPermissions = {
  admin: { resources: "patient", permissions: "*" },
  archivo: { resources: "patient", permissions: ["read", "create", "modify", "delete"] },
};