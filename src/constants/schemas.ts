import { genJsonSchemaName } from "./naming";

// CONSTANTS
export const ID_KEY: string = 'id';
export const JSON_KEY: string = 'json';

/**
 * Create a base schema for node/edge GraphEntities
 *
 * @param schemaName
 * @param properties
 * @returns
 */
 export const genBaseSchema = (schemaName: string): Realm.ObjectSchema => {
    // 1. Add id to schema properties
    return {
        name: genJsonSchemaName(schemaName),
        primaryKey: ID_KEY,
        properties: {
            [ID_KEY]: 'string',
            [JSON_KEY]: '{}',
        },
    };
};