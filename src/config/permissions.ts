import * as Acl from "acl";
import { medicalRecordPermissions } from "../modules/medicalRecord/config";
import { onHoldPermissions } from "../modules/onHold/config";
import { patientPermissions } from "../modules/patient/config";
import { personalPermissions } from "../modules/personal/config";
import { studentPermissions } from "../modules/student/config";
import { tempPasswordPermissions } from "../modules/tempPassword/config";
import { triagePermissions } from "../modules/triage/config";

const permissions = new Acl(new Acl.memoryBackend());

permissions.allow([
  {
    allows: [
      medicalRecordPermissions.admin,
      onHoldPermissions.admin,
      patientPermissions.admin,
      personalPermissions.admin,
      studentPermissions.admin,
      tempPasswordPermissions.admin,
      triagePermissions.admin
    ],
    roles: ["admin"]
  },
  {
    allows: [
      medicalRecordPermissions.archivo,
      onHoldPermissions.archivo,
      patientPermissions.archivo,
      personalPermissions.archivo,
      studentPermissions.archivo,
      triagePermissions.archivo
    ],
    roles: ["archivo"]
  },
  {
    allows: [
      onHoldPermissions.profesor
    ],
    roles: ["profesor"]
  },
  {
    allows: [
      onHoldPermissions.estudiante
    ],
    roles: ["estudiante"]
  }
]);

export { permissions }