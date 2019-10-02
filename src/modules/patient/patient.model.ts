import * as Mongoosastic from "mongoosastic";
import { Document, model, Model, Schema, Types } from "mongoose";
import { ElasticsearchConnService } from "../../services/elasticsearchConnService";

const elasticsearchService = ElasticsearchConnService.getClassInstance();

export interface IPatient extends Document {
  active: boolean,
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
  "active": {
    default: true,
    required: true,
    type: Boolean
  },
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
  "email": {
    required: [true, "Debe ingresar el correo electronico del paciente"],
    type: String
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
    index: true,
    required: [true, "Debe ingresar el nombre del paciente"],
    type: String,
    unique: false
  },
  "telefono": {
    required: [true, "Debe ingresar el numero de telefono del paciente"],
    type: String
  }
});

patientSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.active;
  delete obj.__v;
  return obj;
};

patientSchema.plugin(Mongoosastic, {
  esClient: elasticsearchService.ElasticInstance,
  index: "patients",
  type: "patient"
})

export const patientModel: Model<IPatient> = model<IPatient>("paciente", patientSchema);