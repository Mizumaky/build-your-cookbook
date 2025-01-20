export interface FoodItem {
    _id: Number;
    name: string;
    type: string;
}
export interface Recipe extends FoodItem {
    steps: string[];
    ingredients: RecipeIngredient[];
}
  
export interface RecipeIngredient {
    item_id: Number;
    quantity: number;
    unit: string;
}
export interface Ingredient extends FoodItem {
    default_unit: string,
    special_units?: { unit: string, conversion_factor: number }[]
    nutrition?: {
        calories: number,
        carbohydrates: number,
        protein: number
    }
}

export function isRecipe(foodItem: FoodItem): foodItem is Recipe {
    return foodItem.type === 'recipe';
  }
  
  export function isIngredient(foodItem: FoodItem): foodItem is Ingredient {
    return foodItem.type === 'ingredient';
  }