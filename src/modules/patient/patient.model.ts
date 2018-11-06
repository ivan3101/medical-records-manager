import { Document, model, Model, Schema, Types } from "mongoose";

export interface IPatient extends Document {
  apellido: string,
  cedula: string,
  direccion: string,
  edad: number,
  fechaDeNacimiento: Date,
  genero: string,
  id: Types.ObjectId
  lugarDeNacimiento: string,
  nombre: string,
  telefono: string
}

const patientSchema = new Schema({
  "apellido": {
    required: [true, "Debe ingresar el apellido del paciente"],
    type: String
  },
  "cedula": {
    required: [true, "Debe ingresar la cedula del paciente"],
    type: String
  },
  "direccion": {
    required: [true, "Debe ingresar la dirección de vivienda actual del paciente"],
    type: String
  },
  "edad": {
    required: [true, "Debe ingresar la edad del paciente"],
    type: Number
  },
  "fechaDeNacimiento": {
    required: [true, "Debe ingresar la fecha de nacimiento del paciente"],
    type: Date
  },
  "genero": {
    enum: ["Masculino", "Femenino"],
    required: [true, "Debe ingresar el sexo del paciente"],
    type: String,
  },
  "lugarDeNacimiento": {
    required: [true, "Debe ingresar el lugar de nacimiento del paciente"],
    type: String
  },
  "nombre": {
    required: [true, "Debe ingresar el nombre del paciente"],
    type: String
  },
  "telefono": {
    required: [true, "Debe ingresar el numero de telefono del paciente"],
    type: String
  }
});

export const patientModel: Model<IPatient> = model<IPatient>("paciente", patientSchema);