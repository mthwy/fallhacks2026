import type { Ingredient, MealType, Recipe } from "./types";
import { PANTRY_INGREDIENTS, STARTER_RECIPE_ROWS } from "./recipeLibrary";

export type Diet = "none" | "vegetarian" | "vegan" | "pescatarian" | "glutenfree" | "dairyfree";
export interface RecipePreferences {
  diet: Diet;
  avoid: string;
  assumeStaples: boolean;
  defaultServings: number;
}
export const DEFAULT_RECIPE_PREFERENCES: RecipePreferences = {
  diet: "none", avoid: "", assumeStaples: true, defaultServings: 2
};

const NAME_TO_KEY = new Map<string, string>();
const KNOWN_UNITS: Record<string, ["weight" | "volume" | "count", number]> = {
  g: ["weight", 1], kg: ["weight", 1000], oz: ["weight", 28.349523125], lb: ["weight", 453.59237],
  ml: ["volume", 1], l: ["volume", 1000], tsp: ["volume", 5], tbsp: ["volume", 15],
  cup: ["volume", 240], pint: ["volume", 473.176], quart: ["volume", 946.353],
  pcs: ["count", 1], slice: ["count", 1], can: ["count", 1], pack: ["count", 1], bunch: ["count", 1]
};

export function normalizeIngredientName(name: string): string {
  return String(name || "").toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean)
    .map(w => {
      if (w.length < 4) return w;
      if (/ies$/.test(w)) return w.slice(0, -3) + "y";
      if (/(ch|sh|x|z|o)es$/.test(w)) return w.slice(0, -2);
      if (/[^s]s$/.test(w)) return w.slice(0, -1);
      return w;
    }).join(" ");
}
for (const [key, details] of Object.entries(PANTRY_INGREDIENTS)) {
  for (const alias of [key.replace(/_/g, " "), details.name, ...details.aliases]) {
    const norm = normalizeIngredientName(alias);
    if (!NAME_TO_KEY.has(norm)) NAME_TO_KEY.set(norm, key);
  }
}
export function ingredientKey(name: string): string {
  const norm = normalizeIngredientName(name);
  return NAME_TO_KEY.get(norm) || norm;
}
export function normalizeRecipeUnit(unit: string): string {
  const u = String(unit || "").trim().toLowerCase();
  return ({ piece: "pcs", pieces: "pcs", pc: "pcs", whole: "pcs", clove: "pcs", cloves: "pcs",
    slices: "slice", cans: "can", packages: "pack", package: "pack", packs: "pack", bunches: "bunch",
    liter: "l", liters: "l", litre: "l", litres: "l", grams: "g", gram: "g",
    kilograms: "kg", kilogram: "kg" } as Record<string, string>)[u] || u;
}

function countMeaning(unit: string, key: string): "piece" | "can" | "pack" | "bunch" | null {
  const u = normalizeRecipeUnit(unit);
  if (u === "pcs") return "piece";
  if (u === "slice") return key === "bread" || key === "bacon" ? "piece" : null;
  if (u === "can") return "can";
  if (u === "pack") return "pack";
  if (u === "bunch") return "bunch";
  return null;
}

/** Convert quantities for the *specific ingredient*. Unknown units/densities remain unconvertible. */
export function convertRecipeAmount(amount: number, from: string, to: string, name: string): number | null {
  if (!Number.isFinite(amount) || amount < 0) return null;
  from = normalizeRecipeUnit(from); to = normalizeRecipeUnit(to);
  if (from === to) return amount;
  const a = KNOWN_UNITS[from], b = KNOWN_UNITS[to];
  if (!a || !b) return null;
  const key = ingredientKey(name), info = PANTRY_INGREDIENTS[key];
  if (a[0] === b[0]) {
    if (a[0] !== "count") return amount * a[1] / b[1];
    const x = countMeaning(from, key), y = countMeaning(to, key);
    return x && x === y ? amount : null;
  }
  // Ingredient-specific density and piece weights from the supplied HTML.
  if (!info) return null;
  const density = info.density, gramsPerPiece = info.gramsPerPiece;
  const fromCount = countMeaning(from, key), toCount = countMeaning(to, key);
  function toGrams(): number | null {
    if (a[0] === "weight") return amount * a[1];
    if (a[0] === "volume") return density ? amount * a[1] * density : null;
    if (fromCount === "piece" && gramsPerPiece) return amount * gramsPerPiece;
    if (fromCount === "can" && info.unit !== "pcs" && gramsPerPiece) return amount * gramsPerPiece;
    return null;
  }
  const grams = toGrams();
  if (grams === null) return null;
  if (b[0] === "weight") return grams / b[1];
  if (b[0] === "volume") return density ? grams / density / b[1] : null;
  if (toCount === "piece" && gramsPerPiece) return grams / gramsPerPiece;
  if (toCount === "can" && info.unit !== "pcs" && gramsPerPiece) return grams / gramsPerPiece;
  return null;
}

