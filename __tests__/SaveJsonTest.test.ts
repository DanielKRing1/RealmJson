import fs from 'fs';

import MetaRealm from '@asianpersonn/metarealm';
import RealmJsonManager from '../src';

import { createRealmJson } from '../src/RealmJson/realmJson';
import { RealmJson } from '../src/RealmJson/types';
import { genJsonSchemaName } from '../src/constants/naming';

const TEST_NAME: string = 'SaveJsonTest';
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

    it('Should save Json1 Schema to the LoadableRealm1 LoadableSchemas table', async () => {
        const realmJson1: RealmJson = await createRealmJson({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH1,
            collectionName: JSON_NAME1,
        });

        const jsonSchemaName: string = genJsonSchemaName(JSON_NAME1);
        const schemaNames: string[] = MetaRealm.getSchemaNames(META_REALM_PATH1, LOADABLE_REALM_PATH1);

        expect(schemaNames.sort()).toEqual([ jsonSchemaName ].sort());
    });

    it('Should load the LoadableRealm with Json1 schema', async () => {
        const loadableRealm: Realm = await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath: META_REALM_PATH1, loadableRealmPath: LOADABLE_REALM_PATH1 });

        const jsonSchemaName: string = genJsonSchemaName(JSON_NAME1);
        
        const loadedSchemaNames: string[] = loadableRealm.schema.map((schema) => schema.name);
        expect(loadedSchemaNames.sort()).toEqual([ jsonSchemaName ].sort());
    });

    it('Should save Json2 to LoadableRealm1 without affecting Json1', async () => {
        // JSON 1 and 2
        const realmJson2: RealmJson = await createRealmJson({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH1,
            collectionName: JSON_NAME2,
        });

        const jsonSchemaName1: string = genJsonSchemaName(JSON_NAME1);
        const jsonSchemaName2: string = genJsonSchemaName(JSON_NAME2);
        const schemaNames: string[] = MetaRealm.getSchemaNames(META_REALM_PATH1, LOADABLE_REALM_PATH1);

        expect(schemaNames.sort()).toEqual([ jsonSchemaName1, jsonSchemaName2 ].sort());
    });

    it('Should load LoadableRealm1 with Json1 AND Json2 schemas', async () => {
        // JSON 1 and 2
        const loadableRealm: Realm = await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath: META_REALM_PATH1, loadableRealmPath: LOADABLE_REALM_PATH1 });

        const jsonSchemaName1: string = genJsonSchemaName(JSON_NAME1);
        const jsonSchemaName2: string = genJsonSchemaName(JSON_NAME2);
        
        const loadedSchemaNames: string[] = loadableRealm.schema.map((schema) => schema.name);
        expect(loadedSchemaNames.sort()).toEqual([ jsonSchemaName1, jsonSchemaName2 ].sort());
    });

    it('Should save Json3 to LoadableRealm2 without affecting Json1 or Json2', async () => {
        // JSON 3
        const realmJson3: RealmJson = await createRealmJson({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH2,
            collectionName: JSON_NAME3,
        });

        const jsonSchemaName3: string = genJsonSchemaName(JSON_NAME3);
        const schemaNames3: string[] = MetaRealm.getSchemaNames(META_REALM_PATH1, LOADABLE_REALM_PATH2);

        expect(schemaNames3.sort()).toEqual([ jsonSchemaName3 ].sort());

        // JSON 1 and 2
        // Should catch error
        const realmJson2: RealmJson = await createRealmJson({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH1,
            collectionName: JSON_NAME2,
        });

        const jsonSchemaName1: string = genJsonSchemaName(JSON_NAME1);
        const jsonSchemaName2: string = genJsonSchemaName(JSON_NAME2);
        const schemaNames1: string[] = MetaRealm.getSchemaNames(META_REALM_PATH1, LOADABLE_REALM_PATH1);

        expect(schemaNames1.sort()).toEqual([ jsonSchemaName1, jsonSchemaName2 ].sort());
    });

    it('Should load LoadableRealm2 with Json3 schemas without affecting Json 1 or 2', async () => {
        // JSON 3
        const loadableRealm3: Realm = await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath: META_REALM_PATH1, loadableRealmPath: LOADABLE_REALM_PATH2 });

        const jsonSchemaName3: string = genJsonSchemaName(JSON_NAME3);
        
        const loadedSchemaNames2: string[] = loadableRealm3.schema.map((schema) => schema.name);
        expect(loadedSchemaNames2.sort()).toEqual([ jsonSchemaName3 ].sort());

        // JSON 1 and 2
        const loadableRealm1: Realm = await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath: META_REALM_PATH1, loadableRealmPath: LOADABLE_REALM_PATH1 });

        const jsonSchemaName1: string = genJsonSchemaName(JSON_NAME1);
        const jsonSchemaName2: string = genJsonSchemaName(JSON_NAME2);
        
        const loadedSchemaNames1: string[] = loadableRealm1.schema.map((schema) => schema.name);
        expect(loadedSchemaNames1.sort()).toEqual([ jsonSchemaName1, jsonSchemaName2 ].sort());
    });

    it('Should save Json4 to MetaRealm2.LoadableRealm1 without affecting Json 1-3', async () => {
        // JSON 4
        const realmJson4: RealmJson = await createRealmJson({
            metaRealmPath: META_REALM_PATH2,
            loadableRealmPath: LOADABLE_REALM_PATH1,
            collectionName: JSON_NAME4,
        });

        const jsonSchemaName4: string = genJsonSchemaName(JSON_NAME4);
        const schemaNames4: string[] = MetaRealm.getSchemaNames(META_REALM_PATH2, LOADABLE_REALM_PATH1);

        expect(schemaNames4.sort()).toEqual([ jsonSchemaName4 ].sort());

        // JSON 3
        // Should catch error
        const realmJson3: RealmJson = await createRealmJson({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH2,
            collectionName: JSON_NAME3,
        });

        const jsonSchemaName3: string = genJsonSchemaName(JSON_NAME3);
        const schemaNames3: string[] = MetaRealm.getSchemaNames(META_REALM_PATH1, LOADABLE_REALM_PATH2);

        expect(schemaNames3.sort()).toEqual([ jsonSchemaName3 ].sort());

        // JSON 1 and 2
        // Should catch error
        const realmJson2: RealmJson = await createRealmJson({
            metaRealmPath: META_REALM_PATH1,
            loadableRealmPath: LOADABLE_REALM_PATH1,
            collectionName: JSON_NAME2,
        });

        const jsonSchemaName1: string = genJsonSchemaName(JSON_NAME1);
        const jsonSchemaName2: string = genJsonSchemaName(JSON_NAME2);
        const schemaNames1: string[] = MetaRealm.getSchemaNames(META_REALM_PATH1, LOADABLE_REALM_PATH1);

        expect(schemaNames1.sort()).toEqual([ jsonSchemaName1, jsonSchemaName2 ].sort());
    });

    it('Should load MetaRealm2.LoadableRealm1 with Json3 schemas without affecting Json 1-3', async () => {
        // JSON 4
        const loadableRealm4: Realm = await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath: META_REALM_PATH2, loadableRealmPath: LOADABLE_REALM_PATH1 });

        const jsonSchemaName4: string = genJsonSchemaName(JSON_NAME4);
        
        const loadedSchemaNames4: string[] = loadableRealm4.schema.map((schema) => schema.name);
        expect(loadedSchemaNames4.sort()).toEqual([ jsonSchemaName4 ].sort());

        // JSON 3
        const loadableRealm3: Realm = await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath: META_REALM_PATH1, loadableRealmPath: LOADABLE_REALM_PATH2 });

        const jsonSchemaName3: string = genJsonSchemaName(JSON_NAME3);
        
        const loadedSchemaNames2: string[] = loadableRealm3.schema.map((schema) => schema.name);
        expect(loadedSchemaNames2.sort()).toEqual([ jsonSchemaName3 ].sort());

        // JSON 1 and 2
        const loadableRealm1: Realm = await MetaRealm.LoadableRealmManager.loadRealm({ metaRealmPath: META_REALM_PATH1, loadableRealmPath: LOADABLE_REALM_PATH1 });

        const jsonSchemaName1: string = genJsonSchemaName(JSON_NAME1);
        const jsonSchemaName2: string = genJsonSchemaName(JSON_NAME2);
        
        const loadedSchemaNames1: string[] = loadableRealm1.schema.map((schema) => schema.name);
        expect(loadedSchemaNames1.sort()).toEqual([ jsonSchemaName1, jsonSchemaName2 ].sort());
    });

    afterAll(async () => {
        await RealmJsonManager.closeAllCollections();

        if (fs.existsSync(TEST_DIRECTORY)) fs.rmSync(TEST_DIRECTORY, { recursive: true });
    });      
});
