import MetaRealm from '@asianpersonn/metarealm';
import { getBaseNameFromSchemaName } from '../constants/naming';

import { createRealmJson, loadRealmJson } from "../RealmJson/realmJson";
import { RealmJson, RJCreateParams } from "../RealmJson/types";
import { Dict } from "../types";
import { gen_NO_COLLECTION_ERROR } from './errors';
import { RealmJsonManager } from './types';

const createGraphManager = (): RealmJsonManager => {
    const realmJsonMap: Dict<RealmJson> = {};
    
    const getCollection = (collectionName: string): RealmJson | never => {
        if(!hasRealmJson(collectionName)) throw gen_NO_COLLECTION_ERROR(collectionName);

        return realmJsonMap[collectionName];
    }

    const createCollection = async ({ metaRealmPath, loadableRealmPath, collectionName }: RJCreateParams) => {
        // 1. Create new RealmJson if not exists
        if(!hasRealmJson(collectionName)) {
            const realmJson: RealmJson = await createRealmJson({
                metaRealmPath,
                loadableRealmPath,
                collectionName,
            });
            realmJsonMap[collectionName] = realmJson;
        }

        return realmJsonMap[collectionName];
    }

    const rmCollection = async (collectionName: string): Promise<void> => {
        // 1. Try to delete RealmJson schemas
        if(hasRealmJson(collectionName)) {
            const realmJson: RealmJson = realmJsonMap[collectionName];
            await realmJson.deleteCollection();
        }

        // 2. Remove RealmJson from map if present
        delete realmJsonMap[collectionName];
    }

    const hasRealmJson = (collectionName: string): boolean => !!realmJsonMap[collectionName];
    
    /**
     * Load all saved RealmStacks
     * Return number of RealmStacks loaded
     * 
     * @param metaRealmPath 
     * @param loadableRealmPath 
     * @returns 
     */
    const loadCollections = async (metaRealmPath: string, loadableRealmPath: string): Promise<number> => {
        // 1. Get all Loadable graph names
        const collectionNames: string[] = getLoadableCollectionNames(metaRealmPath, loadableRealmPath);

        for(let collectionName of collectionNames) {
            // 2. Setup RealmJson, It will read its properties from its LoadableRealm schemas
            const realmJson: RealmJson = await loadRealmJson({
                metaRealmPath,
                loadableRealmPath,
                collectionName,
                shouldReloadRealm: false,
            });

            // 3. Add to realmJsonMap
            realmJsonMap[collectionName] = realmJson;
        }

        // 4. Reload realms after loading all RealmJsons
        await MetaRealm.LoadableRealmManager.reloadRealm({ metaRealmPath, loadableRealmPath });

        return collectionNames.length;
    }

    const closeAllCollections = async () => {
        await MetaRealm.MetaRealmManager.closeAll();
        await MetaRealm.LoadableRealmManager.closeAll();
    }

    const getLoadableCollectionNames = (metaRealmPath: string, loadableRealmPath: string): string[] => {
        const collectionNames: Set<string> = new Set<string>();

        // 1. Get all schema names
        const allSchemaNames: string[] = MetaRealm.getSchemaNames(metaRealmPath, loadableRealmPath);

        // 2. Remove schema name suffix and add to set
        // (A single Graph creates more than 1 schema; when stripped of their suffixes, they will have identical names)
        allSchemaNames.forEach((schemaName) => {
            // 2.1. Remove suffix
            const collectionName: string = getBaseNameFromSchemaName(schemaName);

            // 2.2. Add to set
            collectionNames.add(collectionName);
        });

        return Array.from(collectionNames);
    };

    const getAllLoadedCollectionNames = (): string[] => Object.keys(realmJsonMap);
    const getAllLoadedCollections = (): RealmJson[] => Object.values(realmJsonMap);

    return {
        getCollection,
        createCollection,
        rmCollection,
        loadCollections,
        closeAllCollections,
    
        getLoadableCollectionNames,
        getAllLoadedCollectionNames,
        getAllLoadedCollections,
    }
}

export default createGraphManager();
