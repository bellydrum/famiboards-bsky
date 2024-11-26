export interface ThreadItemOptional {
    tag: string | null,
    text: string | null,
    href: string | null,
    metadata: {
        user: string,
        forum: string | null
    },
}

export interface ThreadItem {
    text: string,
}