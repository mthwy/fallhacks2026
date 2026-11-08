// Offline starter library adapted from the user's supplied Pantry to Plate HTML.
// Ingredients, alternatives, base servings and steps are bundled with the app.
export const PANTRY_INGREDIENTS: Record<string, { name: string; category: string; unit: string; density: number; gramsPerPiece: number; flags: string[]; aliases: string[] }> = {
  "onion": {
    "name": "onion",
    "category": "Produce",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 150,
    "flags": [],
    "aliases": [
      "onions",
      "yellow onion",
      "red onion",
      "white onion"
    ]
  },
  "garlic": {
    "name": "garlic clove",
    "category": "Produce",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 4,
    "flags": [],
    "aliases": [
      "garlic",
      "garlic cloves",
      "cloves of garlic"
    ]
  },
  "tomato": {
    "name": "tomato",
    "category": "Produce",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 120,
    "flags": [],
    "aliases": [
      "tomatoes",
      "roma tomato",
      "cherry tomatoes",
      "plum tomato"
    ]
  },
  "potato": {
    "name": "potato",
    "category": "Produce",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 200,
    "flags": [],
    "aliases": [
      "potatoes",
      "russet potato",
      "yukon gold potato",
      "baby potatoes"
    ]
  },
  "sweet_potato": {
    "name": "sweet potato",
    "category": "Produce",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 250,
    "flags": [],
    "aliases": [
      "sweet potatoes",
      "yam"
    ]
  },
  "carrot": {
    "name": "carrot",
    "category": "Produce",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 70,
    "flags": [],
    "aliases": [
      "carrots"
    ]
  },
  "bell_pepper": {
    "name": "bell pepper",
    "category": "Produce",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 150,
    "flags": [],
    "aliases": [
      "bell peppers",
      "red pepper",
      "green pepper",
      "capsicum",
      "yellow pepper"
    ]
  },
  "zucchini": {
    "name": "zucchini",
    "category": "Produce",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 200,
    "flags": [],
    "aliases": [
      "zucchinis",
      "courgette"
    ]
  },
  "cucumber": {
    "name": "cucumber",
    "category": "Produce",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 250,
    "flags": [],
    "aliases": [
      "cucumbers"
    ]
  },
  "avocado": {
    "name": "avocado",
    "category": "Produce",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 170,
    "flags": [],
    "aliases": [
      "avocados"
    ]
  },
  "lemon": {
    "name": "lemon",
    "category": "Produce",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 80,
    "flags": [],
    "aliases": [
      "lemons",
      "lime",
      "limes"
    ]
  },
  "banana": {
    "name": "banana",
    "category": "Produce",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 120,
    "flags": [],
    "aliases": [
      "bananas"
    ]
  },
  "apple": {
    "name": "apple",
    "category": "Produce",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 180,
    "flags": [],
    "aliases": [
      "apples"
    ]
  },
  "spinach": {
    "name": "spinach",
    "category": "Produce",
    "unit": "g",
    "density": 0.13,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "baby spinach"
    ]
  },
  "broccoli": {
    "name": "broccoli",
    "category": "Produce",
    "unit": "g",
    "density": 0.35,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "broccoli florets"
    ]
  },
  "mushroom": {
    "name": "mushrooms",
    "category": "Produce",
    "unit": "g",
    "density": 0.4,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "mushroom",
      "button mushrooms",
      "cremini mushrooms"
    ]
  },
  "lettuce": {
    "name": "lettuce",
    "category": "Produce",
    "unit": "g",
    "density": 0.1,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "romaine",
      "romaine lettuce",
      "salad greens",
      "mixed greens",
      "arugula",
      "salad"
    ]
  },
  "green_onion": {
    "name": "green onion",
    "category": "Produce",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 15,
    "flags": [],
    "aliases": [
      "green onions",
      "scallion",
      "scallions",
      "spring onion"
    ]
  },
  "ginger": {
    "name": "ginger",
    "category": "Produce",
    "unit": "g",
    "density": 0.6,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "fresh ginger"
    ]
  },
  "berries": {
    "name": "berries",
    "category": "Produce",
    "unit": "g",
    "density": 0.6,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "blueberries",
      "strawberries",
      "raspberries",
      "mixed berries",
      "blueberry",
      "strawberry"
    ]
  },
  "egg": {
    "name": "egg",
    "category": "Dairy & eggs",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 50,
    "flags": [
      "egg"
    ],
    "aliases": [
      "eggs",
      "large egg",
      "large eggs"
    ]
  },
  "milk": {
    "name": "milk",
    "category": "Dairy & eggs",
    "unit": "ml",
    "density": 1.03,
    "gramsPerPiece": 0,
    "flags": [
      "dairy"
    ],
    "aliases": [
      "whole milk",
      "2% milk",
      "skim milk"
    ]
  },
  "butter": {
    "name": "butter",
    "category": "Dairy & eggs",
    "unit": "g",
    "density": 0.95,
    "gramsPerPiece": 0,
    "flags": [
      "dairy"
    ],
    "aliases": [
      "unsalted butter",
      "salted butter"
    ]
  },
  "cheese": {
    "name": "cheese",
    "category": "Dairy & eggs",
    "unit": "g",
    "density": 0.45,
    "gramsPerPiece": 0,
    "flags": [
      "dairy"
    ],
    "aliases": [
      "cheddar",
      "cheddar cheese",
      "shredded cheese",
      "mozzarella",
      "parmesan",
      "parmesan cheese",
      "grated cheese"
    ]
  },
  "yogurt": {
    "name": "yogurt",
    "category": "Dairy & eggs",
    "unit": "g",
    "density": 1.03,
    "gramsPerPiece": 0,
    "flags": [
      "dairy"
    ],
    "aliases": [
      "greek yogurt",
      "plain yogurt",
      "yoghurt"
    ]
  },
  "chicken_breast": {
    "name": "chicken breast",
    "category": "Protein",
    "unit": "g",
    "density": 0,
    "gramsPerPiece": 200,
    "flags": [
      "meat"
    ],
    "aliases": [
      "chicken",
      "chicken breasts",
      "chicken thighs",
      "chicken thigh"
    ]
  },
  "ground_beef": {
    "name": "ground beef",
    "category": "Protein",
    "unit": "g",
    "density": 0,
    "gramsPerPiece": 0,
    "flags": [
      "meat"
    ],
    "aliases": [
      "minced beef",
      "beef mince",
      "ground meat",
      "hamburger meat"
    ]
  },
  "bacon": {
    "name": "bacon strip",
    "category": "Protein",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 25,
    "flags": [
      "meat"
    ],
    "aliases": [
      "bacon",
      "bacon strips",
      "bacon slices"
    ]
  },
  "sausage": {
    "name": "sausage",
    "category": "Protein",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 80,
    "flags": [
      "meat"
    ],
    "aliases": [
      "sausages",
      "italian sausage",
      "bratwurst"
    ]
  },
  "salmon": {
    "name": "salmon",
    "category": "Protein",
    "unit": "g",
    "density": 0,
    "gramsPerPiece": 180,
    "flags": [
      "fish"
    ],
    "aliases": [
      "salmon fillet",
      "salmon fillets"
    ]
  },
  "tuna": {
    "name": "canned tuna",
    "category": "Protein",
    "unit": "g",
    "density": 0,
    "gramsPerPiece": 140,
    "flags": [
      "fish"
    ],
    "aliases": [
      "tuna",
      "tuna can",
      "tinned tuna"
    ]
  },
  "shrimp": {
    "name": "shrimp",
    "category": "Protein",
    "unit": "g",
    "density": 0,
    "gramsPerPiece": 0,
    "flags": [
      "fish"
    ],
    "aliases": [
      "prawns",
      "prawn"
    ]
  },
  "tofu": {
    "name": "tofu",
    "category": "Protein",
    "unit": "g",
    "density": 0,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "firm tofu",
      "extra firm tofu"
    ]
  },
  "rice": {
    "name": "rice",
    "category": "Grains & bread",
    "unit": "g",
    "density": 0.85,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "white rice",
      "brown rice",
      "basmati rice",
      "jasmine rice"
    ]
  },
  "pasta": {
    "name": "pasta",
    "category": "Grains & bread",
    "unit": "g",
    "density": 0.4,
    "gramsPerPiece": 0,
    "flags": [
      "gluten"
    ],
    "aliases": [
      "spaghetti",
      "penne",
      "macaroni",
      "fusilli",
      "linguine"
    ]
  },
  "noodles": {
    "name": "noodles",
    "category": "Grains & bread",
    "unit": "g",
    "density": 0,
    "gramsPerPiece": 0,
    "flags": [
      "gluten"
    ],
    "aliases": [
      "ramen noodles",
      "egg noodles",
      "rice noodles",
      "udon"
    ]
  },
  "bread": {
    "name": "bread slice",
    "category": "Grains & bread",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 30,
    "flags": [
      "gluten"
    ],
    "aliases": [
      "bread",
      "bread slices",
      "sliced bread",
      "toast",
      "sandwich bread"
    ]
  },
  "tortilla": {
    "name": "tortilla",
    "category": "Grains & bread",
    "unit": "pcs",
    "density": 0,
    "gramsPerPiece": 45,
    "flags": [
      "gluten"
    ],
    "aliases": [
      "tortillas",
      "wraps",
      "wrap",
      "flour tortillas"
    ]
  },
  "oats": {
    "name": "oats",
    "category": "Grains & bread",
    "unit": "g",
    "density": 0.38,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "rolled oats",
      "oatmeal",
      "porridge oats"
    ]
  },
  "flour": {
    "name": "flour",
    "category": "Grains & bread",
    "unit": "g",
    "density": 0.53,
    "gramsPerPiece": 0,
    "flags": [
      "gluten"
    ],
    "aliases": [
      "all-purpose flour",
      "plain flour",
      "wheat flour"
    ]
  },
  "canned_tomatoes": {
    "name": "canned tomatoes",
    "category": "Pantry",
    "unit": "g",
    "density": 1,
    "gramsPerPiece": 400,
    "flags": [],
    "aliases": [
      "crushed tomatoes",
      "diced tomatoes",
      "tomato sauce",
      "passata",
      "tinned tomatoes",
      "pasta sauce",
      "tomato paste"
    ]
  },
  "black_beans": {
    "name": "black beans",
    "category": "Pantry",
    "unit": "g",
    "density": 0,
    "gramsPerPiece": 240,
    "flags": [],
    "aliases": [
      "canned black beans",
      "beans",
      "kidney beans"
    ]
  },
  "chickpeas": {
    "name": "chickpeas",
    "category": "Pantry",
    "unit": "g",
    "density": 0,
    "gramsPerPiece": 240,
    "flags": [],
    "aliases": [
      "canned chickpeas",
      "garbanzo beans"
    ]
  },
  "lentils": {
    "name": "lentils",
    "category": "Pantry",
    "unit": "g",
    "density": 0.8,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "red lentils",
      "green lentils",
      "brown lentils"
    ]
  },
  "coconut_milk": {
    "name": "coconut milk",
    "category": "Pantry",
    "unit": "ml",
    "density": 0.97,
    "gramsPerPiece": 400,
    "flags": [],
    "aliases": [
      "canned coconut milk",
      "coconut cream"
    ]
  },
  "peanut_butter": {
    "name": "peanut butter",
    "category": "Pantry",
    "unit": "g",
    "density": 1.07,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "pb",
      "almond butter"
    ]
  },
  "honey": {
    "name": "honey",
    "category": "Pantry",
    "unit": "g",
    "density": 1.4,
    "gramsPerPiece": 0,
    "flags": [
      "honey"
    ],
    "aliases": [
      "maple syrup"
    ]
  },
  "sugar": {
    "name": "sugar",
    "category": "Pantry",
    "unit": "g",
    "density": 0.85,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "white sugar",
      "brown sugar"
    ]
  },
  "soy_sauce": {
    "name": "soy sauce",
    "category": "Pantry",
    "unit": "ml",
    "density": 1.1,
    "gramsPerPiece": 0,
    "flags": [
      "gluten"
    ],
    "aliases": [
      "tamari"
    ]
  },
  "oil": {
    "name": "cooking oil",
    "category": "Pantry",
    "unit": "ml",
    "density": 0.92,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "olive oil",
      "vegetable oil",
      "canola oil",
      "sunflower oil",
      "oil",
      "coconut oil"
    ]
  },
  "stock": {
    "name": "stock",
    "category": "Pantry",
    "unit": "ml",
    "density": 1,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "broth",
      "chicken stock",
      "vegetable stock",
      "vegetable broth",
      "chicken broth"
    ]
  },
  "frozen_peas": {
    "name": "frozen peas",
    "category": "Pantry",
    "unit": "g",
    "density": 0.6,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "peas",
      "green peas",
      "frozen vegetables",
      "corn",
      "frozen corn"
    ]
  },
  "salt": {
    "name": "salt",
    "category": "Spices",
    "unit": "ml",
    "density": 1.2,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "sea salt",
      "kosher salt"
    ]
  },
  "pepper": {
    "name": "black pepper",
    "category": "Spices",
    "unit": "ml",
    "density": 0.5,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "pepper",
      "ground pepper"
    ]
  },
  "paprika": {
    "name": "paprika",
    "category": "Spices",
    "unit": "ml",
    "density": 0.5,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "smoked paprika"
    ]
  },
  "cumin": {
    "name": "cumin",
    "category": "Spices",
    "unit": "ml",
    "density": 0.5,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "ground cumin"
    ]
  },
  "curry_powder": {
    "name": "curry powder",
    "category": "Spices",
    "unit": "ml",
    "density": 0.5,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "curry",
      "garam masala"
    ]
  },
  "cinnamon": {
    "name": "cinnamon",
    "category": "Spices",
    "unit": "ml",
    "density": 0.5,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "ground cinnamon"
    ]
  },
  "oregano": {
    "name": "oregano",
    "category": "Spices",
    "unit": "ml",
    "density": 0.2,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "italian seasoning",
      "dried oregano",
      "basil",
      "dried basil",
      "thyme",
      "dried herbs"
    ]
  },
  "chili_flakes": {
    "name": "chili flakes",
    "category": "Spices",
    "unit": "ml",
    "density": 0.4,
    "gramsPerPiece": 0,
    "flags": [],
    "aliases": [
      "red pepper flakes",
      "chilli flakes",
      "chili powder",
      "cayenne"
    ]
  }
};

