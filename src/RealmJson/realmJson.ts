import Realm from 'realm';
import DictUtils from '@asianpersonn/dict-utils';
import MetaRealm, { SaveSchemaParams } from '@asianpersonn/metarealm';

import { RealmJson, RealmJsonRow, RJCreateParams, RJDeletePropertiesParams, RJLoadGraphParams } from './types';
import { genBaseSchema, JSON_KEY } from '../constants/schemas';
import { Dict } from '../types';
import { genJsonSchemaName } from '../constants/naming';

/**
 * Saves RealmJson Json schema to LoadableSchema table
 * Then reloads the MetaRealm LoadableRealm with theis new schema
 * 
 * @param param0 
 * @returns 
 */
 export const createRealmJson = async ({ metaRealmPath, loadableRealmPath, collectionName }: RJCreateParams): Promise<RealmJson> => {
    // 1. Save new Graph Node and Edge schemas
    _saveJsonSchema(metaRealmPath, loadableRealmPath, collectionName);
    
    // 2. Reload LoadableRealm with new schemas, so propertyNames can be accessed from LoadableSchema
    await MetaRealm.LoadableRealmManager.reloadRealm({ metaRealmPath, loadableRealmPath });

    // 3. Setup RealmJson
    const RealmJson: RealmJson = await initializeRealmJson({ metaRealmPath, loadableRealmPath, collectionName });

    return RealmJson;
};

export const loadRealmJson = async ({ metaRealmPath, loadableRealmPath, collectionName, shouldReloadRealm=true }: RJLoadGraphParams): Promise<RealmJson> => {
    // 1. Initialize RealmGraph
    const realmGraph: RealmJson = await initializeRealmJson({ metaRealmPath, loadableRealmPath, collectionName });

    // 2. Reload realm (optional bcus may be loading multiple RealmGraphs)
    if(shouldReloadRealm) await realmGraph.reloadRealm();
    
    return realmGraph;
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

    function _getJsonRow(key: string): RealmJsonRow & Realm.Object {
        const loadedJsonRealm: Realm = loadRealmSync();
        const jsonRow: RealmJsonRow & Realm.Object = loadedJsonRealm.objectForPrimaryKey(genJsonSchemaName(collectionName), key);

        return jsonRow
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

    function setJson(key: string, newJson: Dict<any>): void {
        const loadedJsonRealm: Realm = loadRealmSync();

        const jsonRow: RealmJsonRow & Realm.Object = _getJsonRow(key);
        loadedJsonRealm.write(() => {
            jsonRow.json = newJson;
        });
    };
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

        setJson,
        deleteCollection,
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
    // 2. And save new Graph schemas
    // (If not Realm is not provided, then it is implied that the Graph is new and should be created)
    for(let saveParam of saveParams) {
        MetaRealm.saveSchema(saveParam);
    }
}

const _deleteJsonSchema = async ({ metaRealmPath, loadableRealmPath, collectionName, reloadRealm }: RJDeletePropertiesParams): Promise<void> => {
    // 1. Get node + edge schema names
    const schemaNames: string[] = [ genJsonSchemaName(collectionName) ];

    // 2. Delete Graph schemas
    for(let schemaName of schemaNames) {
        MetaRealm.rmSchema({ metaRealmPath, loadableRealmPath, schemaName });
    }

    // 3. Reload Realm with updated schemas
    await reloadRealm();
}