import { Dict } from "../types";

export type RJCreateParams = {} & RJLoadableParams;

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
  jsonStr: string;
};

export type RealmJson = {
  getCollectionName: () => string;
  getLoadableRealmPath: () => string;
  getMetaRealmPath: () => string;
  getJson: (rowKey: string) => Dict<any>;
  getAllJson: () => Dict<Dict<any>>;
  getAllJsonKeys: () => string[];

  loadRealm: () => Promise<Realm>;
  loadRealmSync: () => Realm;
  reloadRealm: () => Promise<Realm>;
  reloadRealmSync: () => Realm;

  setJson: (rowKey: string, newJson: Dict<any>) => void;
  deleteCollection: () => void;
  deleteJson: (rowKey: string) => void;
  addEntries: (rowKey: string, entries: Dict<any>) => void;
  deleteEntries: (rowKey: string, entriesToRm: string[]) => void;
};