// title, supported meals (b=breakfast/l=lunch/d=dinner), base servings, total minutes, difficulty, ingredient slots, cooking steps.
export const STARTER_RECIPE_ROWS: [string, string, number, number, number, string, string][] = [
  [
    "Garlic Butter Scrambled Eggs on Toast",
    "b",
    2,
    12,
    1,
    "egg:4,bread:2,butter:15,milk:30,garlic:1,salt:1,pepper:0.5,green_onion:1?",
    "Whisk the eggs with the milk, salt and pepper until no streaks of white remain.//Toast the bread while a pan heats over medium-low.//Melt the butter, add the finely chopped garlic and cook for 30 seconds without browning.//Pour in the eggs and stir slowly, pulling the curds across the pan, for 2 to 3 minutes.//Take the pan off the heat while the eggs still look glossy. Spoon over the toast and top with sliced green onion."
  ],
  [
    "Banana Crêpes",
    "b",
    2,
    20,
    1,
    "flour:100,egg:2,milk:250,banana:1,butter:20,sugar:10?,cinnamon:1?",
    "Blend or whisk the flour, eggs, milk and a pinch of sugar into a thin, smooth batter. Rest it for 5 minutes.//Melt a little butter in a non-stick pan over medium heat.//Pour in a thin layer of batter, tilting the pan to spread it. Cook 1 to 2 minutes until the edges lift, flip, and cook 30 seconds more.//Repeat with the remaining batter, keeping the crêpes warm under a plate.//Slice the banana, fill and fold the crêpes, and dust with cinnamon."
  ],
  [
    "Creamy Banana Oatmeal",
    "b",
    2,
    10,
    1,
    "oats:100,milk:400,banana:1,honey:15?,cinnamon:1?,salt:0.5",
    "Combine the oats, milk and a pinch of salt in a small pot.//Mash half the banana into the pot. Bring to a gentle simmer over medium heat.//Cook for 5 to 6 minutes, stirring often, until thick and creamy.//Spoon into bowls, top with the remaining banana slices, a drizzle of honey and a sprinkle of cinnamon."
  ],
  [
    "Veggie Cheese Omelette",
    "b",
    2,
    12,
    1,
    "egg:4,cheese:50,spinach:40|mushroom:80|bell_pepper:0.5|tomato:1,butter:15,salt:1,pepper:0.5",
    "Chop the vegetable and cook it in half the butter for 2 to 3 minutes until soft. Set aside.//Beat the eggs with salt and pepper.//Melt the remaining butter in the pan over medium heat and pour in the eggs.//As the edges set, push them toward the middle and tilt the pan so the raw egg runs underneath.//When the top is nearly set, add the vegetables and cheese to one half, fold over, and slide onto a plate."
  ],
  [
    "Yogurt Parfait",
    "b",
    2,
    5,
    1,
    "yogurt:300,oats:50,berries:100|banana:1|apple:1,honey:20?,cinnamon:0.5?",
    "Toast the oats in a dry pan over medium heat for 3 minutes, stirring, until fragrant. Let them cool.//Slice or crush the fruit.//Layer yogurt, fruit and oats in two glasses or bowls.//Finish with honey and a pinch of cinnamon."
  ],
  [
    "Peanut Butter Banana Toast",
    "b",
    2,
    5,
    1,
    "bread:2,peanut_butter:40,banana:1,honey:10?,cinnamon:0.5?",
    "Toast the bread until golden.//Spread the peanut butter on while the toast is still warm.//Top with sliced banana, a little honey and a pinch of cinnamon."
  ],
  [
    "Avocado Egg Toast",
    "b",
    2,
    12,
    1,
    "bread:2,avocado:1,egg:2,lemon:0.25,chili_flakes:1?,salt:1,pepper:0.5,oil:5",
    "Mash the avocado with a squeeze of lemon, salt and pepper.//Heat the oil in a pan and fry the eggs to your liking, 2 to 3 minutes for a runny yolk.//Toast the bread.//Spread the avocado over the toast, top with the eggs and finish with chili flakes."
  ],
  [
    "Breakfast Burritos",
    "b",
    2,
    18,
    1,
    "tortilla:2,egg:4,cheese:50,black_beans:120|sausage:1|bacon:3,onion:0.25?,bell_pepper:0.5?,oil:10,salt:1,pepper:0.5,paprika:1?",
    "Dice the onion and pepper if using. Heat the oil and cook them for 3 minutes with the beans, sausage or bacon until hot and lightly browned.//Beat the eggs with salt, pepper and paprika. Pour into the pan and scramble until just set.//Warm the tortillas for 20 seconds per side in a dry pan.//Divide the filling and cheese between the tortillas, fold in the sides and roll tightly.//Sear the burritos seam-side down for a minute to seal."
  ],
  [
    "Crispy Potato Hash with Eggs",
    "b",
    2,
    30,
    2,
    "potato:2,onion:0.5,bacon:3|sausage:1,egg:2,oil:20,paprika:1,salt:1,pepper:0.5",
    "Dice the potatoes into 1 cm cubes. Microwave them for 3 minutes, or parboil for 5, to speed things up.//Heat the oil in a wide pan over medium-high. Add the potatoes in one layer and leave them alone for 4 minutes to crisp.//Add the diced onion and bacon or sausage, paprika, salt and pepper. Cook 8 to 10 minutes, stirring now and then.//Make two wells in the hash, crack in the eggs, cover, and cook 3 to 4 minutes until the whites set."
  ],
  [
    "Cinnamon French Toast",
    "b",
    2,
    15,
    1,
    "bread:4,egg:2,milk:80,butter:20,cinnamon:1,sugar:10?,honey:15?",
    "Whisk the eggs, milk, cinnamon and sugar in a shallow dish.//Melt half the butter in a pan over medium heat.//Dip each slice in the egg mixture for about 10 seconds per side so it soaks without falling apart.//Fry 2 to 3 minutes per side until deep golden, adding the rest of the butter for the second batch.//Serve with honey."
  ],
  [
    "Shakshuka",
    "b",
    2,
    30,
    2,
    "egg:4,canned_tomatoes:400,onion:0.5,garlic:2,bell_pepper:0.5?,cumin:1,paprika:1,oil:20,bread:2?,salt:1",
    "Heat the oil in a deep skillet. Cook the chopped onion and pepper for 5 minutes until soft, then add the garlic, cumin and paprika for 30 seconds.//Pour in the tomatoes with the salt. Simmer 10 minutes until thickened.//Make four wells in the sauce and crack an egg into each.//Cover and cook 5 to 7 minutes until the whites are set and the yolks are still soft.//Serve straight from the pan with toasted bread."
  ],
  [
    "Tofu Scramble",
    "b",
    2,
    15,
    1,
    "tofu:300,onion:0.5,spinach:50|bell_pepper:1|tomato:1,curry_powder:1,soy_sauce:15?,oil:15,salt:1,pepper:0.5",
    "Press the tofu between paper towels for a few minutes, then crumble it with your hands.//Heat the oil and cook the chopped onion for 3 minutes.//Add the tofu, curry powder, salt and pepper. Cook 5 minutes, stirring, until lightly golden.//Fold in the chopped vegetable and the soy sauce. Cook 2 more minutes until the greens wilt or the pepper softens."
  ],
  [
    "Chickpea Salad Wraps",
    "l",
    2,
    12,
    1,
    "tortilla:2,chickpeas:240,cucumber:0.5|tomato:1,yogurt:60?,lemon:0.5,oil:15,cumin:1,salt:1,pepper:0.5,spinach:30?",
    "Drain and rinse the chickpeas. Roughly mash about half with a fork.//Dice the cucumber or tomato and mix with the chickpeas, oil, lemon juice, cumin, salt, pepper and yogurt if using.//Warm the tortillas briefly.//Pile in the filling and spinach, fold the sides and roll up."
  ],
  [
    "Grilled Cheese with Tomato Soup",
    "ld",
    2,
    30,
    1,
    "bread:4,cheese:100,butter:25,canned_tomatoes:400,onion:0.5,garlic:1,stock:200?,oil:10,oregano:1?,salt:1,pepper:0.5",
    "Soften the chopped onion in the oil for 5 minutes, add the garlic for 30 seconds.//Add the tomatoes, stock (or the same amount of water), oregano, salt and pepper. Simmer 15 minutes.//Blend the soup until smooth and keep it warm.//Butter the outside of the bread, fill with cheese and toast in a pan over medium-low heat 3 minutes per side until golden and melted.//Serve the sandwiches with the soup."
  ],
  [
    "Lemony Tuna Pasta",
    "ld",
    2,
    20,
    1,
    "pasta:200,tuna:140,lemon:0.5,oil:30,garlic:1,spinach:40?,chili_flakes:0.5?,salt:2,pepper:0.5",
    "Boil the pasta in well-salted water until al dente. Save a mug of the cooking water, then drain.//Warm the oil with the sliced garlic and chili flakes for 1 minute.//Add the drained tuna, lemon zest and juice, and the spinach if using.//Toss in the pasta with a splash of cooking water until glossy. Season with pepper."
  ],
  [
    "Egg Fried Rice",
    "ld",
    2,
    20,
    1,
    "rice:160,egg:2,carrot:1,frozen_peas:60,green_onion:2,soy_sauce:30,oil:20,garlic:2,pepper:0.5",
    "Cook the rice ahead and let it cool, or use leftover rice. Day-old rice fries best.//Heat half the oil in a wok or large pan over high heat. Scramble the eggs for 30 seconds and set aside.//Add the remaining oil, diced carrot and garlic. Stir-fry 3 minutes, then add the peas.//Add the rice and press it into the pan, stirring every 30 seconds for 4 minutes.//Return the eggs, add the soy sauce and pepper, and finish with sliced green onion."
  ],
  [
    "Loaded Quesadillas",
    "ld",
    2,
    15,
    1,
    "tortilla:4,cheese:120,chicken_breast:150|black_beans:150|mushroom:120,onion:0.25?,bell_pepper:0.5?,oil:10,cumin:1?,salt:0.5",
    "Dice the chicken or mushrooms and cook in half the oil with the cumin and salt until cooked through, 6 to 8 minutes. Add the onion and pepper for the last 2 minutes. If using beans, just warm them and mash lightly.//Lay a tortilla in a clean pan over medium heat. Cover with cheese, the filling, more cheese, and a second tortilla.//Cook 2 to 3 minutes per side until crisp and the cheese melts.//Cut into wedges."
  ],
  [
    "Tomato Cheese Melts",
    "l",
    2,
    12,
    1,
    "bread:4,tomato:2,cheese:80,oregano:1,oil:10,pepper:0.5",
    "Heat the grill or oven to high.//Brush the bread with oil and toast one side under the grill for 1 to 2 minutes.//Top with sliced tomato, cheese, oregano and pepper.//Grill 3 to 4 minutes until bubbling and golden at the edges."
  ],
  [
    "Hearty Lentil Soup",
    "ld",
    3,
    40,
    1,
    "lentils:200,onion:1,carrot:2,garlic:3,canned_tomatoes:200?,stock:800?,cumin:2,oil:20,lemon:0.5?,spinach:40?,salt:2,pepper:0.5",
    "Cook the diced onion and carrot in the oil for 6 minutes. Add the garlic and cumin for 1 minute.//Add the rinsed lentils, tomatoes, and 800 ml of stock or water.//Simmer 25 to 30 minutes until the lentils are soft. Add more water if it gets too thick.//Stir in the spinach if using, salt and pepper. Brighten with lemon juice before serving."
  ],
  [
    "Chicken Salad Bowl",
    "l",
    2,
    20,
    1,
    "chicken_breast:250,lettuce:150,tomato:1?,cucumber:0.5?,cheese:30?,lemon:0.5,oil:30,garlic:1,bread:1?,salt:1,pepper:0.5",
    "Slice the chicken breast in half horizontally so it cooks evenly. Season with salt and pepper.//Cook in a pan with half the oil over medium heat, 5 to 6 minutes per side, until no pink remains. Rest 5 minutes and slice.//Cube the bread and toast it in the same pan for croutons, if using.//Whisk the remaining oil with lemon juice, grated garlic, salt and pepper.//Toss the lettuce and vegetables with the dressing, top with chicken, croutons and cheese."
  ],
  [
    "Veggie Noodle Stir-Fry",
    "ld",
    2,
    20,
    1,
    "noodles:200,soy_sauce:40,broccoli:150|mushroom:150|zucchini:1,carrot:1,bell_pepper:1,garlic:2,ginger:10?,peanut_butter:20?,oil:20,chili_flakes:0.5?",
    "Cook the noodles according to the packet, drain and rinse under cold water.//Stir the soy sauce with the peanut butter and 2 tbsp of hot water, if using, to make a sauce.//Heat the oil in a wok over high heat. Stir-fry the carrot and broccoli for 3 minutes, then the pepper, garlic and ginger for 2 minutes.//Add the noodles and sauce, toss for 2 minutes until coated and hot."
  ],
  [
    "Black Bean Rice Bowls",
    "ld",
    2,
    25,
    1,
    "rice:160,black_beans:240,avocado:1?,tomato:1,lemon:0.5,cumin:1,onion:0.25,cheese:30?,oil:10,salt:1,pepper:0.5",
    "Cook the rice and keep it warm.//Soften the diced onion in the oil for 3 minutes. Add the drained beans, cumin, salt and pepper and a splash of water. Simmer 5 minutes, mashing a few beans.//Dice the tomato and avocado and toss with lemon juice and a pinch of salt.//Build the bowls with rice, beans, the tomato mix and cheese."
  ],
  [
    "Smashed Chickpea Toast",
    "l",
    2,
    10,
    1,
    "chickpeas:240,bread:4,lemon:0.5,oil:20,garlic:1,cumin:1?,tomato:1?,salt:1,pepper:0.5",
    "Drain and rinse the chickpeas. Mash them with a fork, leaving some texture.//Mix in the oil, lemon juice, grated garlic, cumin, salt and pepper.//Toast the bread.//Pile the chickpea mash on the toast and top with sliced tomato."
  ],
  [
    "Egg Salad Sandwiches",
    "l",
    2,
    20,
    1,
    "egg:4,bread:4,yogurt:50,green_onion:1?,lettuce:30?,salt:1,pepper:0.5",
    "Lower the eggs into boiling water and cook 10 minutes. Cool in cold water, then peel.//Chop the eggs and mix with the yogurt, sliced green onion, salt and pepper.//Toast the bread if you like.//Fill the sandwiches with the egg salad and lettuce."
  ],
  [
    "Veggie Frittata",
    "ld",
    3,
    25,
    1,
    "egg:6,onion:0.5,potato:1?,spinach:60|bell_pepper:1|mushroom:100,cheese:60,milk:60,oil:15,salt:1,pepper:0.5",
    "Heat the oven to 200°C (400°F).//In an oven-safe pan, cook the sliced onion, potato if using, and the vegetable in the oil for 6 to 8 minutes until tender.//Beat the eggs with the milk, salt, pepper and half the cheese. Pour over the vegetables.//Top with the remaining cheese. Cook on the stove 2 minutes to set the edges, then bake 10 to 12 minutes until puffed and set in the middle."
  ],
  [
    "Garlic Butter Chicken with Rice",
    "d",
    2,
    35,
    1,
    "chicken_breast:400,rice:200,garlic:4,butter:30,broccoli:200|spinach:100|zucchini:1,lemon:0.5?,paprika:1,salt:2,pepper:1,oil:15",
    "Start the rice in a pot with twice its volume of water and a pinch of salt. Cover and simmer on low about 15 minutes.//Cut the chicken into thick strips and season with salt, pepper and paprika.//Sear in the oil over medium-high heat 4 minutes per side until golden and cooked through. Remove to a plate.//In the same pan, melt the butter, add the garlic for 30 seconds, then the vegetables. Cook 4 to 5 minutes.//Return the chicken to the pan and spoon the garlic butter over. Squeeze on lemon if using. Serve over rice."
  ],
  [
    "Spaghetti Pomodoro",
    "d",
    2,
    25,
    1,
    "pasta:250,canned_tomatoes:400,garlic:3,onion:0.5,oil:30,oregano:1,cheese:30?,salt:2,pepper:0.5",
    "Warm the oil and soften the finely chopped onion for 5 minutes. Add the garlic for 30 seconds.//Add the tomatoes, oregano, salt and pepper. Simmer 15 minutes, crushing the tomatoes with a spoon.//Meanwhile boil the pasta in salted water until al dente. Reserve a mug of cooking water.//Toss the pasta in the sauce, loosening with a splash of cooking water. Top with grated cheese."
  ],
  [
    "Creamy Mushroom Pasta",
    "d",
    2,
    25,
    1,
    "pasta:250,mushroom:250,garlic:3,milk:150|coconut_milk:150,butter:20,cheese:40?,flour:10,salt:2,pepper:1",
    "Boil the pasta in salted water until al dente. Reserve a mug of cooking water.//Brown the sliced mushrooms in the butter over high heat for 6 minutes without crowding the pan.//Add the garlic for 30 seconds, then stir in the flour for 1 minute.//Slowly pour in the milk, stirring, and simmer 3 minutes until it coats a spoon. Add salt and pepper.//Toss in the pasta and cheese, loosening with cooking water as needed."
  ],
  [
    "Chicken Curry",
    "d",
    3,
    40,
    2,
    "chicken_breast:450,onion:1,garlic:3,ginger:10?,curry_powder:10,coconut_milk:400,rice:240,oil:20,spinach:60?,salt:2",
    "Start the rice in twice its volume of water. Cover and simmer on low about 15 minutes.//Soften the diced onion in the oil for 6 minutes. Add the garlic, ginger and curry powder and cook 1 minute.//Add the cubed chicken and stir to coat. Cook 4 minutes.//Pour in the coconut milk and salt. Simmer gently 15 to 20 minutes until the chicken is cooked and the sauce thickens.//Stir in the spinach for the last 2 minutes. Serve over rice."
  ],
  [
    "Beef and Bean Chili",
    "d",
    4,
    50,
    2,
    "ground_beef:450,onion:1,garlic:3,canned_tomatoes:400,black_beans:240,bell_pepper:1,paprika:2,cumin:2,chili_flakes:0.5?,oil:15,salt:2,rice:200?",
    "Brown the beef in the oil in a large pot over medium-high heat, breaking it up, 6 to 8 minutes.//Add the chopped onion and pepper and cook 5 minutes. Stir in the garlic, paprika, cumin and chili flakes for 1 minute.//Add the tomatoes, drained beans, salt and 200 ml of water.//Simmer uncovered 25 to 30 minutes, stirring now and then, until thick.//Serve with rice if you have it."
  ],
  [
    "Lemon Salmon with Roasted Potatoes",
    "d",
    2,
    40,
    2,
    "salmon:360,potato:3,lemon:1,oil:30,garlic:2,broccoli:150?,paprika:1?,salt:2,pepper:1",
    "Heat the oven to 220°C (425°F).//Cut the potatoes into 2 cm chunks, toss with two thirds of the oil, salt, pepper and paprika. Roast 20 minutes.//Rub the salmon with the remaining oil, minced garlic, salt, pepper and lemon zest. Add the broccoli to the tray if using.//Nestle the salmon on the tray and roast 10 to 12 minutes until it flakes easily.//Squeeze lemon over everything before serving."
  ],
  [
    "Garlic Shrimp and Rice",
    "d",
    2,
    25,
    1,
    "shrimp:300,rice:200,garlic:4,butter:25,lemon:0.5,green_onion:2?,soy_sauce:15?,chili_flakes:0.5?,frozen_peas:60?,salt:1,pepper:0.5",
    "Start the rice in twice its volume of water. Cover and simmer on low about 15 minutes. Stir in the peas for the last 3 minutes if using.//Pat the shrimp dry and season with salt and pepper.//Melt the butter over medium-high heat. Add the garlic and chili flakes for 30 seconds.//Add the shrimp and cook 2 minutes per side until pink and curled. Add the soy sauce and lemon juice.//Serve over the rice with sliced green onion."
  ],
  [
    "Coconut Chickpea Curry",
    "d",
    3,
    35,
    1,
    "chickpeas:240,coconut_milk:400,onion:1,garlic:3,sweet_potato:1|potato:2,spinach:80,curry_powder:10,rice:240,oil:15,salt:2",
    "Start the rice in twice its volume of water. Cover and simmer on low about 15 minutes.//Soften the diced onion in the oil for 5 minutes. Add the garlic and curry powder for 1 minute.//Add the cubed sweet potato or potato, coconut milk, drained chickpeas, salt and 100 ml of water.//Simmer 15 to 20 minutes until the potato is tender.//Stir in the spinach until wilted and serve over rice."
  ],
  [
    "Sausage and Veggie Sheet Pan",
    "d",
    2,
    40,
    1,
    "sausage:4,potato:3,bell_pepper:1|zucchini:1|carrot:2,onion:1,oil:30,paprika:1,salt:2,pepper:1",
    "Heat the oven to 220°C (425°F).//Cut the potatoes into small chunks and the vegetables and onion into similar-sized pieces. Toss with the oil, paprika, salt and pepper on a large tray.//Roast the potatoes and vegetables for 15 minutes.//Add the sausages to the tray and roast another 20 to 25 minutes, turning once, until browned and cooked through."
  ],
  [
    "Chicken Veggie Stir-Fry",
    "d",
    2,
    25,
    1,
    "chicken_breast:300,rice:200,bell_pepper:1|zucchini:1,broccoli:150|mushroom:150,carrot:1,soy_sauce:45,garlic:3,ginger:10?,honey:10?,oil:20,pepper:0.5",
    "Start the rice in twice its volume of water. Cover and simmer on low about 15 minutes.//Slice the chicken thinly. Mix the soy sauce, honey, pepper and 2 tbsp of water for the sauce.//Stir-fry the chicken in half the oil over high heat 4 to 5 minutes until cooked. Remove.//Stir-fry the vegetables in the remaining oil for 4 minutes, adding garlic and ginger for the last minute.//Return the chicken, pour in the sauce and toss 1 to 2 minutes. Serve over rice."
  ],
  [
    "Stovetop Mac and Cheese",
    "d",
    3,
    25,
    1,
    "pasta:250,cheese:180,milk:300,butter:30,flour:20,broccoli:100?,paprika:1?,salt:2,pepper:0.5",
    "Boil the pasta in salted water until just tender, adding the broccoli for the last 2 minutes if using. Drain.//In the same pot, melt the butter and stir in the flour for 1 minute.//Slowly whisk in the milk and cook 4 to 5 minutes until thickened.//Off the heat, stir in the cheese until melted. Season with salt, pepper and paprika.//Fold the pasta back in and serve straight away."
  ],
  [
    "Crispy Tofu and Veg Stir-Fry",
    "d",
    2,
    30,
    2,
    "tofu:300,rice:200,soy_sauce:45,broccoli:200|bell_pepper:1|zucchini:1,carrot:1,garlic:3,ginger:10?,peanut_butter:20?,oil:25,chili_flakes:0.5?",
    "Start the rice in twice its volume of water. Cover and simmer on low about 15 minutes.//Press the tofu dry and cut into cubes. Fry in half the oil over medium-high heat 8 to 10 minutes, turning, until crisp. Remove.//Stir-fry the vegetables in the remaining oil for 4 minutes. Add the garlic and ginger for 1 minute.//Whisk the soy sauce with the peanut butter and a splash of water. Add it with the tofu and toss for 2 minutes.//Serve over rice."
  ],
  [
    "Loaded Baked Potatoes",
    "d",
    2,
    55,
    1,
    "potato:4,cheese:80,bacon:4|broccoli:150|black_beans:150,yogurt:60?,green_onion:2?,butter:20,oil:10,salt:2,pepper:0.5",
    "Heat the oven to 210°C (410°F). Prick the potatoes, rub with oil and salt, and bake 45 to 50 minutes until soft.//Meanwhile cook the bacon until crisp and crumble it, or steam the broccoli, or warm the beans.//Split the hot potatoes, fluff the insides with butter, salt and pepper.//Top with cheese, the chosen filling, yogurt and sliced green onion."
  ],
  [
    "Spaghetti Aglio e Olio",
    "d",
    2,
    20,
    1,
    "pasta:250,garlic:6,oil:60,chili_flakes:1,spinach:60?,cheese:30?,lemon:0.5?,salt:3,pepper:0.5",
    "Boil the pasta in very well-salted water until al dente. Reserve a mug of cooking water.//Warm the oil over low heat and slowly cook the thinly sliced garlic and chili flakes for 3 to 4 minutes until pale gold. Do not let it brown.//Add the pasta and a splash of cooking water. Toss over the heat for 1 to 2 minutes until glossy. Wilt in the spinach if using.//Finish with pepper, cheese and a squeeze of lemon."
  ],
  [
    "Apple Cinnamon Warm Oats",
    "b",
    2,
    12,
    1,
    "oats:100,milk:320,apple:1,cinnamon:1,honey:10?,yogurt:60?",
    "Dice the apple and add half to a saucepan with oats and milk.//Simmer over medium-low heat for 6–8 minutes, stirring often.//Stir in the cinnamon. Divide between bowls, then top with the remaining apple and optional yogurt or honey."
  ],
  [
    "Banana Yogurt Smoothie",
    "b",
    2,
    5,
    1,
    "banana:2,yogurt:250,milk:200,berries:100?,honey:10?",
    "Peel the bananas and place them in a blender with yogurt and milk.//Add berries or honey if using.//Blend until smooth; pour into two glasses and serve immediately."
  ],
  [
    "Garlic Mushroom Toast",
    "l",
    2,
    15,
    1,
    "mushroom:200,bread:4,garlic:2,butter:20,cheese:30?,pepper:0.5",
    "Toast the bread until crisp.//Slice the mushrooms and cook in butter over medium-high heat for 5 minutes until browned.//Add the chopped garlic and pepper; cook another minute.//Spoon over the toast and finish with cheese if using."
  ],
  [
    "Tomato Egg Rice Bowls",
    "ld",
    2,
    20,
    1,
    "rice:160,egg:2,tomato:2,green_onion:1,oil:15,soy_sauce:10?",
    "Cook the rice according to its package instructions.//Dice tomatoes and slice the green onion.//Scramble eggs in half the oil, then set aside.//Cook tomatoes in the remaining oil for 3 minutes, return eggs to the pan, and season with soy sauce if using.//Serve over rice with green onion."
  ],
  [
    "Lemon Garlic Chickpea Pasta",
    "ld",
    2,
    20,
    1,
    "pasta:200,chickpeas:200,lemon:0.5,garlic:2,oil:20,spinach:50?,pepper:0.5",
    "Cook the pasta until tender, reserving a little cooking water.//Drain and rinse the chickpeas. Warm the oil with chopped garlic for one minute.//Add chickpeas, lemon juice and spinach if using; cook for two minutes.//Toss with pasta and a splash of cooking water. Add pepper and serve."
  ],
  [
    "Broccoli Cheese Rice Bowls",
    "ld",
    2,
    25,
    1,
    "rice:160,broccoli:200,cheese:80,milk:50,butter:10,pepper:0.5",
    "Cook the rice according to its package instructions.//Steam or simmer broccoli for 4–5 minutes until tender.//Gently heat milk and butter, then stir in the cheese until smooth.//Divide rice and broccoli between bowls, spoon over the cheese sauce and season with pepper."
  ],
  [
    "Garlic Tomato Chickpea Skillet",
    "ld",
    2,
    20,
    1,
    "chickpeas:240,canned_tomatoes:200,garlic:2,onion:0.5,oil:15,paprika:1,bread:2?",
    "Finely chop the onion and garlic. Cook the onion in oil for 4 minutes, then add garlic and paprika for 30 seconds.//Add the canned tomatoes and drained chickpeas. Simmer gently for 10 minutes until thick.//Serve warm on its own or with toasted bread if available."
  ]
];
