import { Document, Schema, Types } from "mongoose";
import {AbstractModel} from "../../abstracts/model";
import {HelperService} from "../../services/helperService";

export interface ITempPassword extends Document {
  contraseña: string,
  estado: string,
  estudiante: {
      cedula: string,
      id: Types.ObjectId
  },
  fechaDeCaducidad: Date,
  fechaDeCreacion: Date,
  paciente: Types.ObjectId
}

export class TempPasswordModel extends AbstractModel {

  constructor() {
    super();
    this.createSchema();
    super.createModel("contraseña");
  }

  protected createSchema(): void {
    super.Schema = new Schema({
      "contraseña": {
        required: true,
        type: String
      },
      "estado": {
        default: "Activo",
        enum: ["Activo", "Inactivo"],
        required: true,
        type: String
      },
      "estudiante": {
        "cedula": {
          required: true,
          type: String
        },
        "estudianteId": {
          ref: "estudiante",
          required: [true, "Debe ingresar el estudiante al que se le asignara la contraseña"],
          type: Schema.Types.ObjectId
        }
      },
      "fechaDeCaducidad": {
        required: [true, "Debe ingresar la fecha de caducidad de la contraseña"],
        type: Date
      },
      "fechaDeCreacion": {
        default: Date.now(),
        required: true,
        type: Date
      },
      "paciente": {
        ref: "Paciente",
        required: [true, "Debe ingresar el paciente al que se accedera usando la contraseña"],
        type: Schema.Types.ObjectId
      }
    })
  }
}