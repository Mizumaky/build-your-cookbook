import { useState } from 'react';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="app-container">
      <h1>Search your cookbook</h1>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for recipes..."
      />
      <div className="search-results">
        <h2>Search Results</h2>
        <div className="recipe-card">
          <h3>Homemade Garlic-Ginger Paste</h3>
          <p>A delicious and easy-to-make paste made with garlic and ginger.</p>
        </div>
      </div>
    </div>
  );
}

export default App;