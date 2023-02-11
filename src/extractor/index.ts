import { DBSCAN, euclidean, HDBSCAN, Kmeans, Point5, squaredEuclidean } from '../math';
import { RGB } from '../types';

import { Extractor } from './extractor';
import { type ColorFilter, opacity } from './filter';

export type { ColorFilter } from './filter';
export { DeltaEWeightFunction } from './deltaEWeightFunction';

/**
 * Type representing DBSCAN options.
 */
export type DBSCANOptions = {
  readonly minPoints: number;
  readonly threshold: number;
  readonly colorFilters: ColorFilter<RGB>[];
};

const DEFAULT_DBSCAN_OPTIONS: DBSCANOptions = {
  minPoints: 9,
  threshold: 0.04,
  colorFilters: [opacity()],
};

/**
 * Create a new extractor using DBSCAN.
 *
 * @param options The options for the extractor.
 * @return The DBSCAN extractor.
 */
export function dbscanExtractor(options: Partial<DBSCANOptions> = {}): Extractor {
  const { minPoints, threshold, colorFilters } = { ...DEFAULT_DBSCAN_OPTIONS, ...options };
  const dbscan = new DBSCAN<Point5>(minPoints, threshold, euclidean());
  return new Extractor(dbscan, colorFilters);
}

/**
 * Type representing HDBSCAN options.
 */
export type HDBSCANOptions = {
  readonly minPoints: number;
  readonly minClusterSize: number;
  readonly colorFilters: ColorFilter<RGB>[];
};

const DEFAULT_HDBSCAN_OPTIONS: HDBSCANOptions = {
  minPoints: 9,
  minClusterSize: 9,
  colorFilters: [opacity()],
};

/**
 * Create a new extractor using HDBSCAN.
 *
 * @param options The options for the extractor.
 * @return The HDBSCAN extractor.
 */
export function hdbscanExtractor(options: Partial<HDBSCANOptions> = {}): Extractor {
  const { minPoints, minClusterSize, colorFilters } = { ...DEFAULT_HDBSCAN_OPTIONS, ...options };
  const hdbscan = new HDBSCAN<Point5>(minPoints, minClusterSize, euclidean());
  return new Extractor(hdbscan, colorFilters);
}

/**
 * Type representing Kmeans options.
 */
export type KmeansOptions = {
  readonly maxColors: number;
  readonly maxIterations: number;
  readonly tolerance: number;
  readonly colorFilters: ColorFilter<RGB>[];
};

const DEFAULT_KMEANS_OPTIONS: KmeansOptions = {
  maxColors: 25,
  maxIterations: 10,
  tolerance: 0.25,
  colorFilters: [opacity()],
};

/**
 * Create a new extractor using Kmeans.
 *
 * @param options The options for the extractor.
 * @return The Kmeans extractor.
 */
export function kmeansExtractor(options: Partial<KmeansOptions> = {}): Extractor {
  const { maxColors, maxIterations, tolerance, colorFilters } = { ...DEFAULT_KMEANS_OPTIONS, ...options };
  const kmeans = new Kmeans<Point5>(maxColors, maxIterations, tolerance, squaredEuclidean());
  return new Extractor(kmeans, colorFilters);
}
