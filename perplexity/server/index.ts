import { HumanMessage } from "langchain";
import model from "./src/configs/ai.model.conf";
import rl from "./src/utils/readline.util";

let ChatMessage = [];
/**
 * @typedef {Array} ChatMessage
 * @property {string} content - The message content.
 * @property {string} role - "user" or "ai".
 */
while (true) {
  const userInput = await rl.question("You: ");
  if(userInput.toLowerCase() === "exit") {
    console.log("Exiting the chat. Goodbye!");
    rl.close();
    break;
  }
  ChatMessage.push(new HumanMessage(userInput));
  const response = await model.invoke(ChatMessage);
  ChatMessage.push(response);
  console.log(`Assistant: ${response.content}`);
}
