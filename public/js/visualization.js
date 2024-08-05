import { createSubDiagram1, createSubDiagram2 } from './charts.js';
import { hideLoaders } from './utils.js';

export function createVisualization(allSearches) {
  console.log("Creating visualization");

  d3.select('#sub-diagram1 svg').remove();
  d3.select('#sub-diagram2 svg').remove();

  hideLoaders();
  createSubDiagram1(allSearches[allSearches.length - 1]);
  createSubDiagram2(allSearches);
}