import { ImageModel } from '../models';
import { ImageRepository } from '../repositories';
import { AsyncCache, PersistedStorage } from '../services';

const UNSPLASH_RANDOM_IMAGE_CACHE_TTL = 30 * 60 * 1000;
export const unsplashRandomImageCache = new AsyncCache<ImageModel>(
  UNSPLASH_RANDOM_IMAGE_CACHE_TTL,
  new PersistedStorage('image'),
  {
    source:
      'https://images.unsplash.com/photo-1564907587809-3e1969b66ad3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80',
    author: {
      name: 'Dan Meyers',
      url: 'https://unsplash.com/@dmey503',
    },
  },
);
unsplashRandomImageCache.setSource(() => new ImageRepository().getRandomImage());
