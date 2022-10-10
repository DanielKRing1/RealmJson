import { RealmJson, RJCreateParams } from "../RealmJson/types";

export type RealmJsonManager = {
    getCollection: (collectionName: string) => RealmJson | never;
    createCollection: (params: RJCreateParams) => Promise<RealmJson>;
    rmCollection: (collectionName: string) => void;
    loadCollections: (metaRealmPath: string, loadableRealmPath: string) => Promise<number>;
    closeAllCollections: () => Promise<void>;

    getLoadableCollectionNames: (metaRealmPath: string, loadableRealmPath: string) => string[];
    getAllLoadedCollectionNames: () => string[];
    getAllLoadedCollections: () => RealmJson[];
};