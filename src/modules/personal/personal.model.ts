import { Document, Schema, Types } from "mongoose";
import {AbstractModel} from "../../abstracts/model";
import {HelperService} from "../../services/helperService";

export interface IPersonal extends Document {
  apellido: string;
  cedula: string;
  contraseña: string;
  email: string;
  id: Types.ObjectId
  nombreDeUsuario: string;
  nombre: string;
  rol: string;
  telefono: string;
}

export class PersonalModel extends AbstractModel {

  constructor() {
    super();
    this.createSchema();
    super.createModel("personal");
  }

  protected createSchema(): void {
    super.Schema = new Schema({
      "apellido": {
        required: [true, "Debe ingresar el apellido del miembro del personal"],
        type: String
      },
      "cedula": {
        required: [true, "Debe ingresar la cedula del miembro del personal"],
        type: String
      },
      "contraseña": {
        required: [true, "Debe ingresar la contraseña del miembro del personal"],
        type: String
      },
      "email": {
        required: [true, "Debe ingresar el email del miembro del personal"],
        type: String
      },
      "nombre": {
        required: [true, "Debe ingresar el nombre del miembro del personal"],
        type: String
      },
      "nombreDeUsuario": {
        required: [true, "Debe ingresar el nombre de usuario del miembro del personal"],
        type: String
      },
      "rol": {
        enum: ["archivo", "profesor"],
        required: [true, "Debe ingresar el rol del miembro del personal"],
        type: String
      },
      "telefono": {
        required: [true, "Debe ingresar el numero de telefono del miembro del personal"],
        type: String
      }
    })
  }
}