/** Days remaining until a best-before date, based on the user's local calendar. */
export function daysUntilExpiry(item: Ingredient): number | null {
  const raw = item.expiryDate;
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [y, m, d] = raw.split("-").map(Number);
  const expiry = new Date(y, m - 1, d);
  if (expiry.getFullYear() !== y || expiry.getMonth() !== m - 1 || expiry.getDate() !== d) return null;
  const now = new Date();
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
}

function avoided(name: string, prefs: RecipePreferences): boolean {
  const banned = prefs.avoid.split(/[,;\n]/).map(normalizeIngredientName).filter(Boolean);
  if (!banned.length) return false;
  const key = ingredientKey(name);
  const details = PANTRY_INGREDIENTS[key];
  const spellings = [name, key.replace(/_/g, " "), ...(details?.aliases || [])].map(normalizeIngredientName);
  return banned.some(term => spellings.some(value => value === term || value.includes(term)));
}
export function ingredientAllowed(name: string, prefs: RecipePreferences): boolean {
  if (avoided(name, prefs)) return false;
  const details = PANTRY_INGREDIENTS[ingredientKey(name)];
  const flags = [...(details?.flags || [])];
  if (!details) {
    const n = normalizeIngredientName(name);
    if (/\b(chicken|beef|pork|bacon|sausage|salami|ham|turkey|lamb|steak)\b/.test(n)) flags.push("meat");
    if (/\b(fish|salmon|tuna|shrimp|prawn|anchovy|sardine)\b/.test(n)) flags.push("fish");
    if (/\b(egg|mayonnaise)\b/.test(n)) flags.push("egg");
    if (/\b(cheese|yogurt|butter|cream|milk)\b/.test(n) && !/coconut|almond|soy|oat milk/.test(n)) flags.push("dairy");
    if (/\bhoney\b/.test(n)) flags.push("honey");
    if (/\b(wheat|flour|bread|pasta|noodle|tortilla)\b/.test(n)) flags.push("gluten");
  }
  switch (prefs.diet) {
    case "vegetarian": return !flags.includes("meat") && !flags.includes("fish");
    case "vegan": return !["meat", "fish", "egg", "dairy", "honey"].some(f => flags.includes(f));
    case "pescatarian": return !flags.includes("meat");
    case "glutenfree": return !flags.includes("gluten");
    case "dairyfree": return !flags.includes("dairy");
    default: return true;
  }
}
export function recipeAllowed(recipe: Recipe, prefs: RecipePreferences): boolean {
  return recipe.ingredients.every(i => ingredientAllowed(i.name, prefs));
}

export interface IngredientAvailability {
  item: Recipe["ingredients"][number];
  pantryItem: Ingredient | null;
  neededInPantryUnit: number | null;
  available: number;
  enough: boolean;
  incompatible: boolean;
  assumed: boolean;
  expired: boolean;
  expiringSoon: boolean;
}
export function recipeAvailabilityFor(recipe: Recipe, pantry: Ingredient[], prefs: RecipePreferences): IngredientAvailability[] {
  return recipe.ingredients.map(item => {
    const key = ingredientKey(item.name);
    const candidates = pantry.filter(p => ingredientKey(p.name) === key);
    const usable = candidates.filter(p => p.amount > 0 && !(daysUntilExpiry(p) !== null && daysUntilExpiry(p)! < 0));
    const measured = usable.map(p => ({
      p, needed: convertRecipeAmount(item.amount, item.unit, p.unit, item.name)
    }));
    // Prefer enough stock; if tied, prefer ingredients that should be used soon.
    measured.sort((a,b) => {
      const aEnough = a.needed !== null && a.p.amount >= a.needed - 1e-6 ? 1 : 0;
      const bEnough = b.needed !== null && b.p.amount >= b.needed - 1e-6 ? 1 : 0;
      if (aEnough !== bEnough) return bEnough - aEnough;
      const aSoon = daysUntilExpiry(a.p), bSoon = daysUntilExpiry(b.p);
      return (aSoon === null ? 9999 : aSoon) - (bSoon === null ? 9999 : bSoon);
    });
    const best = measured.find(x => x.needed !== null) || measured[0];
    const pantryItem = best?.p || candidates[0] || null;
    const needed = best?.needed ?? (pantryItem ? convertRecipeAmount(item.amount, item.unit, pantryItem.unit, item.name) : null);
    const expired = !!pantryItem && daysUntilExpiry(pantryItem) !== null && daysUntilExpiry(pantryItem)! < 0;
    const enough = !!best && best.needed !== null && best.p.amount + 1e-6 >= best.needed;
    const assumed = !enough && candidates.length === 0 && prefs.assumeStaples && ["salt", "pepper", "oil"].includes(key);
    const days = pantryItem ? daysUntilExpiry(pantryItem) : null;
    return { item, pantryItem, neededInPantryUnit: needed, available: best?.p.amount ?? 0,
      enough: enough || assumed, incompatible: !!pantryItem && needed === null,
      assumed, expired, expiringSoon: enough && days !== null && days >= 0 && days <= 3 };
  });
}

