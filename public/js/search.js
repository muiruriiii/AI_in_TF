import { createVisualization } from './visualization.js';
import { displayFormattedResults } from './formatters.js';
import { addToSearchMemory, showLoaders, hideLoaders } from './utils.js';

export async function performSearch(searchTerm) {
  showLoaders();
  if (searchTerm === '') return;

  addToSearchMemory(searchTerm);

  try {
    const data = await fetchSearchResults(searchTerm);
    createVisualization([data]);
    displayFormattedResults(data);
  } catch (error) {
    hideLoaders();
    console.error('Error fetching search results:', error);
    document.querySelector('#sub-result1').innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

async function fetchSearchResults(searchTerm) {
  const response = await fetch('http://localhost:5500/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ term: searchTerm })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch search results');
  }

  return response.json();
}