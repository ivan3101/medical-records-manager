import { Document, model, Model, Schema, Types } from "mongoose";

export interface ITempPassword extends Document {
  contraseña: string,
  estado: string,
  estudiante: {
    cedula: string,
    id: Types.ObjectId
  },
  fechaDeCaducidad: Date,
  fechaDeCreacion: Date,
  paciente: Types.ObjectId,
  profesor: Types.ObjectId
}

const tempPasswordSchema = new Schema({
  "cedula": {
    required: true,
    type: String
  },
  "contraseña": {
    required: true,
    type: String
  },
  "estado": {
    default: "Activo",
    enum: ["Activo", "Inactivo"],
    required: true,
    type: String
  },
  "estudiante": {
    ref: "estudiante",
    required: [true, "Debe ingresar el estudiante al que se le asignara la contraseña"],
    type: Schema.Types.ObjectId
  },
  "fechaDeCaducidad": {
    required: [true, "Debe ingresar la fecha de caducidad de la contraseña"],
    type: Date,
  },
  "fechaDeCreacion": {
    default: Date.now(),
    required: true,
    type: Date
  },
  "paciente": {
    ref: "paciente",
    required: [true, "Debe ingresar el paciente al que se accedera usando la contraseña"],
    type: Schema.Types.ObjectId
  },
  "profesor": {
    ref: "personal",
    type: Schema.Types.ObjectId
  }
});

tempPasswordSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.contraseña;
  delete obj.estudiante.cedula;
  delete obj.__v;
  return obj;
};

export const tempPasswordModel: Model<ITempPassword> = model<ITempPassword>("contraseña", tempPasswordSchema);