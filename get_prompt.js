const fs = require('fs');
const readline = require('readline');

async function extractUserMessages() {
  const fileStream = fs.createReadStream('C:\\Users\\LENOVO\\.gemini\\antigravity-ide\\brain\\016f3581-50d4-4b26-a69f-81b0202ffb5c\\.system_generated\\logs\\transcript.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const messages = [];

  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === 'USER_INPUT' && parsed.content) {
        messages.push(parsed.content);
      }
    } catch (e) {
      // ignore
    }
  }
  
  fs.writeFileSync('d:\\pagalpan\\Github\\racectrl\\user_messages.txt', messages.join('\n\n====================\n\n'));
}

extractUserMessages();
