import { color } from '../color';
import { Image } from '../image';
import { Palette } from '../palette';
import { Algorithm, Builder, Color, ImageData, Options, PackedColor, Swatch } from '../types';
import { id, ID } from '../utils';

import { RequestMessage, Response } from './message';
import { defaultWorker } from './worker';

const defaults: Options = {
  algorithm: 'kmeans',
  maxColors: 5,
  maxImageSize: 128 * 128,
} as const;

/**
 * Asynchronous palette builder.
 */
export class PaletteBuilder implements Builder {
  private readonly id: ID;

  /**
   * Create a new PaletteWorker.
   *
   * @param image The image object.
   * @param worker The worker instance.
   */
  constructor(private readonly image: Image, private readonly worker: Worker = defaultWorker()) {
    this.id = id();
  }

  /**
   * Generate a palette from the image data.
   *
   * @return {Promise<Palette>}
   */
  async build(options: Partial<Options> = {}): Promise<Palette> {
    const merged = { ...defaults, ...options };
    const resized = await this.image.resize(merged.maxImageSize);
    const imageData = await resized.getImageData();
    return await this.execute(imageData, merged);
  }

  private execute(imageData: ImageData<Uint8ClampedArray>, options: Options): Promise<Palette> {
    return new Promise((resolve, reject) => {
      const message = this.buildRequest(imageData, options.algorithm, options.maxColors);
      this.worker.addEventListener('message', (event: MessageEvent<Response>) => {
        if (event.data.payload.id !== this.id) {
          return;
        }

        try {
          const palette = this.onMessage(event);
          resolve(palette);
        } catch (e) {
          reject(e);
        }
      });

      this.worker.addEventListener('error', (event: ErrorEvent) => {
        reject(new Error(event.message));
      });

      this.worker.postMessage(message, [message.payload.imageData.data]);
    });
  }

  private onMessage(event: MessageEvent<Response>): Palette {
    const { type, payload } = event.data;
    switch (type) {
      case 'response': {
        const colors = payload.results.map((result: Swatch<PackedColor>): Swatch<Color> => {
          return {
            color: color(result.color),
            population: result.population,
          };
        });
        return new Palette(colors);
      }

      case 'error': {
        const message = payload.message;
        throw new Error(message);
      }

      default: {
        throw new Error(`Unrecognized type of data is received: ${event}`);
      }
    }
  }

  private buildRequest(
    imageData: ImageData<Uint8ClampedArray>,
    algorithm: Algorithm,
    maxColors: number,
  ): RequestMessage {
    const { height, width, data } = imageData;
    const image: ImageData<ArrayBuffer> = {
      height,
      width,
      data: data.buffer,
    };

    return {
      type: 'request',
      payload: {
        id: this.id,
        imageData: image,
        algorithm,
        maxColors,
      },
    };
  }
}
