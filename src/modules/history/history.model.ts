import { Document, Model, model, Schema, Types } from "mongoose";

export interface IHistory extends Document {
  accion: string,
  autor: {
    id: Types.ObjectId,
    type: string
  },
  cambios: Map<string,any>,
  fechaDeCreacion: Date,
  paciente: Types.ObjectId
}

const historySchema = new Schema({
  "accion": {
    required: true,
    type: String
  },
  "autor": {
    "id": {
      refPath: "autor.type",
      type: Schema.Types.ObjectId
    },
    "type": {
      enum: ["estudiante", "personal"],
      required: true,
      type: String
    }
  },
  "cambios": {
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
    type: Schema.Types.ObjectId
  }
});

export const historyModel: Model<IHistory> = model<IHistory>("historial", historySchema, "historial");