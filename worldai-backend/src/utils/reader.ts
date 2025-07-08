export async function decodeStream(stream) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();  // A TextDecoder to convert binary data to text
    let done = false;
    let result = '';
  
    while (!done) {
      const { value, done: isDone } = await reader.read();
      done = isDone;
      if (value) {
        // Decode the chunk and append it to the result
        result += decoder.decode(value, { stream: true });
      }
    }
  
    // Final decode to flush remaining data
    result += decoder.decode(); 
    console.log(result);  // Output the decoded result
  }