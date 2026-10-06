import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const situation = body.situation?.trim();

    if (!situation) {
      return NextResponse.json(
        { error: "Situation is required." },
        { status: 400 }
      );
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "DeepSeek API key is missing." },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    const aiPrompt = `
    You are writing content for a website called Columbia Survival Guide.

    Your audience is Columbia University students dealing with everyday college chaos.

    A student submitted this situation:

    "${situation}"

    Generate survival advice that is:
    - genuinely funny and witty
    - relatable to college students
    - somewhat helpful
    - concise and easy to read
    - playful, casual, and slightly dramatic
    - appropriate for a college audience

    Lean into humor while still giving genuinely useful advice. The response should feel like something a funny, experienced upperclassman or chronically online friend would say—playful and witty.

    Use natural line breaks to make the response easy to scan. Break the advice into short lines or mini-paragraphs when appropriate instead of writing one dense paragraph.

    Do not be offensive, cruel, mean-spirited, or overly serious.

    Return exactly two parts in this format:

    TITLE: [a short, funny, punchy title]

    CONTENT:
    [short survival advice with natural line breaks, maximum 60 words total]

    Do not include any other labels, explanations, or commentary.
    `;

    const completion = await client.chat.completions.create({
      model: "deepseek-flash",
      messages: [
        {
          role: "system",
          content:
            "You create concise, funny, and helpful survival advice for Columbia University students.",
        },
        {
          role: "user",
          content: aiPrompt,
        },
      ],
      stream: false,
    });

    const text =
      completion.choices[0]?.message?.content?.trim() || "";

    if (!text) {
      return NextResponse.json(
        { error: "The AI returned an empty response." },
        { status: 500 }
      );
    }

    const titleMatch = text.match(/TITLE:\s*(.*)/i);
    const contentMatch = text.match(/CONTENT:\s*([\s\S]*)/i);

    const title =
      titleMatch?.[1]?.trim() ||
      "Columbia Survival Advice";

    const content =
      contentMatch?.[1]?.trim() ||
      text;

    return NextResponse.json({
      title,
      content,
      aiPrompt,
    });
  } catch (error: any) {
    console.error("DeepSeek error:", error);

    if (error?.status === 429) {
      return NextResponse.json(
        {
          error:
            "The AI request limit has been reached. Please try again later.",
        },
        { status: 429 }
      );
    }

    if (error?.status === 402) {
      return NextResponse.json(
        {
          error:
            "Your DeepSeek account does not have enough API balance.",
        },
        { status: 402 }
      );
    }

    if (error?.status === 503) {
      return NextResponse.json(
        {
          error:
            "The AI service is temporarily unavailable. Please try again.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to generate survival advice.",
      },
      { status: 500 }
    );
  }
}