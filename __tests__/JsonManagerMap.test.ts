import fs from 'fs';

import MetaRealm from '@asianpersonn/metarealm';
import RealmJsonManager from '../src';


import JsonManager from '../src/RealmJsonManager/realmJsonManager';
import { RealmJson } from '../src/RealmJson/types';
import { createRealmJson } from '../src/RealmJson/realmJson';

const TEST_NAME: string = 'JsonManagerMapTest';
const TEST_DIRECTORY: string = `__tests__/${TEST_NAME}`;
const META_REALM_PATH1: string = `${TEST_DIRECTORY}/MetaRealm1.path`;
const META_REALM_PATH2: string = `${TEST_DIRECTORY}/MetaRealm2.path`;
const LOADABLE_REALM_PATH1: string = `LoadableRealm1.path`;
const LOADABLE_REALM_PATH2: string = `LoadableRealm2.path`;

const JSON_NAME1: string = 'TestJson1';
const JSON_NAME2: string = 'TestJson2';
const JSON_NAME3: string = 'TestJson3';
const JSON_NAME4: string = 'TestJson4';

describe('createRealmJson', () => {
    beforeAll(() => {
        if (fs.existsSync(TEST_DIRECTORY)) fs.rmSync(TEST_DIRECTORY, { recursive: true });

        fs.mkdirSync(TEST_DIRECTORY);
    });

    it('Should save Jsons 1-4 and then close them', async () => {
        // JSON 1
        const realmJson1: RealmJson = await createRealmJson({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH1,
            collectionName: JSON_NAME1,
        });
        // JSON 2
        const realmJson2: RealmJson = await createRealmJson({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH1,
            collectionName: JSON_NAME2,
        });
        // JSON 3
        const realmJson3: RealmJson = await createRealmJson({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH2,
            collectionName: JSON_NAME3,
        });
        // JSON 4
        const realmJson4: RealmJson = await createRealmJson({
            metaRealmPath: META_REALM_PATH2,
            loadableRealmPath: LOADABLE_REALM_PATH1,
            collectionName: JSON_NAME4,
        });

        MetaRealm.LoadableRealmManager.closeAll();
        MetaRealm.MetaRealmManager.closeAll();
    });

    it('Should have no graph names loaded but should be able to load 4 RealmJsons', async () => {
        expect(JsonManager.getAllLoadedCollectionNames().sort()).toEqual([]);
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH1, LOADABLE_REALM_PATH1).sort()).toEqual([ JSON_NAME1, JSON_NAME2 ].sort())
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH1, LOADABLE_REALM_PATH2).sort()).toEqual([ JSON_NAME3 ].sort())
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH2, LOADABLE_REALM_PATH1).sort()).toEqual([ JSON_NAME4 ].sort())
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH2, LOADABLE_REALM_PATH2).sort()).toEqual([].sort())
    });

    it('Should load all 4 RealmJsons', async () => {
        await JsonManager.loadCollections(META_REALM_PATH1, LOADABLE_REALM_PATH1);
        await JsonManager.loadCollections(META_REALM_PATH1, LOADABLE_REALM_PATH2);
        await JsonManager.loadCollections(META_REALM_PATH2, LOADABLE_REALM_PATH1);

        expect(JsonManager.getAllLoadedCollectionNames().sort()).toEqual([ JSON_NAME1, JSON_NAME2, JSON_NAME3, JSON_NAME4 ].sort());
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH1, LOADABLE_REALM_PATH1).sort()).toEqual([ JSON_NAME1, JSON_NAME2 ].sort())
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH1, LOADABLE_REALM_PATH2).sort()).toEqual([ JSON_NAME3 ].sort())
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH2, LOADABLE_REALM_PATH1).sort()).toEqual([ JSON_NAME4 ].sort())
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH2, LOADABLE_REALM_PATH2).sort()).toEqual([].sort())
    });

    it('Should have 4 Jsons cached', async () => {
        expect(JsonManager.getAllLoadedCollections().length).toEqual(4);
    });

    it('Should get each graph in map', async () => {
        // Verify that each RealmJson is in the map by checking their property names
        const graph1: RealmJson = JsonManager.getCollection(JSON_NAME1);
        const graph2: RealmJson = JsonManager.getCollection(JSON_NAME2);
        const graph3: RealmJson = JsonManager.getCollection(JSON_NAME3);
        const graph4: RealmJson = JsonManager.getCollection(JSON_NAME4);
    });

    it('Should throw an error for a non-existant RealmJson name', async () => {
        const NONEXISTANT_JSON_NAME: string = 'DUMMY_JSON_NAME';
        expect(() => JsonManager.getCollection(NONEXISTANT_JSON_NAME)).toThrowError();
    });

    
    it('Should remove Json1', async () => {
        await JsonManager.rmCollection(JSON_NAME1);

        expect(JsonManager.getAllLoadedCollectionNames().sort()).toEqual([ JSON_NAME2, JSON_NAME3, JSON_NAME4 ].sort());
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH1, LOADABLE_REALM_PATH1).sort()).toEqual([ JSON_NAME2 ].sort());
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH1, LOADABLE_REALM_PATH2).sort()).toEqual([ JSON_NAME3 ].sort());
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH2, LOADABLE_REALM_PATH1).sort()).toEqual([ JSON_NAME4 ].sort());
    });

    it('Should remove Json2', async () => {
        await JsonManager.rmCollection(JSON_NAME2);

        expect(JsonManager.getAllLoadedCollectionNames().sort()).toEqual([ JSON_NAME3, JSON_NAME4 ].sort());
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH1, LOADABLE_REALM_PATH1).sort()).toEqual([].sort());
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH1, LOADABLE_REALM_PATH2).sort()).toEqual([ JSON_NAME3 ].sort());
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH2, LOADABLE_REALM_PATH1).sort()).toEqual([ JSON_NAME4 ].sort());
    });

    it('Should remove Json3', async () => {
        await JsonManager.rmCollection(JSON_NAME3);

        expect(JsonManager.getAllLoadedCollectionNames().sort()).toEqual([ JSON_NAME4 ].sort());
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH1, LOADABLE_REALM_PATH1).sort()).toEqual([].sort());
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH1, LOADABLE_REALM_PATH2).sort()).toEqual([].sort());
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH2, LOADABLE_REALM_PATH1).sort()).toEqual([ JSON_NAME4 ].sort());
    });

    it('Should remove Json4', async () => {
        await JsonManager.rmCollection(JSON_NAME4);

        expect(JsonManager.getAllLoadedCollectionNames().sort()).toEqual([].sort());
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH1, LOADABLE_REALM_PATH1).sort()).toEqual([].sort());
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH1, LOADABLE_REALM_PATH2).sort()).toEqual([].sort());
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH2, LOADABLE_REALM_PATH1).sort()).toEqual([].sort());
    });

    it('Should have deleted all LoadableRealms and now close all Realms', async () => {
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH1, LOADABLE_REALM_PATH1).length).toEqual(0);
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH1, LOADABLE_REALM_PATH2).length).toEqual(0);
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH2, LOADABLE_REALM_PATH1).length).toEqual(0);
        expect(JsonManager.getLoadableCollectionNames(META_REALM_PATH2, LOADABLE_REALM_PATH2).length).toEqual(0);

        MetaRealm.LoadableRealmManager.closeAll();
        MetaRealm.MetaRealmManager.closeAll();
    });

    afterAll(async () => {
        await RealmJsonManager.closeAllCollections();

        if (fs.existsSync(TEST_DIRECTORY)) fs.rmSync(TEST_DIRECTORY, { recursive: true });
    });      
});