export interface SuggestedRecipe {
  recipe: Recipe;
  source: "offline" | "ai";
  availability: IngredientAvailability[];
  missing: number;
  soonCount: number;
  score: number;
}

function slotGroups(source: string) {
  return source.split(",").map(group => {
    const optional = group.includes("?");
    const alternatives = group.split("|").map(piece => {
      const [key, quantity] = piece.replace(/\?/g, "").split(":");
      const details = PANTRY_INGREDIENTS[key];
      if (!details) throw new Error(`Unknown recipe ingredient ${key}`);
      return { key, name: details.name, amount: Number(quantity), unit: details.unit, optional };
    });
    return { optional, alternatives };
  });
}

/** Select an allowed alternate that best fits the current pantry, without inventing substitutions. */
export function offlineRecipes(
  meal: MealType, pantry: Ingredient[], prefs: RecipePreferences
): Recipe[] {
  const letter = ({ breakfast: "b", lunch: "l", dinner: "d" } as Record<MealType, string>)[meal];
  const output: Recipe[] = [];
  for (const [title, meals, baseServings, totalMinutes, _difficulty, ingredientText, stepText] of STARTER_RECIPE_ROWS) {
    if (!meals.includes(letter)) continue;
    const chosen: Recipe["ingredients"] = [];
    let rejected = false;
    for (const slot of slotGroups(ingredientText)) {
      const allowed = slot.alternatives.filter(alt => ingredientAllowed(alt.name, prefs));
      if (!allowed.length) { if (!slot.optional) rejected = true; continue; }
      // Test alternatives at the user's default serving count, but preserve original base amounts.
      const candidates = allowed.map(alt => {
        const mock: Recipe = { title, mealType: meal, servings: baseServings,
          description: "", prepMinutes: 0, cookMinutes: totalMinutes,
          ingredients: [{ name: alt.name, amount: alt.amount * prefs.defaultServings / baseServings,
            unit: alt.unit, optional: alt.optional }], steps: [] };
        const availability = recipeAvailabilityFor(mock, pantry, prefs)[0];
        const present = availability.enough ? 2 : availability.pantryItem ? 1 : 0;
        return { alt, present, soon: availability.expiringSoon ? 1 : 0 };
      });
      candidates.sort((a,b) => b.present - a.present || b.soon - a.soon);
      const alt = candidates[0].alt;
      chosen.push({ name: alt.name, amount: alt.amount, unit: alt.unit, optional: slot.optional });
    }
    if (rejected || !chosen.length) continue;
    const prepMinutes = Math.min(totalMinutes, Math.max(3, Math.round(totalMinutes / 3)));
    output.push({
      title, mealType: meal, servings: baseServings, prepMinutes,
      cookMinutes: totalMinutes - prepMinutes,
      description: `From the offline recipe library · approximately ${totalMinutes} minutes total.`,
      ingredients: chosen, steps: stepText.split("//")
    });
  }
  return output;
}

export function makeSuggestions(
  recipes: Recipe[], pantry: Ingredient[], prefs: RecipePreferences,
  history: Array<{ recipe_title: string; cooked_at: string }>, maxMinutes = 0
): SuggestedRecipe[] {
  const result: SuggestedRecipe[] = [];
  for (const recipe of recipes) {
    if (maxMinutes && recipe.prepMinutes + recipe.cookMinutes > maxMinutes) continue;
    if (!recipeAllowed(recipe, prefs)) continue;
    const availability = recipeAvailabilityFor(recipe, pantry, prefs);
    const missing = availability.filter(r => !r.item.optional && !r.enough).length;
    const soonCount = availability.filter(r => r.expiringSoon && !r.assumed).length;
    const used = availability.filter(r => r.enough && !r.assumed && !r.item.optional).length;
    const recent = history.filter(h => h.recipe_title.toLowerCase() === recipe.title.toLowerCase() &&
      Date.now() - Date.parse(h.cooked_at) < 3 * 86400000).length;
    const source = (recipe as Recipe & { source?: string }).source === "ai" ? "ai" : "offline";
    const score = (missing === 0 ? 1000 : 0) - 140 * missing + 20 * soonCount + 9 * used -
      90 * recent - 0.15 * (recipe.prepMinutes + recipe.cookMinutes) + (source === "ai" ? 4 : 0);
    result.push({ recipe, source, availability, missing, soonCount, score });
  }
  return result.sort((a,b) => b.score - a.score || a.recipe.title.localeCompare(b.recipe.title));
}

export function scaleRecipe(recipe: Recipe, servings: number): Recipe {
  const base = recipe.servings > 0 ? recipe.servings : 2;
  return { ...recipe, servings,
    ingredients: recipe.ingredients.map(i => ({ ...i, amount: Math.round(i.amount * servings / base * 10000) / 10000 })) };
}
