import {Schema} from "mongoose";
import {AbstractModel} from "../../abstracts/model";

export class MedicalRecordModel extends AbstractModel {

    constructor() {
        super();
        this.createSchema();
        super.createModel("medicalrecord");
    }

    protected createSchema(): void {
        super.Schema = new Schema({
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
            "fecha_de_aprobacion": {
                default: Date.now(),
                required: true,
                type: Date
            },
            "fecha_de_creacion": {
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
                "fecha_de_aprobacion": {
                    default: Date.now(),
                    required: true,
                    type: Date
                },
                "fecha_de_creacion": {
                    required: true,
                    type: Date
                },
                "profesor": {
                    ref: "profesor",
                    required: true,
                    type: Schema.Types.ObjectId
                }
            }],
            "numero_historia": {
                required: true,
                type: String
            },
            "paciente": {
                ref: "paciente",
                required: true,
                type: Schema.Types.ObjectId
            },
            "profesor": {
                ref: "profesor",
                required: true,
                type: Schema.Types.ObjectId
            }
        })
    }
}