import { useState, useEffect } from 'react';
import './App.css';
import { FoodItem, isRecipe, isIngredient } from './types/item';
import { useDebounce } from './utils/debouncing';
import { getErrorMessage } from './utils/errorHandling';

function App() {
  const [foodItems, setSearchResults] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300); // 300ms delay
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const itemsPerPage = 3; // Number of items per page  
  const [deepSearch, setDeepSearch] = useState(false); // New state variable
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError("");
      try {
        const endpoint = '/.netlify/functions/get_recipes';
        const response = await fetch(`${endpoint}?query=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${itemsPerPage}&deep=${deepSearch}&all=${true}`);
        if (!response.ok) throw new Error(`Error fetching recipes: ${response.statusText}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error('Failed to fetch recipes:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [debouncedQuery, deepSearch, currentPage]); // Refetch whenever one of these changes

  // const filteredFoodItems = searchQuery
  //   ? foodItems.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  //   : foodItems;

  return (
    <div className="app-container">
      <h1>Search your cookbook</h1>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for recipes..."
      />
      <label>
        <input
          type="checkbox"
          checked={deepSearch}
          onChange={() => setDeepSearch(!deepSearch)}
        />
        Deep search
      </label>
      <div className="search-results">
        <h2>Search Results</h2>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        <ul>
        {!loading && foodItems.map(foodItem => {
          if (isRecipe(foodItem)) {
            // foodItem is now typed as Recipe
            return (
              <li key={foodItem._id.toString()}>
                <h3>{foodItem.name}</h3>
                <p>{foodItem.steps.join(', ')}</p>
                <p>Ingredients:</p>
                <ul>
                  {foodItem.ingredients.map(ingredient => (
                    <li key={ingredient.item_id.toString()}>{ingredient.quantity} {ingredient.unit} of </li> // {ingredient.name}</li>
                  ))}
                </ul>
              </li>
            );
          } else if (isIngredient(foodItem)) {
            // foodItem is now typed as Ingredient
            return (
              <li key={foodItem._id.toString()}>
                <h3>{foodItem.name}</h3>
                <p>Default unit: {foodItem.default_unit}</p>
                <p>Special units: {foodItem.special_units?.map(unit => unit.unit).join(', ')}</p>
              </li>
            );
          } else {
            return (
              <li key={foodItem._id.toString()}>
                <pre>{JSON.stringify(foodItem, null, 2)}</pre>
              </li>
            );
          }
        })}
        </ul>
      </div>
      <div className="pagination">
        <button disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)}
        > Previous </button>
        <button onClick={() => setCurrentPage(currentPage + 1)}
        > Next </button>
      </div>
      <p>Page: {currentPage}</p>
    </div>
  );
}

export default App;