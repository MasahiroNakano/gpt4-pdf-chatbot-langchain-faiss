import { makeChain } from '@/utils/makechain';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { FaissStore } from 'langchain/vectorstores/faiss';
import type { NextApiRequest, NextApiResponse } from 'next';

import Cors from 'cors';
// Initialize cors middleware
const cors = Cors({
  methods: ['POST', 'HEAD'], // This would allow POST and HEAD methods from any origin. Add or remove methods according to your needs.
});

// Helper method to wait for a middleware to execute before continuing
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
};

// Save the vector store to a directory
const directory = 'faiss-store';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await runMiddleware(req, res, cors);

  const { question, history } = req.body;

  console.log('question', question);

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }

  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {

    /* create vectorstore*/
    /* const vectorStore = await Chroma.fromExistingCollection(
      new OpenAIEmbeddings({}),
      {
        collectionName: COLLECTION_NAME,
       },
    ); */
    const vectorStore = await FaissStore.load(
      directory,
      new OpenAIEmbeddings({}),
    );

    //create chain
    const chain = makeChain(vectorStore);
    //Ask a question using chat history
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    });

    console.log('response', response);
    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
