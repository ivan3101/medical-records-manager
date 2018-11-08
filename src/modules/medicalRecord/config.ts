export const medicalRecordPermissions = {
  admin: { resources: "medicalRecord", permissions: "*"},
  archivo: { resources: "medicalRecord", permissions: ["read", "create", "update", "delete"]}
};