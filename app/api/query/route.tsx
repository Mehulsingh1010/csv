import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// WARNING: This is not secure. In a production environment, use environment variables.
const API_KEY = 'AIzaSyA_JrhZRFEj8bFheo4nx8iXmpNo4nhW8YM';

export async function POST(req: Request) {
  const { query, csvData } = await req.json();

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    You are an AI assistant analyzing CSV data. The data includes the following fields:
    ${Object.keys(csvData[0]).join(', ')}

    Here's a summary of the data:
    ${JSON.stringify(csvData.slice(0, 5))}

    Please answer the following question about the CSV data:
    ${query}

    Provide a concise and accurate answer based on the data provided.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ answer: text });
  } catch (error) {
    console.error('Error generating answer:', error);
    return NextResponse.json({ error: 'Failed to generate answer' }, { status: 500 });
  }
}

