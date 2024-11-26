import { BskyAgent, validEnvironments } from './bsky-agent.ts'
import { ThreadItemOptional } from './interfaces.ts'
import { readStoredThreads } from './storage-access.ts'
import { generatePostText } from './templates.ts'
import * as utils from './utils.ts'


// get argument from command: $ npm run start -- <arg>
const RUNTIME_ENV = process.argv[2] ? process.argv[2] : process.env.ENVIRONMENT ? process.env.ENVIRONMENT : ""

const APP_USERNAME = RUNTIME_ENV == validEnvironments.PRODUCTION ? process.env.BSKY_USERNAME_PROD : process.env.BSKY_USERNAME_NONPROD
const APP_PASSWORD = RUNTIME_ENV == validEnvironments.PRODUCTION ? process.env.BSKY_PASSWORD_PROD : process.env.BSKY_PASSWORD_NONPROD


async function main() {
    const newThreads: ThreadItemOptional[] = await utils.getNewThreads()

    if (newThreads.length) {
        const bsky = new BskyAgent(RUNTIME_ENV)

        await bsky.login(APP_USERNAME, APP_PASSWORD)

        for (const newThread of newThreads) {
            if (newThread.text && newThread.href) {
                const postText = generatePostText(newThread.metadata.user, newThread.text, newThread.href, newThread.metadata.forum)
                await bsky.postRecord(postText)
            }
        }
    }
}

main()