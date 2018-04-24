export class Style {
    public identifier: string;
    public title: string[];
    public abstract: string[];
    public keywords: string[];
    public legendUrl: wmts.LegendUrl[];
    public isDefault: boolean;

    constructor(identifier: string) {
        if (!identifier) {
            throw new Error("Identifier cannot be empty.");
        }

        this.identifier = identifier;
    }
}