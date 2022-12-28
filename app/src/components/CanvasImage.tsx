import { decode } from 'blurhash';
import { ReactElement, useEffect, useRef, useState } from 'react';

import useImage from '../hooks/useImage';
import usePalette from '../hooks/usePalette';

interface Props {
  readonly src: string;

  readonly width: number;

  readonly height: number;

  readonly blurhash: string;
}

export default function CanvasImage({ src, width, height, blurhash }: Props): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image] = useImage(src, 'anonymous');
  const [context, setContext] = useState<CanvasRenderingContext2D>();

  usePalette(image);

  useEffect(() => {
    if (!image || !context) {
      return;
    }

    // Scale the image and fill the canvas.
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;

    const scale = Math.max(width / imageWidth, height / imageHeight);
    const scaledWidth = Math.round(imageWidth * scale);
    const scaledHeight = Math.round(imageHeight * scale);

    const positionX = Math.round(width - scaledWidth) / 2.0;
    const positionY = Math.round(height - scaledHeight) / 2.0;
    context.drawImage(image, 0, 0, imageWidth, imageHeight, positionX, positionY, scaledWidth, scaledHeight);
  }, [image, src]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const newContext = canvasRef.current.getContext('2d');
    if (newContext) {
      setContext(newContext);
    }
  }, [canvasRef]);

  useEffect(() => {
    // Prevent drawing the blurhash, if the image has been already loaded.
    if (image) {
      return;
    }

    if (!context) {
      return;
    }

    const pixels = decode(blurhash, width, height);
    const imageData = context.createImageData(width, height);
    imageData.data.set(pixels);
    context.clearRect(0, 0, width, height);
    context.putImageData(imageData, 0, 0);
  }, [context, blurhash]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
