import { Document, model, Model, Schema, Types } from "mongoose";

export interface IOnHold extends Document {
  active: boolean,
  documento: Map<string, string>,
  estado: string,
  estudiante: Types.ObjectId,
  fechaDeCreacion: Date,
  modificacion: boolean,
  paciente: Types.ObjectId,
  profesor: Types.ObjectId,
  tipo: string
}

const onHoldSchema = new Schema({
  "active": {
    default: true,
    required: true,
    type: Boolean
  },
  "documento": {
    required: true,
    type: Map
  },
  "estado": {
    default: "En espera",
    enum: ["En espera", "Aprobado", "Rechazado"],
    required: true,
    type: String
  },
  "estudiante": {
    ref: "estudiante",
    required: true,
    type: Schema.Types.ObjectId
  },
  "fechaDeCreacion": {
    default: Date.now(),
    type: Date
  },
  "modificacion": {
    required: true,
    type: Boolean
  },
  "paciente": {
    ref: "paciente",
    required: true,
    type: Schema.Types.ObjectId
  },
  "profesor": {
    ref: "personal",
    required: true,
    type: Schema.Types.ObjectId
  },
  "tipo": {
    enum: ["triaje", "historia principal"],
    required: true,
    type: String
  }
});

export const onHoldModel: Model<IOnHold> = model<IOnHold>("enespera", onHoldSchema, "enespera");