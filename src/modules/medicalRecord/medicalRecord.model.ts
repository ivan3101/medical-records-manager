import { Document, Model, model, Schema, Types } from "mongoose";

export interface IMedicalRecord extends Document {
  active: boolean,
  documento: Map<string, string>,
  estudiante: Types.ObjectId,
  fechaDeAprobacion: Date,
  fechaDeCreacion: Date,
  modificaciones: {
    document: Map<string, string>,
    estudiante: Types.ObjectId,
    fechaDeAprobacion: Date,
    fechaDeCreacion: Date,
    profesor: Types.ObjectId,
  },
  numeroDeHistoria: {
    codigo: string,
    numero: number
  },
  paciente: Types.ObjectId,
  profesor: Types.ObjectId
}


const medicalRecordSchema = new Schema({
  "active": {
    default: true,
    required: true,
    type: Boolean
  },
  "documento": {
    of: String,
    required: true,
    type: Map
  },
  "estudiante": {
    ref: "estudiante",
    required: true,
    type: Schema.Types.ObjectId
  },
  "fechaDeAprobacion": {
    type: Date
  },
  "fechaDeCreacion": {
    required: true,
    type: Date
  },
  "modificaciones": [{
    "documento": {
      of: String,
      required: true,
      type: Map
    },
    "estudiante": {
      ref: "estudiante",
      required: true,
      type: Schema.Types.ObjectId
    },
    "fechaDeAprobacion": {
      default: Date.now(),
      required: true,
      type: Date
    },
    "fechaDeCreacion": {
      required: true,
      type: Date
    },
    "profesor": {
      ref: "personal",
      required: true,
      type: Schema.Types.ObjectId
    }
  }],
  "paciente": {
    ref: "paciente",
    required: true,
    type: Schema.Types.ObjectId
  },
  "personal": {
    ref: "personal",
    required: true,
    type: Schema.Types.ObjectId
  }
});

export const medicalRecordModel: Model<IMedicalRecord> = model<IMedicalRecord>("historiamedica", medicalRecordSchema, "historiasmedicas");