export async function decodeStream(stream) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let result = '';
    while (!done) {
        const { value, done: isDone } = await reader.read();
        done = isDone;
        if (value) {
            result += decoder.decode(value, { stream: true });
        }
    }
    result += decoder.decode();
    console.log(result);
}
