import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const IngredientSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  unit: z.string().min(1)
});

const RecipeSchema = z.object({
  title: z.string().min(2),
  mealType: z.enum(["breakfast", "lunch", "dinner"]),
  description: z.string(),
  servings: z.number().int().positive(),
  prepMinutes: z.number().nonnegative(),
  cookMinutes: z.number().nonnegative(),
  ingredients: z.array(z.object({
    name: z.string(),
    amount: z.number().positive(),
    unit: z.string(),
    optional: z.boolean().optional()
  })).min(1),
  steps: z.array(z.string().min(5)).min(2)
});

// Identify temporary Gemini availability errors.
function isTemporaryError(error) {
  return (
    error?.status === 503 ||
    error?.code === 503 ||
    error?.status === "UNAVAILABLE" ||
    error?.message?.includes("503") ||
    error?.message?.includes("UNAVAILABLE")
  );
}

const sleep = (ms) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Generate recipes with automatic retries for temporary errors.
async function generateWithRetry(ai, model, prompt) {
  const maxRetries = 3;
  const totalStartedAt = Date.now();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const attemptStartedAt = Date.now();

    try {
      console.log(
        `Starting Gemini request (attempt ${attempt + 1}/${maxRetries + 1})...`
      );

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
          thinkingConfig: {
            thinkingLevel: "LOW"
          }
        }
      });

      const attemptSeconds =
        ((Date.now() - attemptStartedAt) / 1000).toFixed(1);

      const totalSeconds =
        ((Date.now() - totalStartedAt) / 1000).toFixed(1);

      console.log(
        `Gemini response received in ${attemptSeconds} seconds.`
      );

      console.log(
        `Total generation request time: ${totalSeconds} seconds.`
      );

      return response;

    } catch (error) {
      const attemptSeconds =
        ((Date.now() - attemptStartedAt) / 1000).toFixed(1);

      console.error(
        `Gemini attempt ${attempt + 1} failed after ${attemptSeconds} seconds.`
      );

      if (!isTemporaryError(error) || attempt === maxRetries) {
        throw error;
      }

      const delay = 1000 * Math.pow(2, attempt);

      console.warn(
        `Gemini temporarily unavailable. Retry ${attempt + 1}/${maxRetries} in ${delay / 1000} seconds.`
      );

      await sleep(delay);
    }
  }
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "pantry-to-plate-api",
    provider: "gemini"
  });
});

app.post("/api/recipes", async (req, res) => {
  const requestStartedAt = Date.now();

  console.log("Received recipe generation request.");

  try {
    const {
      mealType,
      ingredients,
      count = 4
    } = req.body || {};

    if (!["breakfast", "lunch", "dinner"].includes(mealType)) {
      return res.status(400).json({
        error: "Choose breakfast, lunch or dinner."
      });
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        error: "Add ingredients to your pantry first."
      });
    }

    const safeIngredients = z.array(IngredientSchema).parse(ingredients);

    console.log(
      `Generating ${mealType} recipes using ${safeIngredients.length} pantry ingredients.`
    );

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "Gemini is not configured. Add GEMINI_API_KEY to server/.env."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

    const requestedCount = Math.min(
      Math.max(Number(count) || 4, 1),
      5
    );

    const prompt = `Create ${requestedCount} practical ${mealType} recipes using ONLY the supplied pantry ingredients. Do not invent pantry ingredients. Water, salt and pepper may be assumed only in tiny quantities; list them only if essential. Ingredient names in each recipe MUST exactly match one of the supplied pantry ingredient names. Amounts must not exceed the available amount for that ingredient. Use the provided units exactly; do not convert units. Return a JSON object with a "recipes" array. Each recipe must have: title (string), mealType ("${mealType}"), description (string), servings (positive integer), prepMinutes (number), cookMinutes (number), ingredients (array of {name, amount, unit, optional}), and steps (array of strings). Keep steps clear and beginner-friendly. Pantry: ${JSON.stringify(safeIngredients)}`;

    // Generate recipes, automatically retrying temporary 503 errors.
    const response = await generateWithRetry(ai, model, prompt);

    const rawText = response.text;

    if (!rawText) {
      throw new Error("Gemini returned an empty response.");
    }

    console.log("Gemini response received. Validating recipes...");

    const parsed = JSON.parse(rawText);

    const rawRecipes = Array.isArray(parsed.recipes)
      ? parsed.recipes
      : [];

    const pantry = new Map(
      safeIngredients.map(i => [i.name.toLowerCase(), i])
    );

    const validRecipes = [];

    for (const raw of rawRecipes) {
      const checked = RecipeSchema.safeParse(raw);

      if (!checked.success) continue;

      const recipe = checked.data;

      if (recipe.mealType !== mealType) continue;

      const withinPantry = recipe.ingredients.every(ri => {
        const available = pantry.get(ri.name.toLowerCase());

        return available &&
          available.unit.toLowerCase() === ri.unit.toLowerCase() &&
          (ri.optional || ri.amount <= available.amount);
      });

      if (withinPantry) {
        validRecipes.push({
          ...recipe,
          source: "ai"
        });
      }
    }

    if (!validRecipes.length) {
      return res.status(502).json({
        error: "Gemini couldn't produce a recipe that fits your current quantities. Try adding more ingredients or generating again."
      });
    }

    console.log(
      `Successfully generated ${validRecipes.length} valid recipes.`
    );

    console.log(
      `Total API request time: ${((Date.now() - requestStartedAt) / 1000).toFixed(1)} seconds.`
    );

    res.json({
      recipes: validRecipes
    });

  } catch (error) {
    console.error("Gemini recipe generation error:", error);

    console.error(
      `Failed request after ${((Date.now() - requestStartedAt) / 1000).toFixed(1)} seconds.`
    );

    if (isTemporaryError(error)) {
      return res.status(503).json({
        error: "Gemini is temporarily experiencing high demand. Please wait a moment and try again."
      });
    }

    res.status(500).json({
      error: error.message || "Gemini recipe generation failed."
    });
  }
});

const port = Number(process.env.PORT || 4000);

app.listen(port, "0.0.0.0", () => {
  console.log(`Pantry-to-Plate Gemini API listening on port ${port}`);
});
