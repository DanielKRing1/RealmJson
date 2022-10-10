import { Dict } from "../types";

export type RJCreateParams = {
} & RJLoadableParams;

export type RJLoadJsonParams = {
    shouldReloadRealm?: boolean;
} & RJLoadableParams;

export type RJLoadableParams = {
    metaRealmPath: string;
    loadableRealmPath: string;
    collectionName: string;
};

export type RJDeletePropertiesParams = {
    reloadRealm: () => Promise<Realm>;
} & RJLoadJsonParams;

export type RJUpdatePropertiesParams = {
    newPropertyNames: string[];

    reloadRealm: () => Promise<Realm>;
} & RJLoadJsonParams;

export type RealmJsonRow = {
    id: string;
    json: Dict<any>;
};

export type RealmJson = {
    getCollectionName: () => string;
    getLoadableRealmPath: () => string;
    getMetaRealmPath: () => string;
    getJson: (key: string) => Dict<any>;
    getAllJson: () => Dict<Dict<any>>;
    getAllJsonKeys: () => string[];

    loadRealm: () => Promise<Realm>;
    loadRealmSync: () => Realm;
    reloadRealm: () => Promise<Realm>;
    reloadRealmSync: () => Realm;

    setJson: (key: string, newJson: Dict<any>) => void;
    deleteCollection: () => void;
    deleteJson: (key: string) => void;
    addEntries: (key: string, entries: Dict<any>) => void;
    deleteEntries: (key: string, entriesToRm: string[]) => void;
};