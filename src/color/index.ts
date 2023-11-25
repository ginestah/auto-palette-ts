import { radianToDegree } from '../math';

import { cie76, ColorDifference, DifferenceFunction } from './difference';
import { CIELabSpace, HSLSpace, RGBSpace, XYZSpace } from './space';
import { HSL, LAB, RGB } from './types';

export * from './difference';
export * from './space';
export * from './types';

/**
 * Color class represents a color in any color space.
 */
export class Color {
  /**
   * Create a new color instance.
   * @param l The lightness component of the color.
   * @param a The a component of the color.
   * @param b The b component of the color.
   * @throws {TypeError} If the l, a, or b is not finite number.
   */
  constructor(
    private readonly l: number,
    private readonly a: number,
    private readonly b: number,
  ) {
    if (!Number.isFinite(l) || !Number.isFinite(a) || !Number.isFinite(b)) {
      throw new TypeError(`The l, a, and b components must be finite numbers: ${l}, ${a}, ${b}`);
    }
    this.l = CIELabSpace.clampL(l);
    this.a = CIELabSpace.clampA(a);
    this.b = CIELabSpace.clampB(b);
  }

  /**
   * Check if the color is light.
   *
   * @returns True if the color is light, false otherwise.
   * @see isDark
   */
  get isLight() {
    return this.l > 50;
  }

  /**
   * Check if the color is dark.
   *
   * @returns True if the color is dark, false otherwise.
   * @see isLight
   */
  get isDark() {
    return !this.isLight;
  }

  /**
   * Calculate the lightness of the color.
   *
   * @returns The lightness of the color.
   */
  get luminance() {
    return this.l;
  }

  /**
   * Clone the color.
   *
   * @returns The cloned color.
   */
  clone(): Color {
    return new Color(this.l, this.a, this.b);
  }

  /**
   * Calculate the chroma of the color.
   *
   * @returns The chroma of the color.
   */
  chroma() {
    return Math.sqrt(this.a ** 2 + this.b ** 2);
  }

  /**
   * Calculate the hue of the color.
   *
   * @returns The hue of the color.
   */
  hue() {
    return radianToDegree(Math.atan2(this.b, this.a));
  }

  /**
   * Compute the color difference between this color and the other color.
   *
   * @param other The other color.
   * @param formula The formula to use to compute the color difference.
   * @returns The color difference.
   */
  differenceTo(other: Color, formula: DifferenceFunction<LAB> = cie76): ColorDifference {
    return formula({ l: this.l, a: this.a, b: this.b }, { l: other.l, a: other.a, b: other.b });
  }

  /**
   * Convert the color to RGB color space.
   *
   * @returns The color in RGB color space.
   */
  toRGB(): RGB {
    const xyz = CIELabSpace.toXYZ({ l: this.l, a: this.a, b: this.b });
    return XYZSpace.toRGB(xyz);
  }

  /**
   * Convert the color to HSL color space.
   *
   * @returns The color in HSL color space.
   */
  toHSL(): HSL {
    const rgb = this.toRGB();
    return HSLSpace.fromRGB(rgb);
  }

  /**
   * Convert the color to hex decimal string.
   *
   * @returns The color in hex decimal string.
   */
  toHexString(): string {
    const rgb = this.toRGB();
    return RGBSpace.toHexString(rgb);
  }

  /**
   * Parse the value to a color.
   *
   * @param value - The value to be parsed to a color.
   * @returns The parsed color.
   * @throws {TypeError} If the value is not parsable to a color.
   */
  static parse(value: unknown): Color {
    if (value instanceof Color) {
      return value.clone();
    }

    if (typeof value === 'string') {
      if (value.startsWith('#')) {
        const rgb = RGBSpace.fromHexString(value);
        const xyz = XYZSpace.fromRGB(rgb);
        const lab = CIELabSpace.fromXYZ(xyz);
        return new Color(lab.l, lab.a, lab.b);
      }
    }

    throw new TypeError(`The value(${value}) is not parsable to a color.`);
  }
}
