import fs from "fs";

import MetaRealm from "@asianpersonn/metarealm";
import RealmJsonManager from "../src";

import JsonManager from "../src/RealmJsonManager/realmJsonManager";
import { RealmJson } from "../src/RealmJson/types";
import { genJsonSchemaName } from "../src/constants/naming";
import { createRealmJson } from "../src/RealmJson/realmJson";

const TEST_NAME: string = "LoadJsonManagerTest";
const TEST_DIRECTORY: string = `__tests__/${TEST_NAME}`;
const META_REALM_PATH1: string = `${TEST_DIRECTORY}/MetaRealm1.path`;
const META_REALM_PATH2: string = `${TEST_DIRECTORY}/MetaRealm2.path`;
const LOADABLE_REALM_PATH1: string = `LoadableRealm1.path`;
const LOADABLE_REALM_PATH2: string = `LoadableRealm2.path`;

const JSON_NAME1: string = "TestJson1";
const JSON_NAME2: string = "TestJson2";
const JSON_NAME3: string = "TestJson3";
const JSON_NAME4: string = "TestJson4";

describe("createRealmJson", () => {
  beforeAll(() => {
    if (fs.existsSync(TEST_DIRECTORY))
      fs.rmSync(TEST_DIRECTORY, { recursive: true });

    fs.mkdirSync(TEST_DIRECTORY);
  });

  it("Should save Jsons 1-4 and then close them", async () => {
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

  it("Should load Jsons 1-2", async () => {
    await JsonManager.loadCollections(META_REALM_PATH1, LOADABLE_REALM_PATH1);

    const schemaNames: string[] = (
      await MetaRealm.LoadableRealmManager.loadRealm({
        metaRealmPath: META_REALM_PATH1,
        loadableRealmPath: LOADABLE_REALM_PATH1,
      })
    ).schema.map((schema) => schema.name);
    const jsonSchemaName1: string = genJsonSchemaName(JSON_NAME1);
    const jsonSchemaName2: string = genJsonSchemaName(JSON_NAME2);
    expect(schemaNames.sort()).toEqual(
      [jsonSchemaName1, jsonSchemaName2].sort()
    );
  });

  it("Should load Json 3", async () => {
    await JsonManager.loadCollections(META_REALM_PATH1, LOADABLE_REALM_PATH2);

    const schemaNames: string[] = (
      await MetaRealm.LoadableRealmManager.loadRealm({
        metaRealmPath: META_REALM_PATH1,
        loadableRealmPath: LOADABLE_REALM_PATH2,
      })
    ).schema.map((schema) => schema.name);
    const jsonSchemaName3: string = genJsonSchemaName(JSON_NAME3);
    expect(schemaNames.sort()).toEqual([jsonSchemaName3].sort());
  });

  it("Should load Json 4", async () => {
    await JsonManager.loadCollections(META_REALM_PATH2, LOADABLE_REALM_PATH1);

    const schemaNames: string[] = (
      await MetaRealm.LoadableRealmManager.loadRealm({
        metaRealmPath: META_REALM_PATH2,
        loadableRealmPath: LOADABLE_REALM_PATH1,
      })
    ).schema.map((schema) => schema.name);
    const jsonSchemaName4: string = genJsonSchemaName(JSON_NAME4);
    expect(schemaNames.sort()).toEqual([jsonSchemaName4].sort());
  });

  afterAll(async () => {
    await RealmJsonManager.closeAllCollections();

    if (fs.existsSync(TEST_DIRECTORY))
      fs.rmSync(TEST_DIRECTORY, { recursive: true });
  });
});
