import * as fs from "fs"
import { ThreadItem } from './interfaces.ts'

const threadsStoragePath = "./data/current-threads.json"


export async function readStoredThreads(): Promise<ThreadItem[]> {
    return new Promise((resolve, reject) => {
        fs.readFile(threadsStoragePath, (error, data: Buffer) => {
            if (error) {
                console.log(`storage-access.readStoredThreads | ERROR | ${error}`)
                reject(error)
            }
    
            resolve(JSON.parse(data))
        })
    })
}

export async function writeStoredThreads(threadItems: ThreadItem[]): Promise<ThreadItem[]> {
    const threadItemsString: string = JSON.stringify(threadItems, null, 4)

    return new Promise((resolve, reject) => {
        fs.writeFile(threadsStoragePath, threadItemsString, (error) => {
            if (error) {
                console.log(`storage-access.readStoredThreads | ERROR | ${error}`)

                reject(error)
            }

            console.log(`Successfully updated stored threads file.`)

            resolve(threadItems)
        })
    })
}