import { IngredientCatalogItem } from "./types";

// Public image thumbnails are loaded remotely; emoji remains as a fallback if an image cannot load.
const photo = (term: string, lock: number) =>
  `https://loremflickr.com/320/240/${encodeURIComponent(term)}?lock=${lock}`;

export const INGREDIENT_CATALOG: IngredientCatalogItem[] = [
  { name: "Apples", category: "Produce", unit: "pcs", emoji: "🍎", imageUrl: photo("red apples fruit", 11) },
  { name: "Bananas", category: "Produce", unit: "pcs", emoji: "🍌", imageUrl: photo("bananas fruit", 12) },
  { name: "Tomatoes", category: "Produce", unit: "pcs", emoji: "🍅", imageUrl: photo("tomatoes", 13) },
  { name: "Potatoes", category: "Produce", unit: "pcs", emoji: "🥔", imageUrl: photo("potatoes", 14) },
  { name: "Onions", category: "Produce", unit: "pcs", emoji: "🧅", imageUrl: photo("onions", 15) },
  { name: "Carrots", category: "Produce", unit: "pcs", emoji: "🥕", imageUrl: photo("carrots", 16) },
  { name: "Broccoli", category: "Produce", unit: "pcs", emoji: "🥦", imageUrl: photo("broccoli", 17) },
  { name: "Spinach", category: "Produce", unit: "g", emoji: "🥬", imageUrl: photo("spinach leaves", 18) },
  { name: "Bell Peppers", category: "Produce", unit: "pcs", emoji: "🫑", imageUrl: photo("bell peppers", 19) },
  { name: "Garlic", category: "Produce", unit: "clove", emoji: "🧄", imageUrl: photo("garlic bulbs", 20) },
  { name: "Lemons", category: "Produce", unit: "pcs", emoji: "🍋", imageUrl: photo("lemons", 21) },
  { name: "Mushrooms", category: "Produce", unit: "g", emoji: "🍄", imageUrl: photo("mushrooms", 22) },
  { name: "Eggs", category: "Dairy & Eggs", unit: "pcs", emoji: "🥚", imageUrl: photo("eggs in carton", 23) },
  { name: "Milk", category: "Dairy & Eggs", unit: "ml", emoji: "🥛", imageUrl: photo("glass milk", 24) },
  { name: "Butter", category: "Dairy & Eggs", unit: "g", emoji: "🧈", imageUrl: photo("butter", 25) },
  { name: "Cheese", category: "Dairy & Eggs", unit: "g", emoji: "🧀", imageUrl: photo("cheese", 26) },
  { name: "Yogurt", category: "Dairy & Eggs", unit: "g", emoji: "🥣", imageUrl: photo("yogurt bowl", 27) },
  { name: "Chicken", category: "Meat & Seafood", unit: "g", emoji: "🍗", imageUrl: photo("raw chicken breast", 28) },
  { name: "Ground Beef", category: "Meat & Seafood", unit: "g", emoji: "🥩", imageUrl: photo("ground beef", 29) },
  { name: "Salmon", category: "Meat & Seafood", unit: "g", emoji: "🐟", imageUrl: photo("salmon fillet", 30) },
  { name: "Rice", category: "Grains & Bread", unit: "g", emoji: "🍚", imageUrl: photo("uncooked rice", 31) },
  { name: "Pasta", category: "Grains & Bread", unit: "g", emoji: "🍝", imageUrl: photo("dry pasta", 32) },
  { name: "Bread", category: "Grains & Bread", unit: "slice", emoji: "🍞", imageUrl: photo("sliced bread", 33) },
  { name: "Oats", category: "Grains & Bread", unit: "g", emoji: "🥣", imageUrl: photo("rolled oats", 34) },
  { name: "Flour", category: "Baking & Pantry", unit: "g", emoji: "🌾", imageUrl: photo("flour bowl", 35) },
  { name: "Sugar", category: "Baking & Pantry", unit: "g", emoji: "🍚", imageUrl: photo("white sugar", 36) },
  { name: "Olive Oil", category: "Baking & Pantry", unit: "ml", emoji: "🫒", imageUrl: photo("olive oil bottle", 37) },
  { name: "Canned Beans", category: "Baking & Pantry", unit: "can", emoji: "🥫", imageUrl: photo("canned beans", 38) },
  { name: "Salt", category: "Herbs & Spices", unit: "g", emoji: "🧂", imageUrl: photo("salt bowl", 39) },
  { name: "Black Pepper", category: "Herbs & Spices", unit: "g", emoji: "🌶️", imageUrl: photo("black peppercorns", 40) },
  { name: "Basil", category: "Herbs & Spices", unit: "g", emoji: "🌿", imageUrl: photo("fresh basil", 41) },
  { name: "Cinnamon", category: "Herbs & Spices", unit: "g", emoji: "🪵", imageUrl: photo("cinnamon sticks", 42) }
];

export const INGREDIENT_CATEGORIES = [
  "All", "Produce", "Dairy & Eggs", "Meat & Seafood", "Grains & Bread", "Baking & Pantry", "Herbs & Spices"
];
