import { Document, model, Model, Schema, Types } from "mongoose";

export interface ITriage extends Document {
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


const triageSchema = new Schema({
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
  "numeroDeHistoria": {
    "codigo": {
      required: true,
      type: String
    },
    "numero": {
      required: true,
      type: Number
    }
  },
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

export const triageModel: Model<ITriage> = model<ITriage>("triaje", triageSchema);