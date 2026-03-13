import { ChatMistralAI } from "@langchain/mistralai";

// Initialize the Mistral AI model with the specified parameters
const model = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0,
});


export default model;