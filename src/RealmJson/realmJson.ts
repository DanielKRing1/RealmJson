import Realm, { UpdateMode } from 'realm';
import MetaRealm, { SaveSchemaParams } from '@asianpersonn/metarealm';

import { RealmJson, RealmJsonRow, RJCreateParams, RJDeletePropertiesParams, RJLoadJsonParams } from './types';
import { genBaseSchema, JSON_KEY } from '../constants/schemas';
import { Dict } from '../types';
import { genJsonSchemaName } from '../constants/naming';
import { gen_NO_JSON_ROW_ERROR } from './errors';

/**
 * Saves RealmJson Json schema to LoadableSchema table
 * Then reloads the MetaRealm LoadableRealm with theis new schema
 * 
 * @param param0 
 * @returns 
 */
 export const createRealmJson = async ({ metaRealmPath, loadableRealmPath, collectionName }: RJCreateParams): Promise<RealmJson> => {
    // 1. Save new Json Node and Edge schemas
    _saveJsonSchema(metaRealmPath, loadableRealmPath, collectionName);
    
    // 2. Reload LoadableRealm with new schemas, so propertyNames can be accessed from LoadableSchema
    await MetaRealm.LoadableRealmManager.reloadRealm({ metaRealmPath, loadableRealmPath });

    // 3. Setup RealmJson
    const RealmJson: RealmJson = await initializeRealmJson({ metaRealmPath, loadableRealmPath, collectionName });

    return RealmJson;
};

export const loadRealmJson = async ({ metaRealmPath, loadableRealmPath, collectionName, shouldReloadRealm=true }: RJLoadJsonParams): Promise<RealmJson> => {
    // 1. Initialize RealmJson
    const realmJson: RealmJson = await initializeRealmJson({ metaRealmPath, loadableRealmPath, collectionName });

    // 2. Reload realm (optional bcus may be loading multiple RealmJsons)
    if(shouldReloadRealm) await realmJson.reloadRealm();
    
    return realmJson;
};

