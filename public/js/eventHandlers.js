import { performSearch } from './search.js';
import { clearVisualization, clearSearchHistory, addToSearchMemory } from './utils.js';

export function setupEventListeners() {
  const searchButton = document.querySelector('#search-button');
  const searchInput = document.querySelector('#search-input');
  const clearHistoryBtn = document.querySelector('#clear-history-btn');
  const clearVisualizationBtn = document.querySelector('#clear-visualization-btn');

  searchButton.addEventListener('click', () => performSearch(searchInput.value.trim()));
  
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const firstSuggestion = document.querySelector('.autocomplete-suggestion');
      if (firstSuggestion) {
        searchInput.value = firstSuggestion.textContent;
        document.querySelector('#autocomplete-container').innerHTML = '';
      }
      performSearch(searchInput.value.trim());
    }
  });

  clearHistoryBtn.addEventListener('click', () => {
    clearSearchHistory();
    clearVisualization();
  });

  clearVisualizationBtn.addEventListener('click', clearVisualization);

  searchInput.addEventListener('input', () => {
    const inputValue = searchInput.value.trim();
    if (inputValue === '') {
      clearVisualization();
      document.querySelector('#autocomplete-container').innerHTML = '';
    } else {
      updateAutocompleteSuggestions(inputValue);
    }
  });
}