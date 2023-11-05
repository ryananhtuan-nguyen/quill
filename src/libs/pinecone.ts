import { Pinecone } from '@pinecone-database/pinecone'

export const getPineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
  environment: 'gcp-starter',
})
