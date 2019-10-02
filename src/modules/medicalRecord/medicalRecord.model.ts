import { Document, Model, model, Schema, Types } from "mongoose";

export interface IMedicalRecord extends Document {
  active: boolean,
  documento: Map<string, string>,
  fechaDeCreacion: Date,
  paciente: Types.ObjectId,
}


const medicalRecordSchema = new Schema({
  "active": {
    default: true,
    required: true,
    type: Boolean
  },
  "documento": {
    of: Schema.Types.Mixed,
    required: true,
    type: Map
  },
  "fechaDeCreacion": {
    default: Date.now(),
    required: true,
    type: Date
  },
  "paciente": {
    ref: "paciente",
    required: true,
    type: Schema.Types.ObjectId
  }
});

export const medicalRecordModel: Model<IMedicalRecord> = model<IMedicalRecord>("historiamedica", medicalRecordSchema, "historiasmedicas");