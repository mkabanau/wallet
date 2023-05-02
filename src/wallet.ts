import { YJSStorageProvider, StorageProvider, IStorage } from "@mkabanau/yjs-storage"
import * as Factory from 'factory.ts'

import { seedToId, passwordToKey, lockContent, unlockContents, exportContentsAsCredential, contentsFromEncryptedWalletCredential, WalletContent2020 } from '@mkabanau/components'
export enum WalletStatus {
    Locked = "LOCKED",
    Unlocked = "UNLOCKED"
}

export interface Wallet {
    status: WalletStatus;
    walletId: string
    contents: IStorage;
    init: () => Promise<void>
    getStatus: ()=>WalletStatus
    seedToId: (seed: Uint8Array) => Promise<string>;
    passwordToKey: (password: string) => Promise<Uint8Array>;
    add: (content: any) => Promise<void>;
    query: (opts: any) => Promise<any>
    remove: (contentId: string) => Promise<any>;
    lock: (password: string) => Promise<void>;
    unlock: (password: string) => Promise<void>;
    export: (password: string) => Promise<any>;
    import: (encryptedWalletCredential: any, password: string) => Promise<Wallet>;
}

interface PixiWallet extends Wallet { }

var walletDefaults = {
    status: WalletStatus.Unlocked,
    walletId: "test-storage",
    contents: undefined,
    init: function():Promise<void> {
        (this as Wallet).contents =  new YJSStorageProvider((this as Wallet).walletId)
        return
    },
    getStatus: function ():WalletStatus {
        let walletId = (this as Wallet).walletId;
        let encrypteContents = localStorage.getItem(walletId)
        // console.log(encrypteContents)
        if (encrypteContents) {
            (this as Wallet).status = WalletStatus.Locked;
        }
        return (this as Wallet).status
    },
    seedToId,
    passwordToKey,
    add: function (content: WalletContent2020): Promise<void> {
        (this as Wallet).contents.Put(content);
        return this;
    },
    query: function (opts: any): Promise<any> {
        return (this as Wallet).contents.Query(opts);
    },
    remove: function (contentId: string): Promise<any> {
        return (this as Wallet).contents.Remove(contentId);
    },
    lock: async function (password: string): Promise<void> {
        let contents = await (this as Wallet).contents.Export()
        let encryptedContents = await lockContent(
            password,
            {contents}
        );
        let walletId = (this as Wallet).walletId;
        localStorage.setItem(walletId, JSON.stringify(encryptedContents));
        await (this as Wallet).contents.Clear();
        (this as Wallet).status = WalletStatus.Locked;
        return;
    },
    unlock: async function (password: string): Promise<void> {
        let walletId = (this as Wallet).walletId;
        let encrypteContents = localStorage.getItem(walletId)
        if (!encrypteContents) {
            throw Error(`nothing to unlock for walletId ${walletId}`)
        }
        let contents = await unlockContents(
            password,
            JSON.parse(encrypteContents)
        );
        await (this as Wallet).contents.Import(contents.contents);

        (this as Wallet).status = WalletStatus.Unlocked;
        return ;
    },
    export: async function (password: string): Promise<any> {
        let contents = await (this as Wallet).contents.Export()
        return exportContentsAsCredential(password, contents);
    },
    import: async function (
        encryptedWalletCredential: any,
        password: string
    ): Promise<any> {
        let contents = await contentsFromEncryptedWalletCredential(
            password,
            encryptedWalletCredential
        );
        await (this as Wallet).contents.Import(contents)
        this.status = WalletStatus.Unlocked;
        return this;
    }
};

const walletFactory = Factory.Sync.makeFactoryWithRequired<PixiWallet, "walletId">(walletDefaults);

export { PixiWallet, walletFactory, walletDefaults };