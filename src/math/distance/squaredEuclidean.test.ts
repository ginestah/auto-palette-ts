import { beforeEach, describe, expect, it } from 'vitest';

import { DistanceFunction, Point2 } from '../types';

import { SquaredEuclideanDistance } from './squaredEuclidean';

describe('SquaredEuclideanDistance', () => {
  let squaredEuclideanDistance: DistanceFunction<Point2>;
  beforeEach(() => {
    squaredEuclideanDistance = new SquaredEuclideanDistance();
  });

  describe('compute', () => {
    it('should compute squared euclidean distance between 2 points', () => {
      // Act
      const actual = squaredEuclideanDistance.compute([0, 0], [1, 2]);

      // Assert
      expect(actual).toEqual(5);
    });

    it('should throw TypeError if any component contain infinite number', () => {
      // Assert
      expect(() => {
        // Act
        squaredEuclideanDistance.compute([NaN, 0], [1, 2]);
      }).toThrowError(TypeError);
    });
  });
});