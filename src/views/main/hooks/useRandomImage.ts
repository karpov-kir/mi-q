import { useEffect, useState } from 'react';

import { unsplashRandomImageCache } from '../../../caches';
import { ImageModel } from '../../../models';
import { DayTime } from '../../../utils';

export function useRandomImage() {
  const [image, setImage] = useState<ImageModel | undefined>();

  // Request initial image
  useEffect(() => {
    // Should never fail as the cache hase a default value
    unsplashRandomImageCache
      .getItem()
      .then((newImage) =>
        waitUntilImageIsLoaded(newImage.source)
          .catch(() => console.warn('Could not wait until image is loaded'))
          .then(() => newImage),
      )
      .then(setImage);
  }, []);

  // Request a new image once a new period of the day is started
  useEffect(() => {
    startUpdateTimer();

    function startUpdateTimer() {
      setTimeout(() => {
        // Should never fail as the cache hase a default value
        unsplashRandomImageCache
          .removeItem()
          .then(() => unsplashRandomImageCache.getItem())
          .then((newImage) =>
            waitUntilImageIsLoaded(newImage.source)
              .catch(() => console.warn('Could not wait until image is loaded'))
              .then(() => newImage),
          )
          .then(setImage)
          .then(() => startUpdateTimer());
      }, DayTime.getTimeUntilNextPeriodStart());
    }
  }, []);

  return image;
}

function waitUntilImageIsLoaded(source: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = function () {
      resolve();
    };

    image.onerror = function () {
      reject(new Error('Could not load image'));
    };

    image.src = source;
  });
}
