import { Document, model, Model, Schema, Types } from "mongoose";

export interface ITriage extends Document {
  documento: Map<string, string>,
  estudiante: Types.ObjectId,
  fechaDeAprobacion: Date,
  fechaDeCreacion: Date,
  modificaciones: [{
    document: Map<string, string>,
    estudiante: Types.ObjectId,
    fechaDeAprobacion: Date,
    fechaDeCreacion: Date,
    profesor: Types.ObjectId,
  }],
  numeroDeHistoria: {
    codigo: string,
    numero: number
  },
  paciente: Types.ObjectId,
  profesor: Types.ObjectId
}


const triageSchema = new Schema({
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

triageSchema.statics.setRecordNumber = async function() {
  const lastTriage = await this
    .find({})
    .where("numeroDeHistoria.codigo").equals("CIN-18")
    .sort({ "numeroDeHistoria.numero": -1 })
    .limit(1)
    .select("numeroDeHistoria");

  if (lastTriage.length){
    const lastNumber = lastTriage[0].numeroDeHistoria.numero;

    return {
      "codigo": "CIN-18",
      "numero": lastNumber + 1
    };

  } else {
    return {
      "codigo": "CIN-18",
      "numero": 1
    };
  }
};

export const triageModel: Model<ITriage> = model<ITriage>("triaje", triageSchema);