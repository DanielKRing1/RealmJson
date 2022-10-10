const JSON_SCHEMA_SUFFIX: string = 'JSON';
export const SUFFIX_DELIMITER: string = '_';
export const genJsonSchemaName = (collectionName: string): string => `${collectionName}${SUFFIX_DELIMITER}${JSON_SCHEMA_SUFFIX}`;
export const getBaseNameFromSchemaName = (schemaName: string) => {
    const index: number = schemaName.lastIndexOf(SUFFIX_DELIMITER);
    const baseName: string = schemaName.slice(0, index);

    return baseName;
};
