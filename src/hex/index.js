/**
 * hex/index.js - Public API for hex module
 * Re-exports coordinate helpers, grid utilities, and spiral functions.
 */

// Coordinate helpers and constants
export {
  hexKey,
  parseHexKey,
  DIR,
  CLOCKWISE_AFTER_EAST,
  AXIAL_DIRECTIONS,
  axialDistance,
  distanceBetween,
  ringIndex,
  hexCountForRadius,
  inRadiusBoard,
  areAxialNeighbors,
} from './coords.js';

// Grid generation and queries
export {
  generateHexGrid,
  getAllHexes,
  getHexesByRing,
  getNeighborOffsets,
  getNeighbors,
  getValidNeighbors,
  getHexesInRange,
  findPathTowardCenter,
} from './grid.js';

// Spiral labeling
export {
  generateRadialSpiralAxial,
  getSpiralData,
  getSpiralLabel,
  getSpiralAxial,
  neighborsOfLabel,
} from './spiral.js';
