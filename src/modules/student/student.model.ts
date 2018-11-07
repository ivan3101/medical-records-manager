import { Document, model, Model, Schema, Types } from "mongoose";

export interface IStudent extends Document {
  active: boolean,
  apellido: string,
  cedula: string,
  email: string,
  id: Types.ObjectId
  nombre: string,
  telefono: string
}

const studentSchema = new Schema({
  "active": {
    default: true,
    required: true,
    type: Boolean
  },
  "apellido": {
    required: [true, "Debe ingresar el apellido del estudiante"],
    type: String
  },
  "cedula": {
    required: [true, "Debe ingresar la cedula del estudiante"],
    type: String
  },
  "email": {
    required: [true, "Debe ingresar el email del estudiante"],
    type: String
  },
  "nombre": {
    required: [true, "Debe ingresar el nombre del estudiante"],
    type: String
  },
  "telefono": {
    required: [true, "Debe ingresar el numero de telefono del estudiante"],
    type: String
  }
});

export const studentModel: Model<IStudent> = model<IStudent>("estudiante", studentSchema);