import { AtpAgent, RichText } from '@atproto/api'


const agent = new AtpAgent({
    service: 'https://bsky.social',
})

export const validEnvironments = {
    PRODUCTION: "prod",
    DEVELOPMENT: "dev",
    TESTING: "test"
}

export class BskyAgent {
    agent: AtpAgent
    environment: string

    constructor(environment: string) {
        this.agent = new AtpAgent({service: "https://bsky.social"})
        this.environment = Object.values(validEnvironments).includes(environment) ? environment : validEnvironments.TESTING

        console.log(`BskyAgent.constructor | Bluesky agent has been initialized in ${this.environment}.`)
    }

    async login(username: string | undefined, password: string | undefined) {
        if (typeof username == "string" && typeof password == "string") {
            await this.agent.login({identifier: username, password: password})
        } else {
            throw new Error(`BskyAgent.login | Must provide string values for username and password parameters.`)
        }
    }

    async postRecord(text: string) {
        const rt = new RichText({text: text})

        await rt.detectFacets(this.agent)

        const record = {
            $type: 'app.bsky.feed.post',
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString(),
        }

        await this.agent.post(record)

        console.log(`BskyAgent.post | Successfully posted.`)
    }

    async post(text: string) {
        await this.agent.post({text: text})

        console.log(`BskyAgent.post | Successfully posted.`)
    }
}

