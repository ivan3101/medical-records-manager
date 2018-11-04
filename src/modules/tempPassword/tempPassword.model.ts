import {Schema} from "mongoose";
import {AbstractModel} from "../../abstracts/model";
import {HelperService} from "../../services/helperService";

export class TempPasswordModel extends AbstractModel {

    constructor() {
        super();
        this.createSchema();
        this.initVirtuals();
        super.createModel("Contraseña");
    }

    protected createSchema(): void {
        super.Schema = new Schema({
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
                ref: "Estudiante",
                required: [true, "Debe ingresar el estudiante al que se le asignara la contraseña"],
                type: Schema.Types.ObjectId
            },
            "fecha_de_caducidad": {
                required: [true, "Debe ingresar la fecha de caducidad de la contraseña"],
                type: Date
            },
            "fecha_de_creacion": {
                default: Date.now(),
                required: true,
                type: Date
            },
            "paciente": {
                ref: "Paciente",
                required: [true, "Debe ingresar el paciente al que se accedera usando la contraseña"],
                type: Schema.Types.ObjectId
            }
        }, {
            toJSON: {
                virtuals: true
            }
        })
    }

    private initVirtuals(): void {
        super.Schema.virtual("contraseña").set(async function() {
            try {
                this.contraseña = await HelperService.hashPassword(this.contraseña);
            } catch (e) {
                throw e;
            }
        })
    }
}