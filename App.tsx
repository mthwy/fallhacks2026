import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Animated, Image, Modal, SafeAreaView,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import {
  addToShoppingList, confirmCook, deleteIngredient, getHistory,
  getShoppingList, initDb, listIngredients, markShoppingItemPurchased,
  removeShoppingListItem, saveIngredient, undoCook, getRecipePreferences, saveRecipePreferences
} from "./src/db";
import { generateRecipes } from "./src/api";
import { CookItem, Ingredient, MealType, Recipe, ShoppingListItem } from "./src/types";
import { INGREDIENT_CATALOG, INGREDIENT_CATEGORIES } from "./src/ingredientCatalog";
import {
  DEFAULT_RECIPE_PREFERENCES, RecipePreferences, Diet, daysUntilExpiry,
  offlineRecipes, recipeAvailabilityFor, makeSuggestions, scaleRecipe
} from "./src/recipeEngine";

type Tab = "Home" | "Pantry" | "Recipes" | "Shopping" | "History";

const GREEN = "#247A4B";
const PALE = "#E8F3E8";
const CREAM = "#F7F5EF";

const UNIT_GROUPS = [
  { title: "Count", units: ["pcs", "slice", "bunch", "can", "pack"] },
  { title: "Weight", units: ["g", "kg", "oz", "lb"] },
  { title: "Volume", units: ["ml", "L", "tsp", "tbsp", "cup", "pint", "quart"] }
];

