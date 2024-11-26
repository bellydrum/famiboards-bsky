const postTextCharLimit = 300
const baseUrl = "https://famiboards.com"


export function generatePostText(username: string, text: string, href: string, forum: string | null) {
    /**
     * incrementally add information to the post while it remains below the post text character limit
     */
    const url = `${baseUrl}${href.replaceAll("&quot;", '"')}`
    const textFormatted = text.replaceAll("&quot;", '"')

    if (url.length > postTextCharLimit) {
        const errorMessage = `templates.generatePostText | ERROR | Post url exceeds post character limit of 300: "${url}"`

        throw new Error(errorMessage)
    }

    const postTextTitleAndUrl = `"${textFormatted}"\n\n${url}`

    if (postTextTitleAndUrl.length > postTextCharLimit) {
        return url
    }

    const alertMessage = forum ? `${username} posted a new thread in ${forum}:` : `${username} posted a new thread:`
    const postTextWithAttribution = `${alertMessage}\n\n${postTextTitleAndUrl}`.length < postTextCharLimit ? `${alertMessage}\n\n${postTextTitleAndUrl}` : `${username} posted a new thread: ${postTextTitleAndUrl}`

    if (postTextWithAttribution.length > postTextCharLimit) {
        return postTextTitleAndUrl
    }

    return postTextWithAttribution
}