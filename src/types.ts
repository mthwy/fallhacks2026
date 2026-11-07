export type MealType = "breakfast" | "lunch" | "dinner";

export type Ingredient = {
  id: number;
  name: string;
  category: string;
  amount: number;
  unit: string;
  expiryDate?: string | null;
};

export type RecipeIngredient = {
  name: string;
  amount: number;
  unit: string;
  optional?: boolean;
};

export type Recipe = {
  id?: number;
  title: string;
  mealType: MealType;
  description: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  source?: "ai" | "saved";
};

export type CookItem = {
  ingredientId: number;
  name: string;
  unit: string;
  plannedAmount: number;
  actualAmount: number;
  usedSuggested: boolean;
};

export type ShoppingListItem = {
  id: number;
  ingredient_name: string;
  category: string;
  quantity: number;
  unit: string;
  created_at: string;
};

export type IngredientCatalogItem = {
  name: string;
  category: string;
  unit: string;
  emoji: string;
  imageUrl: string;
};
