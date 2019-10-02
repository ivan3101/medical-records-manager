export const medicalRecordPermissions = {
  admin: { resources: "medicalRecord", permissions: "*" },
  archivo: {
    permissions: ["read", "create", "update", "delete"],
    resources: "medicalRecord"
  }
};
