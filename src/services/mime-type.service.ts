import logger from "../util/logger";

export class MimeTypeService {
    private _types: Map<string, tiles.MimeType>;
    private _typesByType: Map<string, tiles.MimeType>;
    private _typesByExtension: Map<string, tiles.MimeType>;

    constructor(private _options: tiles.ServerOptions) {
        this._types = new Map<string, tiles.MimeType>();
        this._typesByType = new Map<string, tiles.MimeType>();
        this._typesByExtension = new Map<string, tiles.MimeType>();
        this._loadMimeTypes();
    }

    /**
     * Find a MimeType by its InternalName.
     * @param name The internal name of the MimeType.
     * @returns The MimeType if it exists; null otherwise.
     */
    public getMimeTypeByInternalName(name: string): tiles.MimeType {
        if (!name) {
            return null;
        }

        name = name.toLowerCase();
        if (!this._types.has(name)) {
            logger.warn(`Unknown mime-type format ${name}.`);
            return null;
        }

        return this._types.get(name);
    }

    /**
     * Find a MimeType by its type, eg "image/png".
     * @param type The type of the MimeType, e.g. "image/png".
     * @returns The MimeType if it exists; null otherwise.
     */
    public getMimeTypeByType(type: string): tiles.MimeType {
        if (!type) {
            return null;
        }

        type = type.toLowerCase();
        if (!this._typesByType.has(type)) {
            logger.warn(`Unknown mime-type ${type}.`);
            return null;
        }

        return this._typesByType.get(type);
    }

    /**
     * Find a MimeType by its file extension.
     * @param fileExtension The file extension of the MimeType.
     * @returns The MimeType if it exists; null otherwise.
     */
    public getMimeTypeByFileExtension(fileExtension: string): tiles.MimeType {
        if (!fileExtension) {
            return null;
        }

        fileExtension = fileExtension.toLowerCase();
        if (!this._typesByExtension.has(fileExtension)) {
            logger.warn(`No mime-type with file extension ${fileExtension}.`);
            return null;
        }

        return this._typesByExtension.get(fileExtension);
    }

    private _loadMimeTypes(): void {
        for (const t of this._options.mimeTypes) {
            try {
                this._types.set(t.internalName.toLowerCase(), t);
                this._typesByType.set(t.type.toLowerCase(), t);
                this._typesByExtension.set(t.fileExtension.toLowerCase(), t);
            }
            catch (e) {
                logger.error(e);
            }
        }
    }
}