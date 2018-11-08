export const studentPermissions = {
  admin: { resources: "student", permissions: "*" },
  archivo: { resources: "student", permissions: ["read", "create", "modify", "delete"] },
};