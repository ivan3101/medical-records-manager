import {Schema} from "mongoose";
import {AbstractModel} from "../../abstracts/model";

export class TriajeModel extends AbstractModel {

    constructor() {
        super();
        this.createSchema();
        super.createModel("triaje");
    }

    protected createSchema(): void {
        this.Schema = new Schema({
            "documento": {
                of: String,
                required: true,
                type: Map
            },
            "estudiante": {
                ref: "Estudiante",
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
                    ref: "Estudiante",
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
                    ref: "Profesor",
                    required: true,
                    type: Schema.Types.ObjectId
                }
            }],
            "numero_historia": {
                required: true,
                type: String
            },
            "profesor": {
                ref: "Profesor",
                required: true,
                type: Schema.Types.ObjectId
            }
        })
    }
}