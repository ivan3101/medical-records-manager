import * as Mongoosastic from "mongoosastic";
import { Document, model, Model, Schema, Types } from "mongoose";
import { ElasticsearchConnService } from "../../services/elasticsearchConnService";

const elasticsearchService = ElasticsearchConnService.getClassInstance();

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
    index: true,
    required: true,
    type: Boolean,
    unique: false
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
})

studentSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.active;
  delete obj.__v;
  return obj;
};

studentSchema.plugin(Mongoosastic, {
  esClient: elasticsearchService.ElasticInstance,
  index: "students",
  type: "student"
});

export const studentModel: Model<IStudent> = model<IStudent>("estudiante", studentSchema);