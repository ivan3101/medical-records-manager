import {Document, Model, model, Schema} from "mongoose";

export abstract class AbstractModel {
    private schema: Schema;
    private model: Model<Document>;

    public get Model(): Model<Document> {
        return this.model;
    }

    protected get Schema() {
        return this.schema;
    }

    protected set Schema(schema) {
        this.schema = schema;
    }

    protected createModel(modelName: string): void {
        this.model = model(modelName, this.schema);
    }

    protected abstract createSchema(): void;
}