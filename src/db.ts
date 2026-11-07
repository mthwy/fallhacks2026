import * as SQLite from "expo-sqlite";
import { Ingredient, Recipe, CookItem, ShoppingListItem } from "./types";

let database: SQLite.SQLiteDatabase;

export async function initDb() {
  database = await SQLite.openDatabaseAsync("pantry-to-plate.db");
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL COLLATE NOCASE UNIQUE,
      category TEXT NOT NULL DEFAULT 'Other',
      amount REAL NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT 'pcs',
      expiry_date TEXT
    );
    CREATE TABLE IF NOT EXISTS cook_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_title TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      cooked_at TEXT NOT NULL,
      servings INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cook_log_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cook_log_id INTEGER NOT NULL,
      ingredient_id INTEGER,
      ingredient_name TEXT NOT NULL,
      planned_amount REAL NOT NULL,
      actual_amount REAL NOT NULL,
      deducted_amount REAL NOT NULL DEFAULT 0,
      unit TEXT NOT NULL,
      FOREIGN KEY(cook_log_id) REFERENCES cook_logs(id)
    );
    CREATE TABLE IF NOT EXISTS adjustments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ingredient_id INTEGER NOT NULL,
      delta REAL NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS shopping_list (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ingredient_name TEXT NOT NULL COLLATE NOCASE UNIQUE,
      category TEXT NOT NULL DEFAULT 'Other',
      quantity REAL NOT NULL DEFAULT 1,
      unit TEXT NOT NULL DEFAULT 'pcs',
      created_at TEXT NOT NULL
    );
  `);

  // Add saved recipe data to existing databases without deleting cooking history.
  const cookLogColumns = await database.getAllAsync<{ name: string }>(
    "PRAGMA table_info(cook_logs)"
  );

  if (!cookLogColumns.some(column => column.name === "recipe_json")) {
    await database.execAsync(
      "ALTER TABLE cook_logs ADD COLUMN recipe_json TEXT"
    );
  }

  return database;
}

function db() {
  if (!database) throw new Error("Database has not been initialized.");
  return database;
}

export async function listIngredients(): Promise<Ingredient[]> {
  return db().getAllAsync<Ingredient>(
    "SELECT id, name, category, amount, unit, expiry_date AS expiryDate FROM ingredients ORDER BY category, name"
  );
}

export async function saveIngredient(input: Omit<Ingredient, "id">, id?: number) {
  const cleanName = input.name.trim();
  const cleanUnit = input.unit.trim();
  const cleanCategory = input.category.trim() || "Other";

  if (!cleanName) throw new Error("Enter an ingredient name.");
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    throw new Error("Amount must be a valid number of zero or greater.");
  }
  if (!cleanUnit) throw new Error("Choose or enter a unit.");

  if (id) {
    await db().runAsync(
      "UPDATE ingredients SET name=?, category=?, amount=?, unit=?, expiry_date=? WHERE id=?",
      cleanName, cleanCategory, input.amount, cleanUnit, input.expiryDate ?? null, id
    );
  } else {
    await db().runAsync(
      `INSERT INTO ingredients(name, category, amount, unit, expiry_date)
       VALUES(?,?,?,?,?)
       ON CONFLICT(name) DO UPDATE SET amount=excluded.amount, unit=excluded.unit,
       category=excluded.category, expiry_date=excluded.expiry_date`,
      cleanName, cleanCategory, input.amount, cleanUnit, input.expiryDate ?? null
    );
  }
}

export async function deleteIngredient(id: number) {
  await db().runAsync("DELETE FROM ingredients WHERE id=?", id);
}

/**
 * Records a cooking session and deducts the exact quantities confirmed by the user.
 * The transaction is rolled back if an ingredient is missing or there is insufficient stock.
 */
export async function confirmCook(recipe: Recipe, items: CookItem[]) {
  if (items.length === 0) {
    throw new Error("No pantry ingredients were matched to this recipe, so nothing can be deducted.");
  }

  // Validate the complete request before creating the cooking log.
  const seenIngredientIds = new Set<number>();
  for (const item of items) {
    if (!Number.isInteger(item.ingredientId) || item.ingredientId <= 0) {
      throw new Error(`The pantry record for ${item.name} is invalid. Please reopen the recipe and try again.`);
    }
    if (seenIngredientIds.has(item.ingredientId)) {
      throw new Error(`The recipe contains ${item.name} more than once in the pantry deduction list. Please check the recipe ingredients.`);
    }
    seenIngredientIds.add(item.ingredientId);

    if (!Number.isFinite(item.actualAmount) || item.actualAmount < 0) {
      throw new Error(`Enter a valid amount used for ${item.name}.`);
    }
    if (!Number.isFinite(item.plannedAmount) || item.plannedAmount < 0) {
      throw new Error(`The suggested amount for ${item.name} is invalid.`);
    }
  }

  await db().withTransactionAsync(async () => {
    const result = await db().runAsync(
      "INSERT INTO cook_logs(recipe_title, meal_type, cooked_at, servings, recipe_json) VALUES(?,?,?,?,?)",
      recipe.title,
      recipe.mealType,
      new Date().toISOString(),
      recipe.servings,
      JSON.stringify(recipe)
    );
    const logId = result.lastInsertRowId;
    const now = new Date().toISOString();

    for (const item of items) {
      const ingredient = await db().getFirstAsync<{ amount: number }>(
        "SELECT amount FROM ingredients WHERE id=?",
        item.ingredientId
      );

      if (!ingredient) {
        throw new Error(`${item.name} is no longer in your pantry. Refresh your pantry and try again.`);
      }

      const available = Number(ingredient.amount);
      if (item.actualAmount > available + 0.000001) {
        throw new Error(
          `You entered ${item.actualAmount} ${item.unit} for ${item.name}, but your pantry only has ${available} ${item.unit}. Please correct the amount before confirming.`
        );
      }

      const deducted = item.actualAmount;
      const nextAmount = Math.max(0, available - deducted);

      await db().runAsync(
        `INSERT INTO cook_log_items(
          cook_log_id, ingredient_id, ingredient_name, planned_amount,
          actual_amount, deducted_amount, unit
        ) VALUES(?,?,?,?,?,?,?)`,
        logId,
        item.ingredientId,
        item.name,
        item.plannedAmount,
        item.actualAmount,
        deducted,
        item.unit
      );

      const update = await db().runAsync(
        "UPDATE ingredients SET amount=? WHERE id=?",
        nextAmount,
        item.ingredientId
      );
      if (update.changes !== 1) {
        throw new Error(`Could not update the pantry quantity for ${item.name}.`);
      }

      if (deducted > 0) {
        await db().runAsync(
          "INSERT INTO adjustments(ingredient_id, delta, reason, created_at) VALUES(?,?,?,?)",
          item.ingredientId,
          -deducted,
          "cooking",
          now
        );
      }
    }
  });
}

export async function getHistory() {
  return db().getAllAsync<{
    id: number;
    recipe_title: string;
    meal_type: string;
    cooked_at: string;
    servings: number;
    recipe_json: string | null;
  }>("SELECT * FROM cook_logs ORDER BY cooked_at DESC LIMIT 50");
}

export async function undoLastCook() {
  const last = await db().getFirstAsync<{ id: number }>(
    "SELECT id FROM cook_logs ORDER BY id DESC LIMIT 1"
  );
  if (!last) return false;

  await db().withTransactionAsync(async () => {
    const rows = await db().getAllAsync<{
      ingredient_id: number | null;
      deducted_amount: number;
    }>(
      "SELECT ingredient_id, deducted_amount FROM cook_log_items WHERE cook_log_id=?",
      last.id
    );

    for (const row of rows) {
      if (row.ingredient_id !== null && row.deducted_amount > 0) {
        await db().runAsync(
          "UPDATE ingredients SET amount=amount+? WHERE id=?",
          row.deducted_amount,
          row.ingredient_id
        );
        await db().runAsync(
          "INSERT INTO adjustments(ingredient_id, delta, reason, created_at) VALUES(?,?,?,?)",
          row.ingredient_id,
          row.deducted_amount,
          "undo",
          new Date().toISOString()
        );
      }
    }

    await db().runAsync("DELETE FROM cook_log_items WHERE cook_log_id=?", last.id);
    await db().runAsync("DELETE FROM cook_logs WHERE id=?", last.id);
  });

  return true;
}


/** Returns the current shopping list, with oldest additions first. */
export async function getShoppingList(): Promise<ShoppingListItem[]> {
  return db().getAllAsync<ShoppingListItem>(
    "SELECT id, ingredient_name, category, quantity, unit, created_at FROM shopping_list ORDER BY created_at, ingredient_name"
  );
}

/** Adds an item once. Adding the same ingredient again updates its requested quantity. */
export async function addToShoppingList(
  ingredientName: string,
  category = "Other",
  quantity = 1,
  unit = "pcs"
) {
  const cleanName = ingredientName.trim();
  const cleanCategory = category.trim() || "Other";
  const cleanUnit = unit.trim() || "pcs";
  if (!cleanName) throw new Error("Enter an ingredient name.");
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Shopping quantity must be greater than zero.");

  await db().runAsync(
    `INSERT INTO shopping_list(ingredient_name, category, quantity, unit, created_at)
     VALUES(?,?,?,?,?)
     ON CONFLICT(ingredient_name) DO UPDATE SET
       category=excluded.category, quantity=excluded.quantity, unit=excluded.unit`,
    cleanName,
    cleanCategory,
    quantity,
    cleanUnit,
    new Date().toISOString()
  );
}

/** Removes an item without changing pantry quantities. */
export async function removeShoppingListItem(id: number) {
  await db().runAsync("DELETE FROM shopping_list WHERE id=?", id);
}

/** Marks an item as purchased, adds its quantity to the pantry, and removes it from the list. */
export async function markShoppingItemPurchased(id: number) {
  await db().withTransactionAsync(async () => {
    const item = await db().getFirstAsync<ShoppingListItem>(
      "SELECT id, ingredient_name, category, quantity, unit, created_at FROM shopping_list WHERE id=?",
      id
    );
    if (!item) throw new Error("This shopping-list item could not be found.");

    const existing = await db().getFirstAsync<{ id: number; amount: number; unit: string }>(
      "SELECT id, amount, unit FROM ingredients WHERE name=?",
      item.ingredient_name
    );

    if (existing) {
      if (existing.unit.toLowerCase() !== item.unit.toLowerCase()) {
        throw new Error(
          `${item.ingredient_name} is tracked in ${existing.unit}, but the shopping list uses ${item.unit}. Edit the pantry unit before marking this purchased.`
        );
      }
      await db().runAsync(
        "UPDATE ingredients SET amount=amount+?, category=? WHERE id=?",
        item.quantity,
        item.category,
        existing.id
      );
      await db().runAsync(
        "INSERT INTO adjustments(ingredient_id, delta, reason, created_at) VALUES(?,?,?,?)",
        existing.id,
        item.quantity,
        "shopping purchase",
        new Date().toISOString()
      );
    } else {
      const result = await db().runAsync(
        "INSERT INTO ingredients(name, category, amount, unit) VALUES(?,?,?,?)",
        item.ingredient_name,
        item.category,
        item.quantity,
        item.unit
      );
      await db().runAsync(
        "INSERT INTO adjustments(ingredient_id, delta, reason, created_at) VALUES(?,?,?,?)",
        result.lastInsertRowId,
        item.quantity,
        "shopping purchase",
        new Date().toISOString()
      );
    }

    await db().runAsync("DELETE FROM shopping_list WHERE id=?", id);
  });
}