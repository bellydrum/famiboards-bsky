/**
 * 
 * @param fileURL https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#processing_a_text_file_line_by_line
 * @description Use the default export to read an HTML page returned from a URL.
 * 
 */

async function* makeTextFileLineIterator(fileURL: string) {
    const response = await fetch(fileURL);

    if (response.body == null) {
        throw new Error("read-stream.makeTextFileLineIterator | ERROR | response.body was null.")
    }

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

    let { value: chunk, done: readerDone } = await reader.read();
    chunk = chunk || "";

    const newline = /\r?\n/gm;
    let startIndex = 0;

    while (true) {
        const result = newline.exec(chunk);

        if (!result) {
            if (readerDone) break;

            const remainder = chunk.substr(startIndex);
            ({ value: chunk, done: readerDone } = await reader.read())
            chunk = remainder + (chunk || "")
            startIndex = newline.lastIndex = 0

            continue;
        }

        yield chunk.substring(startIndex, result.index)

        startIndex = newline.lastIndex;
    }

    if (startIndex < chunk.length) yield chunk.substring(startIndex)
}

async function run(urlOfFile: string) {
    let result = ""

    for await (const line of makeTextFileLineIterator(urlOfFile)) {
        result = result + line
    }

    return result
}

export default run