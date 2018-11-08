export const onHoldPermissions = {
  admin: { resources: "onHold", permissions: "*" },
  archivo: { resources: "onHold", permissions: ["read"] },
  estudiante: { resources: "onHold", permissions: ["read yours", "create", "modify"] },
  profesor: { resources: "onHold", permissions: ["read on hold", "change status"] }
};