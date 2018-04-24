export class ResourceUrl {
    public format: string;
    public resourceType: string;
    public template: string;

    constructor(format: string, resourceType: string, template: string) {
        if (!format) {
            throw new Error("Format cannot be empty.");
        }

        if (!resourceType) {
            throw new Error("Resource type cannot be empty.");
        }

        if (!template) {
            throw new Error("Template cannot be empty.");
        }

        this.format = format;
        this.resourceType = resourceType;
        this.template = template;
    }
}