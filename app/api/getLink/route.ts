import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prompts from "./prompts.json";
import { interpolatePrompt } from "./utils";

const ArticleRequestSchema = z.object({
	prompt: z.string().min(1).max(500),
	targetLanguage: z.string().min(1).max(50),
});

async function callMistral(
	prompt: string,
	systemPrompt: string,
): Promise<string> {
	const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
		},
		body: JSON.stringify({
			model: "mistral-tiny",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: prompt },
			],
			max_tokens: 4096,
			temperature: 0.9,
		}),
	});

	if (!res.ok) {
		const error = await res.text();
		throw new Error(`Mistral API error: ${res.status} - ${error}`);
	}

	const data = await res.json();
	return data.choices?.[0]?.message?.content?.trim() || "";
}

export async function POST(req: NextRequest) {
	try {
		const json = await req.json();
		const parseResult = ArticleRequestSchema.safeParse(json);

		if (!parseResult.success) {
			return NextResponse.json(
				{ error: "Invalid request", details: parseResult.error.errors },
				{ status: 400 },
			);
		}

		const { prompt, targetLanguage } = parseResult.data;

		// Step 1: Generate Outline
		const outlinePrompt = interpolatePrompt(prompts.outline, { prompt });

		const systemPrompt =
			"You are a professional content strategist. Create well-structured, informative content outlines and articles without using emojis.";

		const outline = await callMistral(outlinePrompt, systemPrompt);

		// Step 2: Generate Article
		const articlePrompt = interpolatePrompt(prompts.article, {
			prompt,
			targetLanguage,
			outline,
		});

		const article = await callMistral(articlePrompt, systemPrompt);

		return NextResponse.json({
			outline,
			article,
			success: true,
		});
	} catch (error) {
		console.error("Article generation error:", error);

		if (error instanceof Error && error.message.includes("Mistral API error")) {
			return NextResponse.json(
				{
					error: "External API error",
					message: "Unable to generate content at this time",
				},
				{ status: 503 },
			);
		}

		return NextResponse.json(
			{ error: "Internal server error", message: "Something went wrong" },
			{ status: 500 },
		);
	}
}
