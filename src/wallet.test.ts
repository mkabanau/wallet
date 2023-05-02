import "fake-indexeddb/auto";
import 'localstorage-polyfill'
import {WalletStatus, walletFactory} from './wallet'
import { QueryContent2020, WalletContent2020 } from "@mkabanau/components";


console.log(indexedDB)
describe("pixi wallet for 3-link", ()=>{
    
    test("init", async ()=>{
        const walletConfig = { walletId:"storage1"}
        const wallet = walletFactory.build(walletConfig)
        expect(wallet.status).toBe(WalletStatus.Unlocked)
    })

    test("pixi wallet add and query", async ()=>{
        const walletConfig = { walletId:"storage2"}
        const wallet = walletFactory.build(walletConfig)
        let wcontent: WalletContent2020 = {
            id: "test1",
            name: "test1",
            type:"Object"
        } 

        await wallet.add(wcontent)
        let byQuery:QueryContent2020 = {
            ById: wcontent.id
        }
        let rcontent = await wallet.query(byQuery)
        expect(rcontent).toEqual(wcontent)
    })

    test("lock and unlock", async ()=>{
        const walletConfig = { walletId:"storage2"}
        const wallet = walletFactory.build(walletConfig)

        let wcontent: WalletContent2020 = {
            id: "test1",
            name: "test1",
            type:"Object" 

        } 
        await wallet.add(wcontent)
        let byQuery:QueryContent2020 = {
            ById: wcontent.id
        }
        let rcontent = await wallet.query(byQuery)
        expect(rcontent).toEqual(wcontent)
        let password = "test"
        await wallet.lock(password)
        expect(wallet.getStatus()).toBe(WalletStatus.Locked)

        let wallet2 = walletFactory.build(walletConfig)
        expect(wallet2.getStatus()).toBe(WalletStatus.Locked)
        let rcontent2 = await wallet2.query(byQuery) 
        console.log(rcontent2)
        expect(rcontent2).toEqual(wcontent)

        await wallet2.unlock(password)
        expect(wallet2.getStatus()).toBe(WalletStatus.Unlocked)
        let rcontent3 = await wallet2.query(byQuery) 
        console.log(rcontent3)
        expect(rcontent3).toEqual(wcontent)

    })
})