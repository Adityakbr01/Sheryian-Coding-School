import { ChatMistralAI } from "@langchain/mistralai";
import env from "./ENV";

// Initialize the Mistral AI model with the specified parameters
const MistralAI = new ChatMistralAI({
  apiKey: env.MISTRALAI_API_KEY || "",
  model: "mistral-small-latest",
  temperature: 0,
});


export default MistralAI;