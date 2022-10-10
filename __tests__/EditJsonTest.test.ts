import fs from 'fs';

import MetaRealm from '@asianpersonn/metarealm';
import RealmJsonManager from '../src';

import { createRealmJson } from '../src/RealmJson/realmJson';
import { RealmJson } from '../src/RealmJson/types';
import { genJsonSchemaName } from '../src/constants/naming';
import { Dict } from '../src/types';

const TEST_NAME: string = 'EditJsonTest';
const TEST_DIRECTORY: string = `__tests__/${TEST_NAME}`;
const META_REALM_PATH1: string = `${TEST_DIRECTORY}/MetaRealm1.path`;
const LOADABLE_REALM_PATH1: string = `LoadableRealm1.path`;

const JSON_NAME1: string = 'TestJson1';

const initialJson: Dict<any> = {
    a: 'a',
    b: 'b',
    c: 'c',
    d: 'd',
};

const jsonRowKey1: string = 'id1';
const jsonToAdd1: Dict<any> = {
    e: 'e',
    f: 'f',
    g: 'g',
    h: 'h',
};
const jsonToRm1: string[] = [ 'd', 'e' ];

const jsonRowKey2: string = 'id2';
const jsonToAdd2: Dict<any> = {
    d: 'd',
    x: 'x',
    y: 'y',
    z: 'z',
};
const jsonToRm2: string[] = [ 'a', 'b', 'c', 'd', 'e' ];

describe('createRealmJson', () => {
    beforeAll(() => {
        if (fs.existsSync(TEST_DIRECTORY)) fs.rmSync(TEST_DIRECTORY, { recursive: true });

        fs.mkdirSync(TEST_DIRECTORY);
    });

    it('Should save Json1 Schema to the LoadableRealm1 LoadableSchemas table', async () => {
        const realmJson: RealmJson = await RealmJsonManager.createCollection({
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

    it('Should get json from Json1', async () => {
        const collection1: RealmJson = RealmJsonManager.getCollection(JSON_NAME1);

        const json: Dict<any> = collection1.getJson(jsonRowKey1);
        expect(json).toEqual({});

        const allJson: Dict<any> = collection1.getAllJson();
        expect(allJson).toEqual({
            [jsonRowKey1]: {},
        });
    });

    it('Should set json for Json1 id1 and id2', async () => {
        const collection1: RealmJson = RealmJsonManager.getCollection(JSON_NAME1);

        collection1.setJson(jsonRowKey1, initialJson);
        collection1.setJson(jsonRowKey2, initialJson);

        // Json1
        const json1: Dict<any> = collection1.getJson(jsonRowKey1);
        expect(json1).toEqual(initialJson);

        // Json2
        const json2: Dict<any> = collection1.getJson(jsonRowKey2);
        expect(json2).toEqual(initialJson);

        // All Json
        const allJson: Dict<any> = collection1.getAllJson();
        expect(allJson).toEqual({
            [jsonRowKey1]: initialJson,
            [jsonRowKey2]: initialJson,
        });
    });

    it('Should add json to Json1 id1 and id2', async () => {
        const collection1: RealmJson = RealmJsonManager.getCollection(JSON_NAME1);

        collection1.addEntries(jsonRowKey1, jsonToAdd1);

        collection1.addEntries(jsonRowKey2, jsonToAdd2);

        // Json1
        const json1: Dict<any> = collection1.getJson(jsonRowKey1);
        expect(json1).toEqual({ ...initialJson, ...jsonToAdd1 });

        // Json2
        const json2: Dict<any> = collection1.getJson(jsonRowKey2);
        expect(json2).toEqual({ ...initialJson, ...jsonToAdd2 });

        // All Json
        const allJson: Dict<any> = collection1.getAllJson();
        expect(allJson).toEqual({
            [jsonRowKey1]: { ...initialJson, ...jsonToAdd1 },
            [jsonRowKey2]: { ...initialJson, ...jsonToAdd2 },
        });
    });

    it('Should remove json from Json1 id1 and id2', async () => {
        const collection1: RealmJson = RealmJsonManager.getCollection(JSON_NAME1);

        const json10: Dict<any> = collection1.getJson(jsonRowKey1);
        const json20: Dict<any> = collection1.getJson(jsonRowKey2);

        collection1.deleteEntries(jsonRowKey1, jsonToRm1);

        collection1.deleteEntries(jsonRowKey2, jsonToRm2);

        // Json1
        const json1: Dict<any> = collection1.getJson(jsonRowKey1);
        const expectedJson1: Dict<any> = { ...initialJson, ...jsonToAdd1 };
        for(const keyToRm of jsonToRm1) {
            delete expectedJson1[keyToRm];
        }
        expect(json1).toEqual(expectedJson1);
        
        // Json2
        const json2: Dict<any> = collection1.getJson(jsonRowKey2);
        const expectedJson2: Dict<any> = { ...initialJson, ...jsonToAdd2 };
        for(const keyToRm of jsonToRm2) {
            delete expectedJson2[keyToRm];
        }
        expect(json2).toEqual(expectedJson2);

        // All Json
        const allJson: Dict<any> = collection1.getAllJson();
        expect(allJson).toEqual({
            [jsonRowKey1]: expectedJson1,
            [jsonRowKey2]: expectedJson2,
        });
    });

    it('Should reset the json of Json1 id1 and id2', async () => {
        const collection1: RealmJson = RealmJsonManager.getCollection(JSON_NAME1);

        collection1.setJson(jsonRowKey1, initialJson);

        collection1.setJson(jsonRowKey2, initialJson);

        // Json1
        const json1: Dict<any> = collection1.getJson(jsonRowKey1);
        expect(json1).toEqual(initialJson);

        // Json2
        const json2: Dict<any> = collection1.getJson(jsonRowKey2);
        expect(json2).toEqual(initialJson);

        // All Json
        const allJson: Dict<any> = collection1.getAllJson();
        expect(allJson).toEqual({
            [jsonRowKey1]: initialJson,
            [jsonRowKey2]: initialJson,
        });
    });

    it('Should delete jsonRowKey1 of Json1', async () => {
        const collection1: RealmJson = RealmJsonManager.getCollection(JSON_NAME1);

        // Json1
        collection1.deleteJson(jsonRowKey1);

        // All Json
        const allJson: Dict<any> = collection1.getAllJson();
        expect(allJson).toEqual({
            [jsonRowKey2]: initialJson,
        });
    });

    it('Should delete jsonRowKey2 of Json1', async () => {
        const collection1: RealmJson = RealmJsonManager.getCollection(JSON_NAME1);

        // Json1
        collection1.deleteJson(jsonRowKey2);

        // All Json
        const allJson: Dict<any> = collection1.getAllJson();
        expect(allJson).toEqual({});
    });

    afterAll(async () => {
        await RealmJsonManager.closeAllCollections();

        if (fs.existsSync(TEST_DIRECTORY)) fs.rmSync(TEST_DIRECTORY, { recursive: true });
    });      
});
