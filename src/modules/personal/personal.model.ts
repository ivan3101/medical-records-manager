import { Document, model, Model, Schema, Types } from "mongoose";


export interface IPersonal extends Document {
  active: string,
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

const personalSchema = new Schema({
  "active": {
    default: true,
    required: true,
    type: Boolean
  },
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
    enum: ["admin", "archivo", "profesor"],
    required: [true, "Debe ingresar el rol del miembro del personal"],
    type: String
  },
  "telefono": {
    required: [true, "Debe ingresar el numero de telefono del miembro del personal"],
    type: String
  }
});

personalSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.contraseña;
  delete obj.__v;
  return obj;
}

export const personalModel: Model<IPersonal> = model<IPersonal>("personal", personalSchema);