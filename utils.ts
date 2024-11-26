import { parseFromString } from '@bellydrum/dom-parser/src/index.ts'

import { ThreadItem, ThreadItemOptional } from './interfaces.ts'
import run from './read-stream.ts'
import { readStoredThreads, writeStoredThreads } from './storage-access.ts'



export async function getNewThreads() {
    const url = "https://famiboards.com/pages/latest-threads/"

    const latestThreads: ThreadItemOptional[] = await getLatestThreads(url)
    const storedThreads: ThreadItem[] = await readStoredThreads()

    const storedThreadTitles: string[] = storedThreads.map(thread => { return thread.text }).filter(thread => thread != null)

    const newThreads: ThreadItemOptional[] = latestThreads.filter((thread) => {
        return thread.text && !storedThreadTitles.includes(thread.text)
    })

    if (newThreads.length) await writeStoredThreads(latestThreads)

    return newThreads
}


export async function getLatestThreads(url: string, limit: number=50): Promise<ThreadItemOptional[]> {
    // access the given url as a document object
    const pageHtml = await run(url)
    const dom = parseFromString(pageHtml)

    // set fixed document assets
    const threadParentNodeName = "structItem-cell--main"
    const threadChildNodeTitleName = "structItem-title"
    const threadChildNodeAdditionalInfoName = "structItem-minor"
    const threadChildNodeAdditionalInfoMetadataName = "structItem-parts"

    return dom.getElementsByClassName(threadParentNodeName).reduce(
        (threadItems: ThreadItemOptional[], node) => {
            const threadTitleNode = node.getElementsByClassName(threadChildNodeTitleName).length == 1 ? node.getElementsByClassName(threadChildNodeTitleName)[0] : null
            const threadAdditionalInfoNode = node.getElementsByClassName(threadChildNodeAdditionalInfoName).length == 1 ? node.getElementsByClassName(threadChildNodeAdditionalInfoName)[0] : null

            if (threadTitleNode && threadAdditionalInfoNode) {
                const threadTagNode = threadTitleNode.getElementsByTagName("span").length == 1 ? threadTitleNode.getElementsByTagName("span")[0] : null
                const threadLinkNode = threadTitleNode.getElementsByTagName("a").length == 1 ? threadTitleNode.getElementsByTagName("a")[0] : null
                const threadDataNode = threadAdditionalInfoNode.getElementsByClassName(threadChildNodeAdditionalInfoMetadataName).length == 1 ? threadAdditionalInfoNode.getElementsByClassName(threadChildNodeAdditionalInfoMetadataName)[0] : null

                const threadMetadata = {
                    user: threadAdditionalInfoNode.getElementsByClassName("username").length == 1 ? threadAdditionalInfoNode?.getElementsByClassName("username")[0].textContent : null,
                    // NOTE: assumes div.structItem-parts contains 3 total a elements, and that the last one is always a link to the forum name
                    forum: threadDataNode?.getElementsByTagName("a").length == 3 ? threadDataNode.getElementsByTagName("a")[2].textContent : null
                }

                const threadItem: ThreadItemOptional = {
                    tag: threadTagNode ? threadTagNode.textContent : null,
                    text: threadLinkNode ? threadLinkNode.textContent : null,
                    href: threadLinkNode ? threadLinkNode.getAttribute("href") : null,
                    metadata: threadMetadata
                }

                if (threadItem.text) threadItems.push(threadItem)
            }

            return threadItems
        },
        []
    ).filter(thread => thread.text != null).slice(0, limit ? limit > 0 && limit <= 50 ? limit : 50 : undefined)
}