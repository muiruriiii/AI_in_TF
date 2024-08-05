export function addToSearchMemory(searchTerm) {
    let searchMemory = JSON.parse(localStorage.getItem('searchMemory')) || [];
    if (!searchMemory.includes(searchTerm)) {
      searchMemory.unshift(searchTerm);
      localStorage.setItem('searchMemory', JSON.stringify(searchMemory));
    }
  }
  
  export function getSearchMemory() {
    return JSON.parse(localStorage.getItem('searchMemory')) || [];
  }
  
  export function showLoaders() {
    document.querySelectorAll('.loader-container').forEach(loader => {
      loader.style.display = 'flex';
    });
  }
  
  export function hideLoaders() {
    document.querySelectorAll('.loader-container').forEach(loader => {
      loader.style.display = 'none';
    });
  }
  
  export function clearVisualization() {
    d3.select('#sub-diagram1 svg').remove();
    d3.select('#sub-diagram2 svg').remove();
  }
  
  export function clearSearchHistory() {
    localStorage.removeItem('searchHistory');
    document.querySelector('#search-history-list').innerHTML = '';
  }
  
  export function setupAutoComplete() {
    const searchInput = document.querySelector('#search-input');
    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.id = 'autocomplete-container';
    searchInput.parentNode.insertBefore(autocompleteContainer, searchInput.nextSibling);
  
    searchInput.addEventListener('input', () => {
      const inputValue = searchInput.value.trim();
      if (inputValue === '') {
        autocompleteContainer.innerHTML = '';
      } else {
        updateAutocompleteSuggestions(inputValue);
      }
    });
  }
  
  function updateAutocompleteSuggestions(input) {
    const searchMemory = getSearchMemory();
    const matchingTerms = searchMemory.filter(term => fuzzyMatch(input, term));
    
    const autocompleteContainer = document.querySelector('#autocomplete-container');
    autocompleteContainer.innerHTML = '';
  
    matchingTerms.forEach(term => {
      const suggestion = document.createElement('div');
      suggestion.classList.add('autocomplete-suggestion');
      suggestion.textContent = term;
      suggestion.addEventListener('click', () => {
        document.querySelector('#search-input').value = term;
        autocompleteContainer.innerHTML = '';
        performSearch(term);
      });
      autocompleteContainer.appendChild(suggestion);
    });
  }
  
  function fuzzyMatch(input, target) {
    input = input.toLowerCase();
    target = target.toLowerCase();
    let i = 0;
    let j = 0;
    while (i < input.length && j < target.length) {
      if (input[i] === target[j]) {
        i++;
      }
      j++;
    }
    return i === input.length;
  }