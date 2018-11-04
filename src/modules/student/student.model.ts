import {Schema} from "mongoose";
import {AbstractModel} from "../../abstracts/model";

export class StudentModel extends AbstractModel{

    constructor() {
        super();
        this.createSchema();
        super.createModel("Estudiante");
    }

    protected createSchema(): void {
        super.Schema = new Schema({
            "apellido": {
                required: [true, "Debe ingresar el apellido del estudiante"],
                type: String
            },
            "cedula": {
                required: [true, "Debe ingresar la cedula del estudiante"],
                type: String
            },
            "email": {
                required: [true, "Debe ingresar el email del estudiante"],
                type: String
            },
            "nombre": {
                required: [true, "Debe ingresar el nombre del estudiante"],
                type: String
            },
            "telefono": {
                required: [true, "Debe ingresar el numero de telefono del estudiante"],
                type: String
            }
        });
    }
}