
import { Ingredient, MealType, Recipe } from "./types";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export async function generateRecipes(
  ingredients: Ingredient[],
  mealType: MealType,
  count = 4,
  options: { signal?: AbortSignal; maxMinutes?: number; diet?: string; avoid?: string; assumeStaples?: boolean } = {}
): Promise<Recipe[]> {
  const availableIngredients = ingredients
    .filter((item) => item.amount > 0)
    .map(({ name, amount, unit }) => ({
      name,
      amount,
      unit,
    }));

  const response = await fetch(`${API_URL}/api/recipes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: options.signal,
    body: JSON.stringify({
      mealType,
      count,
      maxMinutes: options.maxMinutes || 0,
      diet: options.diet || "none",
      avoid: options.avoid || "",
      assumeStaples: options.assumeStaples ?? true,
      ingredients: availableIngredients,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Could not generate recipes.");
  }

  return payload.recipes as Recipe[];
}