// Convert compatible measurement units before comparing or deducting pantry stock.
// Different measurement families (for example cups versus grams) cannot be safely
// converted without knowing the ingredient density, so those are flagged instead.
const MEASURES: Record<string, [string, number]> = {
  g: ["weight", 1], kg: ["weight", 1000], oz: ["weight", 28.349523125],
  lb: ["weight", 453.59237], ml: ["volume", 1], l: ["volume", 1000],
  tsp: ["volume", 5], tbsp: ["volume", 15], cup: ["volume", 240],
  pint: ["volume", 473.176], quart: ["volume", 946.353],
  pcs: ["count", 1], piece: ["count", 1], whole: ["count", 1],
  clove: ["clove", 1], slice: ["slice", 1], bunch: ["bunch", 1],
  can: ["can", 1], package: ["package", 1], pack: ["package", 1]
};
function normalizeUnit(value: string): string {
  const u = value.trim().toLowerCase();
  return ({ piece: "pcs", pieces: "pcs", pc: "pcs", whole: "pcs", package: "pack", packages: "pack" } as Record<string, string>)[u] || u;
}
function pantryAmount(amount: number, from: string, to: string): number | null {
  from = normalizeUnit(from);
  to = normalizeUnit(to);
  const fromUnit = MEASURES[from.trim().toLowerCase()];
  const toUnit = MEASURES[to.trim().toLowerCase()];
  if (from.trim().toLowerCase() === to.trim().toLowerCase()) return amount;
  if (!fromUnit || !toUnit || fromUnit[0] !== toUnit[0]) return null;
  return amount * fromUnit[1] / toUnit[1];
}
function showAmount(value: number): string {
  return String(Math.round(value * 100) / 100);
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("Home");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [historyDetail, setHistoryDetail] = useState<Recipe | null>(null);
  const [meal, setMeal] = useState<MealType>("dinner");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [preview, setPreview] = useState<Recipe | null>(null);
  const [previewServings, setPreviewServings] = useState(2);
  const [busy, setBusy] = useState(false);
  const [maxMinutes, setMaxMinutes] = useState(0);
  const [preferences, setPreferences] = useState<RecipePreferences>(DEFAULT_RECIPE_PREFERENCES);
  const [showPreferences, setShowPreferences] = useState(false);
  const [recipeSearch, setRecipeSearch] = useState("");
  const [recipeSource, setRecipeSource] = useState<"all" | "offline" | "ai">("all");
  const generationRef = useRef<AbortController | null>(null);
  const generationId = useRef(0);
  const [error, setError] = useState("");
  const [cookStep, setCookStep] = useState(0);
  const [cookItems, setCookItems] = useState<CookItem[]>([]);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [showIngredientLibrary, setShowIngredientLibrary] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [ingredientCategory, setIngredientCategory] = useState("All");
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState("pcs");
  const [category, setCategory] = useState("Other");
  const [expiryDate, setExpiryDate] = useState("");
  const [servings, setServings] = useState("2");
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [customUnit, setCustomUnit] = useState("");

  // Recipe-generation loading state.
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const loadingProgress = useRef(new Animated.Value(0)).current;

  async function refresh() {
    const [pantryItems, cookingHistory, shoppingItems] = await Promise.all([
      listIngredients(), getHistory(), getShoppingList()
    ]);
    setIngredients(pantryItems);
    setHistory(cookingHistory);
    setShoppingList(shoppingItems);
  }

  useEffect(() => {
    initDb().then(async () => {
      const savedPreferences = await getRecipePreferences();
      setPreferences(savedPreferences);
      await refresh();
      setReady(true);
    }).catch((e) => Alert.alert("Database error", String(e)));
  }, []);

  // Track how long recipe generation takes.
  useEffect(() => {
    if (!busy) {
      setLoadingSeconds(0);
      return;
    }

    const timer = setInterval(() => {
      setLoadingSeconds(seconds => seconds + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [busy]);

  // Animate the progress bar while Gemini is working.
  useEffect(() => {
    if (!busy) {
      loadingProgress.stopAnimation();
      loadingProgress.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(loadingProgress, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true
        }),
        Animated.timing(loadingProgress, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true
        })
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [busy, loadingProgress]);

  const loadingMessage =
    loadingSeconds < 8
      ? "Checking your pantry ingredients..."
      : loadingSeconds < 20
      ? "Finding combinations that work together..."
      : loadingSeconds < 35
      ? "Gemini is creating your recipes..."
      : loadingSeconds < 60
      ? "Checking recipe quantities and instructions..."
      : "This is taking a little longer than usual. Still working...";

  const availableIngredients = useMemo(
    () => ingredients.filter(i => i.amount > 0), [ingredients]
  );
  const outOfStockIngredients = useMemo(
    () => ingredients.filter(i => i.amount <= 0), [ingredients]
  );
  const lowItems = useMemo(
    () => ingredients.filter(i => i.amount > 0 && i.amount <= 2),
    [ingredients]
  );
  const offline = useMemo(
    () => offlineRecipes(meal, ingredients, preferences), [meal, ingredients, preferences]
  );
  const suggested = useMemo(
    () => makeSuggestions(
      [...offline, ...recipes.filter(r => r.mealType === meal)],
      ingredients, preferences, history, maxMinutes
    ), [offline, recipes, meal, ingredients, preferences, history, maxMinutes]
  );
  const visibleSuggestions = useMemo(() => suggested.filter(entry =>
    (recipeSource === "all" || entry.source === recipeSource) &&
    entry.recipe.title.toLowerCase().includes(recipeSearch.trim().toLowerCase())
  ), [suggested, recipeSource, recipeSearch]);
  const readySuggestions = visibleSuggestions.filter(r => r.missing === 0);
  const almostSuggestions = visibleSuggestions.filter(r => r.missing > 0);
  const expiringIngredients = ingredients.filter(i => i.amount > 0 &&
    daysUntilExpiry(i) !== null && daysUntilExpiry(i)! >= 0 && daysUntilExpiry(i)! <= 3)
    .sort((a,b) => (daysUntilExpiry(a) || 0) - (daysUntilExpiry(b) || 0));

  function changePreferences(next: RecipePreferences) {
    setPreferences(next);
    saveRecipePreferences(next).catch(e => Alert.alert("Couldn't save preferences", String(e)));
  }

  const filteredCatalog = useMemo(() => {
    const query = ingredientSearch.trim().toLowerCase();
    return INGREDIENT_CATALOG.filter(item =>
      (ingredientCategory === "All" || item.category === ingredientCategory) &&
      (!query || item.name.toLowerCase().includes(query))
    );
  }, [ingredientSearch, ingredientCategory]);

  function openAdd(item?: Ingredient) {
    setEditing(item ?? null);
    setName(item?.name ?? "");
    setAmount(String(item?.amount ?? 1));
    setUnit(normalizeUnit(item?.unit ?? "pcs"));
    setCategory(item?.category ?? "Other");
    setExpiryDate(item?.expiryDate ?? "");
    setShowIngredientForm(Boolean(item));
    setShowIngredientLibrary(!item);
    setIngredientSearch("");
    setIngredientCategory("All");
  }

  function chooseCatalogIngredient(item: (typeof INGREDIENT_CATALOG)[number]) {
    const existing = ingredients.find(i => i.name.trim().toLowerCase() === item.name.toLowerCase());
    setEditing(existing ?? null);
    setName(existing?.name ?? item.name);
    setAmount(String(existing?.amount ?? 1));
    setUnit(normalizeUnit(existing?.unit ?? item.unit));
    setCategory(existing?.category ?? item.category);
    setExpiryDate(existing?.expiryDate ?? "");
    setShowIngredientLibrary(false);
    setShowIngredientForm(true);
  }

  function openCustomIngredient() {
    setEditing(null);
    setName("");
    setAmount("1");
    setUnit("pcs");
    setCategory("Other");
    setExpiryDate("");
    setShowIngredientLibrary(false);
    setShowIngredientForm(true);
  }

  async function addOutOfStockToShopping(item: Ingredient) {
    try {
      await addToShoppingList(item.name, item.category, 1, item.unit);
      await refresh();
      Alert.alert("Added to shopping list", `${item.name} was added to your shopping list.`);
    } catch (e: any) {
      Alert.alert("Couldn't add item", e.message || "Please try again.");
    }
  }

  async function markPurchased(item: ShoppingListItem) {
    try {
      await markShoppingItemPurchased(item.id);
      await refresh();
      Alert.alert("Pantry updated", `${item.ingredient_name} was added to your pantry and removed from your shopping list.`);
    } catch (e: any) {
      Alert.alert("Couldn't update pantry", e.message || "Please check the item's unit.");
    }
  }

  async function submitIngredient() {
    if (!name.trim()) {
      Alert.alert("Missing ingredient name", "Enter an ingredient name first.");
      return;
    }
    if (!Number.isFinite(Number(amount)) || Number(amount) < 0) {
      Alert.alert("Invalid amount", "Enter a valid quantity of zero or greater.");
      return;
    }
    if (!unit.trim()) {
      Alert.alert("Missing unit", "Choose a unit or enter a custom one.");
      return;
    }

    const enteredExpiry = expiryDate.trim();
    const parsedExpiry = enteredExpiry ? new Date(`${enteredExpiry}T12:00:00`) : null;
    if (enteredExpiry && (!/^\d{4}-\d{2}-\d{2}$/.test(enteredExpiry) ||
      !parsedExpiry || Number.isNaN(parsedExpiry.getTime()) ||
      `${parsedExpiry.getFullYear()}-${String(parsedExpiry.getMonth() + 1).padStart(2,"0")}-${String(parsedExpiry.getDate()).padStart(2,"0")}` !== enteredExpiry)) {
      Alert.alert("Invalid best-before date", "Enter a date as YYYY-MM-DD, or leave it blank.");
      return;
    }
    try {
      await saveIngredient({
        name,
        amount: Number(amount),
        unit: normalizeUnit(unit),
        category,
        expiryDate: expiryDate.trim() || null
      }, editing?.id);

      setShowIngredientForm(false);
      await refresh();
    } catch (e: any) {
      Alert.alert("Couldn't save ingredient", e.message);
    }
  }

  function cancelGeneration() {
    generationId.current += 1;
    generationRef.current?.abort();
    generationRef.current = null;
    setBusy(false);
  }

  function pickForMe() {
    const choices = tab === "Recipes" ? visibleSuggestions : suggested;
    const ready = choices.filter(entry => entry.missing === 0);
    const pool = ready.length ? ready : choices;
    if (!pool.length) {
      Alert.alert("No matching recipes", "Try a longer cooking time or change your dietary preferences.");
      return;
    }
    // Use a small group of best fits; randomness keeps suggestions varied.
    const shortlist = pool.slice(0, Math.min(8, pool.length));
    const choice = shortlist[Math.floor(Math.random() * shortlist.length)];
    setTab("Recipes");
    openRecipe(choice.recipe);
    if (!ready.length) {
      Alert.alert("Closest recipe", "No recipe can be made entirely from your current pantry. Here's an idea with a few missing ingredients.");
    }
  }

  function confirmUndoHistory(id: number, title: string) {
    Alert.alert("Undo this meal?", `Restore the ingredients used for ${title} and remove its history entry?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Undo meal", style: "destructive", onPress: async () => {
        try {
          const ok = await undoCook(id);
          await refresh();
          if (ok) setHistoryDetail(null);
          Alert.alert(ok ? "Meal undone" : "Entry not found", ok ? "Ingredients restored where the pantry item still exists." : "This entry no longer exists.");
        } catch (e: any) { Alert.alert("Couldn't undo meal", e.message || String(e)); }
      } }
    ]);
  }

  async function makeRecipes() {
    if (availableIngredients.length === 0) {
      setError("Add some ingredients with a quantity greater than zero before generating recipes.");
      return;
    }
    const controller = new AbortController();
    const id = ++generationId.current;
    generationRef.current = controller;
    setBusy(true);
    setError("");
    setSelected(null);

    try {
      const results = await generateRecipes(availableIngredients, meal, 4, {
        signal: controller.signal,
        maxMinutes,
        diet: preferences.diet,
        avoid: preferences.avoid,
        assumeStaples: preferences.assumeStaples
      });
      if (generationId.current !== id || controller.signal.aborted) return;
      setRecipes(results);
      setTab("Recipes");
      if (!results.length) setError("No recipes fit your chosen time. Try Any time or add more ingredients.");
    } catch (e: any) {
      if (generationId.current === id && !controller.signal.aborted) {
        setError(e.message || "Recipe generation failed.");
      }
    } finally {
      if (generationId.current === id) {
        generationRef.current = null;
        setBusy(false);
      }
    }
  }

  function openRecipe(recipe: Recipe) {
    setPreview(recipe);
    setPreviewServings(Math.max(1, Math.min(12, preferences.defaultServings)));
  }

  // Keep the original AI recipe intact; scale a copy so cooking history
  // stores the exact ingredient amounts for the selected serving count.
  function scaledRecipe(recipe: Recipe, count: number): Recipe {
    return scaleRecipe(recipe, count);
  }

  function recipeAvailability(recipe: Recipe) {
    return recipeAvailabilityFor(recipe, ingredients, preferences);
  }

  async function addMissingToShopping(recipe: Recipe) {
    const missing = recipeAvailability(recipe).filter(x => !x.item.optional && !x.enough);
    try {
      for (const x of missing) {
        const difference = x.neededInPantryUnit === null
          ? Number(x.item.amount)
          : Math.max(0, x.neededInPantryUnit - x.available);
        const usePantryUnit = x.neededInPantryUnit !== null && x.pantryItem;
        await addToShoppingList(
          x.item.name,
          x.pantryItem?.category || "Other",
          Math.max(0.0001, difference),
          usePantryUnit ? x.pantryItem!.unit : x.item.unit
        );
      }
      await refresh();
      Alert.alert("Shopping list updated", `${missing.length} missing ingredient${missing.length === 1 ? "" : "s"} added.`);
    } catch (e: any) {
      Alert.alert("Couldn't update shopping list", e.message || "Please try again.");
    }
  }

  function beginCooking(recipe: Recipe): boolean {
    const availability = recipeAvailability(recipe);
    const missing = availability.filter(x => !x.item.optional && !x.enough);
    if (missing.length) {
      Alert.alert(
        "Ingredients needed",
        `Check your pantry before cooking: ${missing.map(x => x.item.name).join(", ")}. You can add missing ingredients to your shopping list.`
      );
      return false;
    }
    const cookingItems: CookItem[] = availability
      .filter(x => x.enough && !x.assumed && !!x.pantryItem)
      .map(x => ({
        ingredientId: x.pantryItem!.id,
        name: x.pantryItem!.name,
        unit: x.pantryItem!.unit,
        plannedAmount: x.neededInPantryUnit!,
        actualAmount: x.neededInPantryUnit!,
        usedSuggested: true
      }));
    if (!cookingItems.length) {
      Alert.alert("No matching pantry ingredients", "Check that your recipe uses the same ingredient names and compatible units as your pantry.");
      return false;
    }
    const duplicateIds = new Set(cookingItems.map(i => i.ingredientId));
    if (duplicateIds.size !== cookingItems.length) {
      Alert.alert("Duplicate ingredients", "This recipe lists a pantry ingredient more than once. Please generate another recipe before cooking.");
      return false;
    }
    setCookItems(cookingItems);
    setCookStep(0);
    setSelected(recipe);
    setPreview(null);
    return true;
  }

  function openHistoryRecipe(entry: any) {
    if (!entry.recipe_json) {
      Alert.alert(
        "Recipe unavailable",
        "This cooking record was saved before recipe details were stored. New cooking sessions will include the full recipe."
      );
      return;
    }

    try {
      const recipe = JSON.parse(entry.recipe_json) as Recipe;

      if (
        !recipe ||
        !Array.isArray(recipe.ingredients) ||
        !Array.isArray(recipe.steps)
      ) {
        throw new Error("The saved recipe is incomplete.");
      }

      setHistoryDetail(recipe);
      setTab("History");
    } catch {
      Alert.alert(
        "Couldn't open recipe",
        "The saved recipe details could not be read."
      );
    }
  }

  function chooseSuggestedAmount(index: number, useSuggested: boolean) {
    setCookItems(old => old.map((item, i) => i === index
      ? {
          ...item,
          usedSuggested: useSuggested,
          actualAmount: useSuggested ? item.plannedAmount : 0
        }
      : item
    ));
  }

  function updateActual(index: number, value: string) {
    // Keep an empty field as zero while the user edits; validation runs on confirm.
    const parsed = value.trim() === "" ? -1 : Number(value);
    setCookItems(old => old.map((item, i) => i === index
      ? {
          ...item,
          actualAmount: Number.isFinite(parsed) && parsed >= 0 ? parsed : -1
        }
      : item
    ));
  }

  async function finishCooking() {
    if (!selected) return;

    for (const item of cookItems) {
      const pantryItem = ingredients.find(i => i.id === item.ingredientId);
      if (!Number.isFinite(item.actualAmount) || item.actualAmount < 0) {
        Alert.alert("Invalid quantity", `Enter a valid amount used for ${item.name}.`);
        return;
      }
      if (!pantryItem) {
        Alert.alert("Ingredient missing", `${item.name} is no longer in your pantry. Please refresh and try again.`);
        return;
      }
      if (item.actualAmount > pantryItem.amount + 0.000001) {
        Alert.alert(
          "Not enough in pantry",
          `You entered ${item.actualAmount} ${item.unit} for ${item.name}, but your pantry only has ${pantryItem.amount} ${item.unit}. Please correct the amount.`
        );
        return;
      }
    }

    try {
      await confirmCook(selected, cookItems);
      setSelected(null);
      setHistoryDetail(null);
      setCookItems([]);
      setCookStep(0);
      setTab("Home");
      await refresh();

      Alert.alert(
        "Pantry updated",
        "Your pantry has been deducted by the quantities you confirmed."
      );
    } catch (e: any) {
      Alert.alert("Could not update pantry", e.message || "Please try again.");
    }
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={GREEN} />
        <Text style={styles.muted}>Preparing your pantry…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.brandMark}>♧</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>Pantry-to-Plate</Text>
          <Text style={styles.tagline}>
            Make something delicious with what you have.
          </Text>
        </View>
      </View>

      {selected ? (
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={() => setSelected(null)}>
            <Text style={styles.back}>{historyDetail ? "‹ Back to history" : "‹ Back to recipes"}</Text>
          </TouchableOpacity>

          <Text style={styles.eyebrow}>COOKING MODE</Text>
          <Text style={styles.h1}>{selected.title}</Text>
          <Text style={styles.muted}>Cooking {selected.servings} serving{selected.servings === 1 ? "" : "s"}</Text>
          {cookStep < selected.steps.length && (
            <TouchableOpacity style={styles.secondaryButton} onPress={() => {
              Alert.alert("Ingredients for this recipe", selected.ingredients
                .map(x => `${showAmount(Number(x.amount))} ${x.unit} ${x.name}${x.optional ? " (optional)" : ""}`)
                .join("\n"));
            }}>
              <Text style={styles.secondaryText}>View ingredients</Text>
            </TouchableOpacity>
          )}
          {cookStep < selected.steps.length ? (
            <>
              <Text style={styles.muted}>
                Step {cookStep + 1} of {selected.steps.length}
              </Text>

              <View style={styles.stepCard}>
                <Text style={styles.stepText}>
                  {selected.steps[cookStep]}
                </Text>
              </View>

              <View style={styles.rowBetween}>
                <TouchableOpacity
                  style={[
                    styles.secondaryButton,
                    cookStep === 0 && styles.disabled
                  ]}
                  disabled={cookStep === 0}
                  onPress={() => setCookStep(s => s - 1)}
                >
                  <Text style={styles.secondaryText}>Previous</Text>
                </TouchableOpacity>

                {cookStep < selected.steps.length - 1 ? (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => setCookStep(s => s + 1)}
                  >
                    <Text style={styles.primaryText}>Next step →</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => setCookStep(selected.steps.length)}
                  >
                    <Text style={styles.primaryText}>Finished cooking</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <View style={styles.infoCard}>
              <Text style={styles.h2}>Cooking steps completed</Text>
              <Text style={styles.muted}>Now confirm how much of each pantry ingredient you actually used.</Text>
            </View>
          )}

          {cookStep >= selected.steps.length && (
            <>
              <Text style={styles.h2}>
                Confirm your ingredient usage
              </Text>
              <Text style={styles.muted}>
                For each ingredient, confirm whether you used the suggested amount. If not, enter the quantity you actually used.
              </Text>

              {cookItems.map((item, i) => (
                <View key={item.ingredientId} style={styles.usageCard}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.muted}>
                    Suggested: {item.plannedAmount} {item.unit}
                  </Text>

                  <View style={styles.choiceRow}>
                    <TouchableOpacity
                      style={[styles.choiceButton, item.usedSuggested && styles.choiceSelected]}
                      onPress={() => chooseSuggestedAmount(i, true)}
                    >
                      <Text style={[styles.choiceText, item.usedSuggested && styles.choiceTextSelected]}>
                        Yes, exact amount
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.choiceButton, !item.usedSuggested && styles.choiceSelected]}
                      onPress={() => chooseSuggestedAmount(i, false)}
                    >
                      <Text style={[styles.choiceText, !item.usedSuggested && styles.choiceTextSelected]}>
                        No, different amount
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {item.usedSuggested ? (
                    <Text style={styles.confirmedAmount}>
                      Will deduct {item.plannedAmount} {item.unit}
                    </Text>
                  ) : (
                    <View style={styles.actualAmountRow}>
                      <Text style={styles.label}>Actual amount used</Text>
                      <TextInput
                        style={styles.smallInput}
                        keyboardType="decimal-pad"
                        value={item.actualAmount < 0 ? "" : String(item.actualAmount)}
                        onChangeText={v => updateActual(i, v)}
                        placeholder="0"
                      />
                      <Text style={styles.muted}>{item.unit}</Text>
                    </View>
                  )}
                </View>
              ))}

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={finishCooking}
              >
                <Text style={styles.primaryText}>
                  Confirm & update pantry
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      ) : preview ? (
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={() => setPreview(null)}>
            <Text style={styles.back}>‹ Back to {historyDetail ? "saved recipe" : "recipes"}</Text>
          </TouchableOpacity>
          <Text style={styles.eyebrow}>RECIPE PREVIEW</Text>
          <Text style={styles.h1}>{preview.title}</Text>
          <Text style={styles.muted}>
            {preview.mealType} · {preview.prepMinutes} min prep · {preview.cookMinutes} min cook
          </Text>
          {!!preview.description && <Text style={styles.body}>{preview.description}</Text>}

          <View style={styles.previewServingsCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.h2}>Servings</Text>
              <Text style={styles.muted}>Ingredient amounts update automatically.</Text>
            </View>
            <View style={styles.previewStepper}>
              <TouchableOpacity
                style={styles.previewStepButton}
                disabled={previewServings <= 1}
                onPress={() => setPreviewServings(n => Math.max(1, n - 1))}
              >
                <Text style={styles.previewStepText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.previewStepValue}>{previewServings}</Text>
              <TouchableOpacity
                style={styles.previewStepButton}
                disabled={previewServings >= 12}
                onPress={() => setPreviewServings(n => Math.min(12, n + 1))}
              >
                <Text style={styles.previewStepText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.h2}>Ingredients required</Text>
          {recipeAvailability(scaledRecipe(preview, previewServings)).map((entry, i) => (
            <View key={`${entry.item.name}-${i}`} style={styles.previewIngredientRow}>
              <Text style={styles.previewIngredientMark}>
                {entry.enough ? "✓" : entry.item.optional ? "○" : "!"}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>
                  {showAmount(Number(entry.item.amount))} {entry.item.unit} {entry.item.name}
                  {entry.item.optional ? " (optional)" : ""}
                </Text>
                <Text style={[styles.muted, !entry.enough && !entry.item.optional && styles.previewShortage]}>
                  {entry.assumed
                    ? "Assumed staple · not deducted from pantry"
                    : entry.expired
                    ? "Past entered best-before date · check your pantry"
                    : entry.enough
                    ? `In pantry: ${showAmount(entry.available)} ${entry.pantryItem!.unit}${entry.expiringSoon ? " · use soon" : ""}`
                    : entry.incompatible
                    ? `Pantry unit is ${entry.pantryItem!.unit}; quantity needs checking`
                    : entry.item.optional
                    ? "Optional · not currently available"
                    : entry.pantryItem
                    ? `Short by ${showAmount(Math.max(0, entry.neededInPantryUnit! - entry.available))} ${entry.pantryItem.unit}`
                    : "Not in pantry"}
                </Text>
              </View>
            </View>
          ))}

          {recipeAvailability(scaledRecipe(preview, previewServings)).some(x => !x.item.optional && !x.enough) ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => addMissingToShopping(scaledRecipe(preview, previewServings))}
            >
              <Text style={styles.secondaryText}>＋ Add missing ingredients to shopping list</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.previewReady}>✓ You have the required ingredients.</Text>
          )}

          <Text style={styles.h2}>Cooking instructions</Text>
          {preview.steps.map((step, i) => (
            <View key={`preview-step-${i}`} style={styles.historyStepRow}>
              <Text style={styles.historyStepNumber}>{i + 1}</Text>
              <Text style={[styles.body, { flex: 1 }]}>{step}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => beginCooking(scaledRecipe(preview, previewServings))}
          >
            <Text style={styles.primaryText}>Start cooking · {previewServings} servings →</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : historyDetail ? (
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={() => setHistoryDetail(null)}>
            <Text style={styles.back}>‹ Back to cooking history</Text>
          </TouchableOpacity>

          <Text style={styles.eyebrow}>SAVED RECIPE</Text>
          <Text style={styles.h1}>{historyDetail.title}</Text>
          <Text style={styles.muted}>
            {historyDetail.mealType} · {historyDetail.prepMinutes} min prep · {historyDetail.cookMinutes} min cooking · {historyDetail.servings} servings
          </Text>

          {historyDetail.description ? (
            <Text style={styles.body}>{historyDetail.description}</Text>
          ) : null}

          <View style={styles.infoCard}>
            <Text style={styles.h2}>Ingredients</Text>
            {historyDetail.ingredients.map((item: any, index: number) => (
              <View key={`${item.name}-${index}`} style={styles.historyRecipeRow}>
                <Text style={styles.body}>
                  • {item.name} — {item.amount} {item.unit}
                  {item.optional ? " (optional)" : ""}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.h2}>Instructions</Text>
          {historyDetail.steps.map((step: string, index: number) => (
            <View key={`history-step-${index}`} style={styles.historyStepRow}>
              <Text style={styles.historyStepNumber}>{index + 1}</Text>
              <Text style={[styles.body, { flex: 1 }]}>{step}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => openRecipe(historyDetail)}
          >
            <Text style={styles.primaryText}>Cook this recipe again</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : showIngredientLibrary ? (
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={() => setShowIngredientLibrary(false)}>
            <Text style={styles.back}>‹ Back to pantry</Text>
          </TouchableOpacity>
          <Text style={styles.h1}>Ingredient library</Text>
          <Text style={styles.muted}>Choose a common ingredient, or add something custom.</Text>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              value={ingredientSearch}
              onChangeText={setIngredientSearch}
              placeholder="Search ingredients..."
              placeholderTextColor="#89938C"
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroller}>
            {INGREDIENT_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setIngredientCategory(cat)}
                style={[styles.categoryChip, ingredientCategory === cat && styles.categoryChipSelected]}
              >
                <Text style={[styles.categoryChipText, ingredientCategory === cat && styles.categoryChipTextSelected]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.catalogGrid}>
            {filteredCatalog.map(item => {
              const existing = ingredients.find(i => i.name.trim().toLowerCase() === item.name.toLowerCase());
              return (
                <TouchableOpacity key={item.name} style={styles.catalogCard} onPress={() => chooseCatalogIngredient(item)}>
                  <View style={styles.catalogImageWrap}>
                    <Text style={styles.catalogEmoji}>{item.emoji}</Text>
                    <Image source={{ uri: item.imageUrl }} style={styles.catalogImage} resizeMode="cover" />
                  </View>
                  <Text style={styles.catalogName}>{item.name}</Text>
                  <Text style={styles.catalogCategory}>{existing ? `In pantry · ${existing.amount} ${existing.unit}` : item.category}</Text>
                  {existing ? <Text style={styles.catalogUpdate}>Update quantity →</Text> : <Text style={styles.catalogAdd}>＋ Add</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
          {filteredCatalog.length === 0 && <Text style={styles.empty}>No matching ingredients. Try another search or add a custom ingredient.</Text>}
          <TouchableOpacity style={styles.secondaryButton} onPress={openCustomIngredient}>
            <Text style={styles.secondaryText}>＋ Add a custom ingredient</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : showIngredientForm ? (
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={() => {
            setShowIngredientForm(false);
            if (!editing) setShowIngredientLibrary(true);
          }}>
            <Text style={styles.back}>‹ Back to {editing ? "pantry" : "ingredient library"}</Text>
          </TouchableOpacity>

          <Text style={styles.h1}>
            {editing ? "Update ingredient" : "Add custom ingredient"}
          </Text>

          <Text style={styles.label}>Ingredient name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Tomatoes"
          />

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="Amount"
          />

          <Text style={styles.label}>Unit</Text>
          <TouchableOpacity
            style={styles.unitSelect}
            onPress={() => {
              setCustomUnit("");
              setShowUnitPicker(true);
            }}
          >
            <Text style={styles.unitSelectText}>{unit || "Choose a unit"}</Text>
            <Text style={styles.unitSelectArrow}>⌄</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Best-before date (optional)</Text>
          <TextInput
            style={styles.input}
            value={expiryDate}
            onChangeText={setExpiryDate}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Produce, Dairy, Grains…"
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={submitIngredient}
          >
            <Text style={styles.primaryText}>Save ingredient</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            {tab === "Home" && (
              <>
                <Text style={styles.eyebrow}>
                  YOUR KITCHEN, MADE EASIER
                </Text>
                <Text style={styles.h1}>
                  What should you cook today?
                </Text>
                <Text style={styles.muted}>
                  Choose a meal and we'll find recipes from your pantry.
                </Text>

                <View style={styles.mealRow}>
                  {(["breakfast", "lunch", "dinner"] as MealType[]).map(m => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setMeal(m)}
                      style={[
                        styles.mealChip,
                        meal === m && styles.mealSelected
                      ]}
                    >
                      <Text
                        style={[
                          styles.mealText,
                          meal === m && styles.mealTextSelected
                        ]}
                      >
                        {m === "breakfast"
                          ? "☀ "
                          : m === "lunch"
                          ? "☕ "
                          : "☾ "}
                        {m[0].toUpperCase() + m.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.label, { marginTop: 16 }]}>Time available</Text>
                <View style={[styles.mealRow, { flexWrap: "wrap" }]}>
                  {([0, 15, 30, 45] as number[]).map(t => (
                    <TouchableOpacity key={t} onPress={() => setMaxMinutes(t)}
                      style={[styles.mealChip, maxMinutes === t && styles.mealSelected]}>
                      <Text style={[styles.mealText, maxMinutes === t && styles.mealTextSelected]}>
                        {t === 0 ? "Any time" : `Under ${t} min`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowPreferences(!showPreferences)}>
                  <Text style={styles.secondaryText}>⚙ Dietary preferences & serving size {showPreferences ? "⌃" : "⌄"}</Text>
                </TouchableOpacity>
                {showPreferences && (
                  <View style={styles.preferenceCard}>
                    <Text style={styles.label}>Dietary preference</Text>
                    <View style={styles.preferenceChips}>
                      {(["none", "vegetarian", "vegan", "pescatarian", "glutenfree", "dairyfree"] as Diet[]).map(d => (
                        <TouchableOpacity key={d} style={[styles.preferenceChip, preferences.diet === d && styles.mealSelected]}
                          onPress={() => changePreferences({ ...preferences, diet: d })}>
                          <Text style={styles.mealText}>{({ none: "No restriction", vegetarian: "Vegetarian", vegan: "Vegan",
                            pescatarian: "Pescatarian", glutenfree: "Gluten-free", dairyfree: "Dairy-free" } as Record<Diet, string>)[d]}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={styles.label}>Exclude ingredients (comma separated)</Text>
                    <TextInput style={styles.input} value={preferences.avoid}
                      placeholder="e.g. mushrooms, peanuts" onChangeText={v => setPreferences(old => ({ ...old, avoid: v }))}
                      onEndEditing={() => saveRecipePreferences(preferences).catch(e => Alert.alert("Couldn't save preferences", String(e)))} />
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => {
                      saveRecipePreferences(preferences).then(() => Alert.alert("Saved", "Ingredient exclusions saved."))
                        .catch(e => Alert.alert("Couldn't save preferences", String(e)));
                    }}>
                      <Text style={styles.secondaryText}>Save excluded ingredients</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.preferenceToggle} onPress={() => changePreferences({ ...preferences, assumeStaples: !preferences.assumeStaples })}>
                      <Text style={styles.body}>{preferences.assumeStaples ? "☑" : "☐"} Assume salt, pepper and oil</Text>
                    </TouchableOpacity>
                    <View style={styles.rowBetween}>
                      <Text style={styles.body}>Default servings: {preferences.defaultServings}</Text>
                      <View style={styles.preferenceStepper}>
                        <TouchableOpacity onPress={() => changePreferences({ ...preferences, defaultServings: Math.max(1, preferences.defaultServings - 1) })}>
                          <Text style={styles.previewStepText}>−</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => changePreferences({ ...preferences, defaultServings: Math.min(12, preferences.defaultServings + 1) })}>
                          <Text style={styles.previewStepText}>＋</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.muted}>Dietary checks are ingredient-based; check labels for allergies and cross-contact.</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.secondaryButton} onPress={() => {
                  setTab("Recipes"); setRecipeSource("all");
                }}>
                  <Text style={styles.secondaryText}>📖 Browse {offline.length} offline {meal} recipes →</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={makeRecipes}
                  disabled={busy || availableIngredients.length === 0}
                >
                  {busy ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryText}>
                      ✦  Generate more with Gemini
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={pickForMe}>
                  <Text style={styles.secondaryText}>🎲  Pick for me</Text>
                </TouchableOpacity>

                {error ? (
                  <Text style={styles.error}>{error}</Text>
                ) : availableIngredients.length === 0 ? (
                  <Text style={styles.muted}>Add ingredients with available quantities to generate recipes.</Text>
                ) : null}

                <View style={styles.infoCard}>
                  <Text style={styles.h2}>Your pantry</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statCell}>
                      <Text style={styles.bigNumber}>{availableIngredients.length}</Text>
                      <Text style={styles.muted}>Available</Text>
                    </View>
                    <View style={styles.statCell}>
                      <Text style={[styles.bigNumber, outOfStockIngredients.length > 0 && styles.outOfStockText]}>{outOfStockIngredients.length}</Text>
                      <Text style={styles.muted}>Out of stock</Text>
                    </View>
                    <View style={styles.statCell}>
                      <Text style={styles.bigNumber}>{ingredients.length}</Text>
                      <Text style={styles.muted}>Tracked</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setTab("Pantry")}>
                    <Text style={styles.link}>Manage ingredients →</Text>
                  </TouchableOpacity>
                  {outOfStockIngredients.length > 0 && (
                    <TouchableOpacity onPress={() => setTab("Pantry")}>
                      <Text style={styles.outOfStockLink}>View {outOfStockIngredients.length} out-of-stock item(s) →</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {expiringIngredients.length > 0 && (
                  <View style={styles.warningCard}>
                    <Text style={styles.h2}>Use these up soon</Text>
                    <Text style={styles.body}>
                      {expiringIngredients.slice(0, 5).map(i =>
                        `${i.name} (${daysUntilExpiry(i) === 0 ? "today" : `${daysUntilExpiry(i)}d left`})`
                      ).join(" · ")}
                    </Text>
                    <TouchableOpacity onPress={() => setTab("Recipes")}>
                      <Text style={styles.link}>See recipes that use them →</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {lowItems.length > 0 && (
                  <View style={styles.warningCard}>
                    <Text style={styles.h2}>Running low</Text>
                    <Text style={styles.body}>
                      {lowItems.map(i =>
                        `${i.name} (${i.amount} ${i.unit})`
                      ).join(" · ")}
                    </Text>
                  </View>
                )}

                <Text style={styles.h2}>Recently cooked</Text>
                {history.slice(0, 3).map(h => (
                  <TouchableOpacity key={h.id} onPress={() => openHistoryRecipe(h)}>
                    <Text style={styles.historyLine}>
                      🍽  {h.recipe_title}  →
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {tab === "Pantry" && (
              <>
                <Text style={styles.h1}>My Pantry</Text>
                <Text style={styles.muted}>Your available and out-of-stock ingredients.</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => openAdd()}>
                  <Text style={styles.primaryText}>＋ Browse ingredient library</Text>
                </TouchableOpacity>

                <View style={styles.pantrySummary}>
                  <Text style={styles.pantrySummaryText}>{availableIngredients.length} available · {outOfStockIngredients.length} out of stock · {ingredients.length} tracked</Text>
                </View>

                <Text style={styles.h2}>Available ingredients</Text>
                {availableIngredients.length === 0 ? (
                  <Text style={styles.empty}>No ingredients currently in stock.</Text>
                ) : availableIngredients.map(item => {
                  const catalogItem = INGREDIENT_CATALOG.find(c => c.name.toLowerCase() === item.name.toLowerCase());
                  return (
                    <View key={item.id} style={styles.ingredientRow}>
                      <View style={styles.pantryThumb}>
                        <Text style={styles.pantryEmoji}>{catalogItem?.emoji ?? "🥬"}</Text>
                        {catalogItem ? <Image source={{ uri: catalogItem.imageUrl }} style={styles.pantryImage} resizeMode="cover" /> : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.muted}>{item.category}{item.expiryDate ? ` · Best before ${item.expiryDate}` : ""}</Text>
                      </View>
                      <Text style={styles.amountText}>{item.amount} {item.unit}</Text>
                      <TouchableOpacity onPress={() => openAdd(item)} style={styles.iconButton}><Text>✎</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => Alert.alert("Delete ingredient?", `Remove ${item.name} from your pantry?`, [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", style: "destructive", onPress: async () => { await deleteIngredient(item.id); await refresh(); } }
                      ])} style={styles.iconButton}><Text>×</Text></TouchableOpacity>
                    </View>
                  );
                })}

                <View style={styles.outOfStockHeading}>
                  <Text style={styles.outOfStockTitle}>Completely out of stock</Text>
                  <Text style={styles.outOfStockCount}>{outOfStockIngredients.length}</Text>
                </View>
                {outOfStockIngredients.length === 0 ? (
                  <Text style={styles.muted}>Nothing is completely out right now.</Text>
                ) : outOfStockIngredients.map(item => {
                  const catalogItem = INGREDIENT_CATALOG.find(c => c.name.toLowerCase() === item.name.toLowerCase());
                  const alreadyOnList = shoppingList.some(s => s.ingredient_name.toLowerCase() === item.name.toLowerCase());
                  return (
                    <View key={item.id} style={styles.outOfStockRow}>
                      <View style={styles.pantryThumb}>
                        <Text style={styles.pantryEmoji}>{catalogItem?.emoji ?? "🥬"}</Text>
                        {catalogItem ? <Image source={{ uri: catalogItem.imageUrl }} style={styles.pantryImage} resizeMode="cover" /> : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.outOfStockSubtext}>Completely out · {item.category}</Text>
                      </View>
                      <Text style={styles.outOfStockQuantity}>0 {item.unit}</Text>
                      <TouchableOpacity style={[styles.shoppingAddButton, alreadyOnList && styles.shoppingAddedButton]} onPress={() => addOutOfStockToShopping(item)} disabled={alreadyOnList}>
                        <Text style={[styles.shoppingAddText, alreadyOnList && styles.shoppingAddedText]}>{alreadyOnList ? "Added" : "+ List"}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => openAdd(item)} style={styles.iconButton}><Text>✎</Text></TouchableOpacity>
                    </View>
                  );
                })}
              </>
            )}

            {tab === "Recipes" && (
              <>
                <Text style={styles.h1}>Find something to cook</Text>
                <Text style={styles.muted}>Offline recipes are available immediately. Gemini ideas appear here when generated.</Text>

                <View style={styles.mealRow}>
                  {(["breakfast", "lunch", "dinner"] as MealType[]).map(m => (
                    <TouchableOpacity key={m} style={[styles.mealChip, meal === m && styles.mealSelected]} onPress={() => setMeal(m)}>
                      <Text style={[styles.mealText, meal === m && styles.mealTextSelected]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={[styles.mealRow, { flexWrap: "wrap", marginVertical: 4 }]}>
                  {[0,15,30,45].map(t => (
                    <TouchableOpacity key={t} style={[styles.mealChip, maxMinutes === t && styles.mealSelected]} onPress={() => setMaxMinutes(t)}>
                      <Text style={styles.mealText}>{t === 0 ? "Any time" : `≤ ${t} min`}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.searchBox}>
                  <Text style={styles.searchIcon}>⌕</Text>
                  <TextInput style={styles.searchInput} value={recipeSearch} onChangeText={setRecipeSearch}
                    placeholder="Search recipes..." placeholderTextColor="#89938C" />
                </View>
                <View style={styles.preferenceChips}>
                  {(["all", "offline", "ai"] as const).map(src => (
                    <TouchableOpacity key={src} style={[styles.preferenceChip, recipeSource === src && styles.mealSelected]}
                      onPress={() => setRecipeSource(src)}>
                      <Text style={styles.mealText}>{src === "all" ? "All" : src === "offline" ? "📖 Offline" : "✦ Gemini"}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.secondaryButton} onPress={pickForMe}>
                  <Text style={styles.secondaryText}>🎲 Pick for me from available recipes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={makeRecipes} disabled={busy || !availableIngredients.length}>
                  <Text style={styles.secondaryText}>✦ Generate new Gemini recipes</Text>
                </TouchableOpacity>
                <Text style={styles.muted}>Using your dietary preferences and pantry amounts · {readySuggestions.length} ready · {almostSuggestions.length} missing items</Text>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                {visibleSuggestions.length === 0 ? (
                  <Text style={styles.empty}>No matches. Try a different meal, time, search, or dietary setting.</Text>
                ) : null}

                {readySuggestions.length > 0 && <Text style={styles.h2}>✓ Ready to cook ({readySuggestions.length})</Text>}
                {readySuggestions.map((entry, i) => (
                  <TouchableOpacity key={`ready-${entry.source}-${entry.recipe.title}-${i}`} style={styles.recipeCard} onPress={() => openRecipe(entry.recipe)}>
                    <View style={styles.recipeEmoji}><Text style={{ fontSize: 29 }}>🍽</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recipeTitle}>{entry.recipe.title}</Text>
                      <Text style={styles.muted}>{entry.recipe.prepMinutes + entry.recipe.cookMinutes} min · {entry.source === "offline" ? "📖 Offline" : "✦ Gemini"} · {entry.recipe.servings} base servings</Text>
                      {entry.soonCount > 0 ? <Text style={styles.useSoonTag}>Uses {entry.soonCount} ingredient{entry.soonCount === 1 ? "" : "s"} expiring soon</Text> : null}
                      <Text style={styles.link}>View ingredients & steps →</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {almostSuggestions.length > 0 && <Text style={styles.h2}>🛒 Missing ingredients ({almostSuggestions.length})</Text>}
                {almostSuggestions.map((entry, i) => (
                  <TouchableOpacity key={`missing-${entry.source}-${entry.recipe.title}-${i}`} style={styles.recipeCard} onPress={() => openRecipe(entry.recipe)}>
                    <View style={styles.recipeEmoji}><Text style={{ fontSize: 29 }}>🥣</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recipeTitle}>{entry.recipe.title}</Text>
                      <Text style={styles.muted}>{entry.recipe.prepMinutes + entry.recipe.cookMinutes} min · {entry.source === "offline" ? "📖 Offline" : "✦ Gemini"}</Text>
                      <Text style={styles.shortageTag}>Missing {entry.missing} required ingredient{entry.missing === 1 ? "" : "s"}</Text>
                      <Text style={styles.link}>See what's missing →</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {tab === "Shopping" && (
              <>
                <Text style={styles.h1}>Shopping list</Text>
                <Text style={styles.muted}>Items to restock. Mark an item purchased to add its quantity back into your pantry.</Text>
                {shoppingList.length === 0 ? (
                  <View style={styles.shoppingEmptyCard}>
                    <Text style={styles.shoppingEmptyEmoji}>🛒</Text>
                    <Text style={styles.itemName}>Your shopping list is empty</Text>
                    <Text style={styles.muted}>Add out-of-stock ingredients from your Pantry.</Text>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => setTab("Pantry")}><Text style={styles.primaryText}>Go to pantry</Text></TouchableOpacity>
                  </View>
                ) : shoppingList.map(item => (
                  <View key={item.id} style={styles.shoppingRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.ingredient_name}</Text>
                      <Text style={styles.muted}>{item.category} · {item.quantity} {item.unit}</Text>
                    </View>
                    <TouchableOpacity style={styles.purchasedButton} onPress={() => markPurchased(item)}>
                      <Text style={styles.purchasedButtonText}>✓ Bought</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert("Remove item?", `Remove ${item.ingredient_name} from your shopping list?`, [
                      { text: "Cancel", style: "cancel" },
                      { text: "Remove", style: "destructive", onPress: async () => { await removeShoppingListItem(item.id); await refresh(); } }
                    ])}><Text>×</Text></TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            {tab === "History" && (
              <>
                <Text style={styles.h1}>Cooking history</Text>

                {history.length === 0 && (
                  <Text style={styles.empty}>
                    Meals you cook will appear here.
                  </Text>
                )}

                {history.map(h => (
                  <View key={h.id} style={styles.historyCard}>
                    <TouchableOpacity onPress={() => openHistoryRecipe(h)} activeOpacity={0.75}>
                    <Text style={styles.itemName}>{h.recipe_title}</Text>
                    <Text style={styles.muted}>
                      {h.meal_type} · {new Date(h.cooked_at).toLocaleDateString()} · {h.servings} servings
                    </Text>
                    <Text style={styles.link}>
                      {h.recipe_json ? "View recipe and instructions →" : "Recipe details unavailable →"}
                    </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.secondaryButton, { marginTop: 10 }]}
                      onPress={() => confirmUndoHistory(h.id, h.recipe_title)}>
                      <Text style={styles.secondaryText}>↶ Undo this meal</Text>
                    </TouchableOpacity>
                  </View>
                ))}

              </>
            )}
          </ScrollView>

          <View style={styles.tabBar}>
            {(["Home", "Pantry", "Recipes", "Shopping", "History"] as Tab[]).map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                style={styles.tabItem}
              >
                <Text
                  style={[
                    styles.tabIcon,
                    tab === t && styles.activeTab
                  ]}
                >
                  {({ Home: "⌂", Pantry: "▤", Recipes: "♧", Shopping: "🛒", History: "◷" } as any)[t]}
                </Text>
                <Text
                  style={[
                    styles.tabLabel,
                    tab === t && styles.activeTab
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Unit picker: common units plus a custom option. */}
      <Modal
        visible={showUnitPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUnitPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.unitModalCard}>
            <View style={styles.modalHeadingRow}>
              <Text style={styles.loadingTitle}>Choose a unit</Text>
              <TouchableOpacity onPress={() => setShowUnitPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.unitOptionsScroll}>
              {UNIT_GROUPS.map(group => (
                <View key={group.title}>
                  <Text style={styles.unitGroupTitle}>{group.title}</Text>
                  <View style={styles.unitOptionsRow}>
                    {group.units.map(option => (
                      <TouchableOpacity
                        key={option}
                        style={[styles.unitOption, unit === option && styles.unitOptionSelected]}
                        onPress={() => {
                          setUnit(option);
                          setShowUnitPicker(false);
                        }}
                      >
                        <Text style={[styles.unitOptionText, unit === option && styles.unitOptionTextSelected]}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
              <Text style={styles.unitGroupTitle}>Custom unit</Text>
              <TextInput
                style={styles.input}
                value={customUnit}
                onChangeText={setCustomUnit}
                placeholder="e.g. handful, pinch, stalk"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.primaryButton, !customUnit.trim() && styles.disabled]}
                disabled={!customUnit.trim()}
                onPress={() => {
                  setUnit(customUnit.trim());
                  setShowUnitPicker(false);
                }}
              >
                <Text style={styles.primaryText}>Use custom unit</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Full-screen recipe-generation loading overlay */}
      <Modal
        visible={busy}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={cancelGeneration}
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <Text style={styles.loadingEmoji}>🍳</Text>

            <Text style={styles.loadingTitle}>
              Preparing your recipes
            </Text>

            <Text style={styles.loadingMessage}>
              {loadingMessage}
            </Text>

            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressSegment,
                  {
                    transform: [{
                      translateX: loadingProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-90, 300]
                      })
                    }]
                  }
                ]}
              />
            </View>

            <Text style={styles.loadingTimer}>
              Generating for {Math.floor(loadingSeconds / 60)}:
              {String(loadingSeconds % 60).padStart(2, "0")}
            </Text>

            <TouchableOpacity style={[styles.secondaryButton, { marginTop: 18, alignSelf: "stretch" }]}
              onPress={cancelGeneration}>
              <Text style={styles.secondaryText}>Cancel generation</Text>
            </TouchableOpacity>

            {loadingSeconds >= 60 && (
              <Text style={styles.loadingHint}>
                Recipe generation can sometimes take a little longer.
                Please keep the app open.
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CREAM
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E4DB"
  },
  brandMark: { fontSize: 34, color: GREEN },
  brand: { fontSize: 20, fontWeight: "800", color: "#18251D" },
  tagline: { fontSize: 11, color: "#758078", marginTop: 2 },
  content: { padding: 20, paddingBottom: 34 },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: GREEN,
    marginBottom: 8
  },
  h1: {
    fontSize: 29,
    fontWeight: "800",
    color: "#18251D",
    lineHeight: 35,
    marginBottom: 8
  },
  h2: {
    fontSize: 18,
    fontWeight: "800",
    color: "#18251D",
    marginTop: 20,
    marginBottom: 8
  },
  muted: { color: "#758078", fontSize: 13, lineHeight: 19 },
  body: { fontSize: 14, color: "#29372E", lineHeight: 20 },
  mealRow: { flexDirection: "row", gap: 8, marginVertical: 22 },
  mealChip: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: "#EAE9E4",
    alignItems: "center"
  },
  mealSelected: {
    backgroundColor: "#D7EBD9",
    borderWidth: 1,
    borderColor: "#8DBB98"
  },
  mealText: { fontWeight: "700", color: "#46534A", fontSize: 12 },
  mealTextSelected: { color: GREEN },
  primaryButton: {
    backgroundColor: GREEN,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    minHeight: 52
  },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#B8C9BC",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    marginTop: 12
  },
  secondaryText: { color: GREEN, fontWeight: "700" },
  disabled: { opacity: 0.35 },
  infoCard: {
    backgroundColor: "#E9F2E7",
    borderRadius: 20,
    padding: 18,
    marginTop: 22
  },
  bigNumber: { fontSize: 38, fontWeight: "800", color: GREEN },
  link: { color: GREEN, fontWeight: "800", marginTop: 8 },
  warningCard: {
    backgroundColor: "#FFF0CE",
    padding: 16,
    borderRadius: 18,
    marginTop: 14
  },
  error: { color: "#B42318", marginTop: 12 },
  empty: {
    color: "#758078",
    paddingVertical: 28,
    textAlign: "center",
    lineHeight: 22
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E4DB",
    gap: 8
  },
  itemName: { fontSize: 15, fontWeight: "700", color: "#253229" },
  amountText: { fontWeight: "700", color: "#253229" },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EAE9E4",
    alignItems: "center",
    justifyContent: "center"
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2DED4",
    borderRadius: 13,
    padding: 14,
    fontSize: 16,
    marginTop: 6,
    marginBottom: 14,
    color: "#18251D"
  },
  label: { fontWeight: "700", color: "#35433A", marginTop: 8 },
  back: { color: GREEN, fontWeight: "800", marginBottom: 18, fontSize: 15 },
  preferenceCard: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginTop: 10, gap: 8 },
  preferenceChips: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginVertical: 9 },
  preferenceChip: { backgroundColor: "#EAE9E4", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  preferenceToggle: { paddingVertical: 9 },
  preferenceStepper: { flexDirection: "row", gap: 25, paddingHorizontal: 12, alignItems: "center" },
  useSoonTag: { marginTop: 5, color: GREEN, fontWeight: "700", fontSize: 12 },
  shortageTag: { marginTop: 5, color: "#996017", fontWeight: "700", fontSize: 12 },
  recipeCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    flexDirection: "row",
    gap: 13,
    borderWidth: 1,
    borderColor: "#EDE9E0"
  },
  recipeEmoji: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: PALE,
    alignItems: "center",
    justifyContent: "center"
  },
  recipeTitle: { fontSize: 16, fontWeight: "800", color: "#18251D" },
  recipeDesc: {
    fontSize: 12,
    color: "#68756C",
    marginTop: 5,
    lineHeight: 17
  },
  stepCard: {
    backgroundColor: "#1E2923",
    borderRadius: 22,
    padding: 26,
    minHeight: 210,
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10
  },
  stepText: {
    fontSize: 23,
    fontWeight: "700",
    lineHeight: 33,
    color: "#fff",
    textAlign: "center"
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  usageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E4DB"
  },
  smallInput: {
    width: 76,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D8DED8",
    borderRadius: 10,
    padding: 9,
    textAlign: "center",
    fontSize: 16
  },
  usageCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E4DB",
    padding: 14,
    marginTop: 12,
    gap: 8
  },
  choiceRow: { flexDirection: "row", gap: 8, marginTop: 5 },
  choiceButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D8DED8",
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 8,
    alignItems: "center",
    backgroundColor: "#fff"
  },
  choiceSelected: { backgroundColor: "#E3F1E5", borderColor: GREEN },
  choiceText: { color: "#526057", fontSize: 12, fontWeight: "700", textAlign: "center" },
  choiceTextSelected: { color: GREEN },
  confirmedAmount: { color: GREEN, fontSize: 13, fontWeight: "700", marginTop: 3 },
  actualAmountRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 5 },
  unitSelect: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2DED4",
    borderRadius: 13,
    padding: 14,
    marginTop: 6,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  unitSelectText: { color: "#18251D", fontSize: 16 },
  unitSelectArrow: { color: GREEN, fontSize: 20, fontWeight: "800" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 25, 18, 0.55)",
    justifyContent: "center",
    padding: 20
  },
  unitModalCard: {
    maxHeight: "82%",
    backgroundColor: CREAM,
    borderRadius: 22,
    padding: 20
  },
  modalHeadingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalClose: { color: "#526057", fontSize: 20, padding: 4 },
  unitOptionsScroll: { flexGrow: 0 },
  unitGroupTitle: { color: "#35433A", fontWeight: "800", marginTop: 15, marginBottom: 9 },
  unitOptionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  unitOption: { borderWidth: 1, borderColor: "#D8DED8", borderRadius: 11, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "#fff" },
  unitOptionSelected: { backgroundColor: "#E3F1E5", borderColor: GREEN },
  unitOptionText: { color: "#35433A", fontWeight: "700" },
  unitOptionTextSelected: { color: GREEN },
  previewServingsCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 16, marginTop: 20, marginBottom: 22, gap: 10 },
  previewStepper: { flexDirection: "row", alignItems: "center", gap: 10 },
  previewStepButton: { backgroundColor: PALE, width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  previewStepText: { fontSize: 23, color: GREEN, fontWeight: "700" },
  previewStepValue: { fontSize: 19, color: "#18251D", fontWeight: "800", minWidth: 24, textAlign: "center" },
  previewIngredientRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderBottomWidth: 1, borderBottomColor: "#E2DED4", backgroundColor: "#fff" },
  previewIngredientMark: { color: GREEN, fontWeight: "900", fontSize: 19, width: 25, textAlign: "center" },
  previewShortage: { color: "#A06415" },
  previewReady: { color: GREEN, fontWeight: "700", marginTop: 12, marginBottom: 10 },
  historyLine: { paddingVertical: 9, color: "#344239" },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginTop: 10
  },
  historyRecipeRow: {
    paddingVertical: 5
  },
  historyStepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginTop: 9
  },
  historyStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: "hidden",
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: PALE,
    color: GREEN,
    fontWeight: "800",
    paddingTop: 4
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E8E4DB",
    paddingVertical: 9,
    paddingBottom: 12
  },
  tabItem: { flex: 1, alignItems: "center", gap: 3 },
  tabIcon: { fontSize: 20, color: "#758078" },
  tabLabel: { fontSize: 10, color: "#758078", fontWeight: "600" },
  activeTab: { color: GREEN, fontWeight: "900" },

  // Recipe-generation loading screen.
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 25, 18, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },
  loadingCard: {
    width: "100%",
    backgroundColor: CREAM,
    borderRadius: 26,
    padding: 28,
    alignItems: "center"
  },
  loadingEmoji: { fontSize: 55, marginBottom: 18 },
  loadingTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#18251D",
    textAlign: "center"
  },
  loadingMessage: {
    fontSize: 14,
    color: "#758078",
    textAlign: "center",
    marginTop: 12,
    minHeight: 40,
    lineHeight: 21
  },
  progressTrack: {
    width: "100%",
    height: 7,
    backgroundColor: "#DDE8DD",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 25
  },
  progressSegment: {
    width: 90,
    height: 7,
    backgroundColor: GREEN,
    borderRadius: 10
  },
  loadingTimer: {
    fontSize: 13,
    fontWeight: "700",
    color: GREEN,
    marginTop: 18
  },
  loadingHint: {
    fontSize: 12,
    color: "#758078",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18
  },
  statsRow: { flexDirection: "row", justifyContent: "space-between", gap: 8, marginTop: 10 },
  statCell: { flex: 1 },
  outOfStockText: { color: "#B42318" },
  outOfStockLink: { color: "#B42318", fontWeight: "800", marginTop: 10 },
  pantrySummary: { backgroundColor: "#E9F2E7", padding: 12, borderRadius: 12, marginTop: 14 },
  pantrySummaryText: { color: "#35433A", fontWeight: "700", fontSize: 12 },
  outOfStockHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 26, marginBottom: 8 },
  outOfStockTitle: { color: "#B42318", fontSize: 18, fontWeight: "800" },
  outOfStockCount: { color: "#B42318", backgroundColor: "#FCE8E6", overflow: "hidden", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, fontWeight: "800" },
  outOfStockRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1D4D1" },
  outOfStockSubtext: { color: "#B42318", fontSize: 11, marginTop: 3 },
  outOfStockQuantity: { color: "#B42318", fontWeight: "800", fontSize: 12 },
  shoppingAddButton: { backgroundColor: "#FCE8E6", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  shoppingAddText: { color: "#B42318", fontWeight: "800", fontSize: 11 },
  shoppingAddedButton: { backgroundColor: "#EAE9E4" },
  shoppingAddedText: { color: "#758078" },
  pantryThumb: { width: 44, height: 44, borderRadius: 12, overflow: "hidden", backgroundColor: "#E9F2E7", alignItems: "center", justifyContent: "center" },
  pantryEmoji: { fontSize: 22, position: "absolute" },
  pantryImage: { width: 44, height: 44 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#E2DED4", paddingHorizontal: 12, marginTop: 18 },
  searchIcon: { fontSize: 24, color: "#758078", marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: "#18251D" },
  categoryScroller: { marginTop: 14, maxHeight: 42 },
  categoryChip: { borderRadius: 18, backgroundColor: "#EAE9E4", paddingHorizontal: 13, paddingVertical: 10, marginRight: 7 },
  categoryChipSelected: { backgroundColor: "#D7EBD9", borderWidth: 1, borderColor: "#8DBB98" },
  categoryChipText: { color: "#526057", fontSize: 11, fontWeight: "700" },
  categoryChipTextSelected: { color: GREEN },
  catalogGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 14 },
  catalogCard: { width: "48.5%", backgroundColor: "#fff", borderRadius: 16, padding: 9, marginBottom: 12, borderWidth: 1, borderColor: "#EDE9E0" },
  catalogImageWrap: { height: 104, borderRadius: 11, overflow: "hidden", backgroundColor: "#E9F2E7", alignItems: "center", justifyContent: "center" },
  catalogEmoji: { fontSize: 38, position: "absolute" },
  catalogImage: { width: "100%", height: "100%" },
  catalogName: { color: "#18251D", fontSize: 14, fontWeight: "800", marginTop: 9 },
  catalogCategory: { color: "#758078", fontSize: 10, marginTop: 3, minHeight: 25 },
  catalogAdd: { color: GREEN, fontSize: 12, fontWeight: "800", marginTop: 5 },
  catalogUpdate: { color: "#9A6416", fontSize: 11, fontWeight: "800", marginTop: 5 },
  shoppingEmptyCard: { backgroundColor: "#fff", borderRadius: 18, padding: 22, alignItems: "center", marginTop: 24 },
  shoppingEmptyEmoji: { fontSize: 42, marginBottom: 10 },
  shoppingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#E8E4DB" },
  purchasedButton: { backgroundColor: "#E3F1E5", borderRadius: 11, paddingHorizontal: 11, paddingVertical: 9 },
  purchasedButtonText: { color: GREEN, fontWeight: "800", fontSize: 11 }
});