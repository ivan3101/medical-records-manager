import {Schema} from "mongoose";
import {AbstractModel} from "../../abstracts/model";
import {HelperService} from "../../services/helperService";

export class PersonalModel extends AbstractModel {

    constructor() {
        super();
        this.createSchema();
        this.initVirtuals();
        super.createModel("Personal");
    }

    protected createSchema(): void {
        super.Schema = new Schema({
            "apellido": {
                required: [true, "Debe ingresar el apellido del miembro del personal"],
                type: String
            },
            "cedula": {
                required: [true, "Debe ingresar la cedula del miembro del personal"],
                type: String
            },
            "constraseña": {
                required: [true, "Debe ingresar la contraseña del miembro del personal"],
                type: String
            },
            "email": {
                required: [true, "Debe ingresar el email del miembro del personal"],
                type: String
            },
            "nombre": {
                required: [true, "Debe ingresar el nombre del miembro del personal"],
                type: String
            },
            "rol": {
                enum: ["Archivo", "Profesor", "Administrador"],
                required: [true, "Debe ingresar el rol del miembro del personal"],
                type: String
            },
            "telefono": {
                required: [true, "Debe ingresar el numero de telefono del miembro del personal"],
                type: String
            },
            "username": {
                required: [true, "Debe ingresar el nombre de usuario del miembro del personal"],
                type: String
            }
        }, {
            toJSON: {
                virtuals: true
            }
        })
    }

    private initVirtuals(): void {
        super.Schema.virtual("password").set(async function () {
            try {
                this.contraseña = await HelperService.hashPassword(this.contraseña)
            } catch (e) {
                throw e;
            }
        })
    }
}