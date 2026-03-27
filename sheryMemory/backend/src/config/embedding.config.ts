import { MistralAIEmbeddings } from '@langchain/mistralai'

const embeddings = new MistralAIEmbeddings({
  apiKey: process.env.MISTRALAI_API_KEY,
})

export default embeddings
