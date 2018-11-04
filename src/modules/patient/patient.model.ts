import {Schema} from "mongoose";
import {AbstractModel} from "../../abstracts/model";

export class PatientModel extends AbstractModel{


    constructor() {
        super();
        this.createSchema();
        super.createModel('Paciente');
    }

    protected createSchema(): void {
        super.Schema = new Schema({
            "apellido": {
                required: [true, "Debe ingresar el apellido del paciente"],
                type: String
            },
            "cedula": {
                required: [true, "Debe ingresar la cedula del paciente"],
                type: String
            },
            "direccion": {
                required: [true, "Debe ingresar la dirección de vivienda actual del paciente"],
                type: String
            },
            "edad": {
                required: [true, "Debe ingresar la edad del paciente"],
                type: Number
            },
            "fecha_de_nacimiento": {
                required: [true, "Debe ingresar la fecha de nacimiento del paciente"],
                type: Date
            },
            "lugar_de_nacimiento": {
                required: [true, "Debe ingresar el lugar de nacimiento del paciente"],
                type: String
            },
            "nombre": {
                required: [true, "Debe ingresar el nombre del paciente"],
                type: String
            },
            "sexo": {
                enum: ["Masculino", "Femenino"],
                required: [true, "Debe ingresar el sexo del paciente"],
                type: String,
            },
            "telefono": {
                required: [true, "Debe ingresar el numero de telefono del paciente"],
                type: String
            }
        })
    }
}