const initializeRealmJson = async ({ metaRealmPath, loadableRealmPath, collectionName }: RJCreateParams): Promise<RealmJson> => {

    // REALM JSON METHODS
    function getCollectionName(): string { return collectionName; };
    function getMetaRealmPath(): string { return metaRealmPath; };
    function getLoadableRealmPath(): string { return loadableRealmPath; };

    function _getAllJsonRows(): Realm.Results<RealmJsonRow & Realm.Object> {
        const loadedJsonRealm: Realm = loadRealmSync();
        const allJsonRows: Realm.Results<RealmJsonRow & Realm.Object> = loadedJsonRealm.objects(genJsonSchemaName(collectionName));

        return allJsonRows;
    }

    /**
     * 
     * @param key 
     * @param create Will create new json row if true; will throw error if false
     * @returns 
     */
    function _getJsonRow(key: string, create: boolean=true): RealmJsonRow & Realm.Object {
        const loadedJsonRealm: Realm = loadRealmSync();
        // 1. Get json row
        let jsonRow: (RealmJsonRow & Realm.Object) | undefined = loadedJsonRealm.objectForPrimaryKey(genJsonSchemaName(collectionName), key);

        // 2. Not exists
        if(jsonRow === undefined) {
            // 2.1. Create
            if(create) jsonRow = _createJsonRow(key);
            // 2.2. Throw
            else throw gen_NO_JSON_ROW_ERROR(key);
        }

        return jsonRow;
    }

    function _createJsonRow(key: string): RealmJsonRow & Realm.Object | never {
        const loadedJsonRealm: Realm = loadRealmSync();

        let newJsonRow: RealmJsonRow & Realm.Object;
        loadedJsonRealm.write(() => {
            newJsonRow = loadedJsonRealm.create(genJsonSchemaName(collectionName), {
                id: key,
                json: {},
            }, UpdateMode.Never);
        });

        return newJsonRow;
    }

    function getJson(key: string): Dict<any> {
        const jsonRow: RealmJsonRow = _getJsonRow(key).toJSON();
        
        return jsonRow.json;
    }

    function getAllJson(): Dict<Dict<any>> {
        const allJsonRows: RealmJsonRow[] = _getAllJsonRows().toJSON();

        const allJson: Dict<Dict<any>> = allJsonRows.reduce((acc: Dict<Dict<any>>, cur: RealmJsonRow & Realm.Object) => {
            const { id, json } = cur;
            acc[id] = json;

            return acc;
        }, {});

        return allJson;
    }

    function getAllJsonKeys(): string[] {
        const allJsonRows: RealmJsonRow[] = _getAllJsonRows().toJSON();

        return allJsonRows.map((jsonRow: RealmJsonRow) => jsonRow.id);
    }

    /**
     * Delete the RealmJson collection
     * 
     * @param key 
     */
    function deleteCollection(): void {
        const loadedJsonRealm: Realm = loadRealmSync();

        // 1. Delete every row in the Collection
        const allJsonRows: Realm.Results<RealmJsonRow & Realm.Object> = _getAllJsonRows();
        loadedJsonRealm.write(() => {
            loadedJsonRealm.delete(allJsonRows);
        });

        // 2. Delete this RealmJson's schemas and reload without schemas
        _deleteJsonSchema({ metaRealmPath, loadableRealmPath, collectionName, reloadRealm });
    };

    function setJson(key: string, newJson: Dict<any>): void {
        const loadedJsonRealm: Realm = loadRealmSync();

        const jsonRow: RealmJsonRow & Realm.Object = _getJsonRow(key);
        loadedJsonRealm.write(() => {
            jsonRow.json = newJson;
        });
    };
    /**
     * Delete a json row
     * 
     * @param key 
     */
    function deleteJson(key: string): void {
        const loadedJsonRealm: Realm = loadRealmSync();

        const jsonRow: RealmJsonRow & Realm.Object = _getJsonRow(key);
        loadedJsonRealm.write(() => {
            loadedJsonRealm.delete(jsonRow);
        });
    };
    function addEntries(key: string, entries: Dict<any>): void {
        const loadedJsonRealm: Realm = loadRealmSync();

        const jsonRow: RealmJsonRow & Realm.Object = _getJsonRow(key);
        loadedJsonRealm.write(() => {
            jsonRow.json = {
                ...jsonRow.json,
                ...entries,
            }
        });
    };
    /**
     * Delete keys from a json row
     * 
     * @param key 
     * @param keysToRm 
     */
    function deleteEntries(key: string, keysToRm: string[]): void {
        const loadedJsonRealm: Realm = loadRealmSync();

        const jsonRow: RealmJsonRow & Realm.Object = _getJsonRow(key);
        loadedJsonRealm.write(() => {
            for(const keyToRm of keysToRm) {
                delete jsonRow.json[keyToRm];
            }
        });
    };

    // INTERNAL UTILITY
    async function loadRealm(): Promise<Realm> { return await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath, loadableRealmPath }) };
    async function reloadRealm(): Promise<Realm> { return await MetaRealm.LoadableRealmManager.reloadRealm({ metaRealmPath, loadableRealmPath }) };
    function loadRealmSync(): Realm { return MetaRealm.LoadableRealmManager.loadRealmSync({ metaRealmPath, loadableRealmPath }) };
    function reloadRealmSync(): Realm { return MetaRealm.LoadableRealmManager.reloadRealmSync({ metaRealmPath, loadableRealmPath }) };

    return {
        getCollectionName,
        getLoadableRealmPath,
        getMetaRealmPath,
        getJson,
        getAllJson,
        getAllJsonKeys,

        loadRealm,
        loadRealmSync,
        reloadRealm,
        reloadRealmSync,

        deleteCollection,
        setJson,
        deleteJson,
        addEntries,
        deleteEntries,
    }
}

// SETUP
const _saveJsonSchema = (metaRealmPath, loadableRealmPath, collectionName: string): void => {
    // 1. Create node + edge schemas
    const jsonSchema: Realm.ObjectSchema = genBaseSchema(collectionName);

    const saveParams: SaveSchemaParams[] = [jsonSchema].map((schema: Realm.ObjectSchema) => ({ metaRealmPath, loadableRealmPath, schema }));
    // 2. And save new Json schemas
    // (If not Realm is not provided, then it is implied that the Json is new and should be created)
    for(let saveParam of saveParams) {
        MetaRealm.saveSchema(saveParam);
    }
}

const _deleteJsonSchema = async ({ metaRealmPath, loadableRealmPath, collectionName, reloadRealm }: RJDeletePropertiesParams): Promise<void> => {
    // 1. Get node + edge schema names
    const schemaNames: string[] = [ genJsonSchemaName(collectionName) ];

    // 2. Delete Json schemas
    for(let schemaName of schemaNames) {
        MetaRealm.rmSchema({ metaRealmPath, loadableRealmPath, schemaName });
    }

    // 3. Reload Realm with updated schemas
    await reloadRealm();
}