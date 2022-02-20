import axios from 'axios';

import { DayTime, DayTimeName } from '../../utils';
import { ImageRepository } from './ImageRepository';
import { RandomPhoto } from './unsplashTypes';

const imageRepository = new ImageRepository();
const axiosGetSpy = jest.spyOn(axios, 'get');
const randomPhoto = {
  urls: {
    full: 'http://full?a=b',
    raw: 'http://raw?a=b',
  },
  user: {
    name: 'John Doe',
    links: {
      photos: 'http://user-photos',
    },
    total_photos: 500,
  },
  location: {
    name: 'Fake location',
  },
} as RandomPhoto;

describe(ImageRepository, () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axiosGetSpy.mockResolvedValue({
      data: randomPhoto,
    });
  });

  it('should get a random image', async () => {
    await expect(imageRepository.getRandomImage()).resolves.toEqual({
      author: {
        name: randomPhoto.user.name,
        url: randomPhoto.user.links.photos,
      },
      source: randomPhoto.urls.raw + '&w=1920&fm=jpg&q=95',
    });
  });

  it('should request a random image with a valid query', async () => {
    const expectedBaseQueryParams = {
      orientation: 'landscape',
      topics: 'featured',
    };

    jest.spyOn(DayTime, 'getName').mockReturnValue(DayTimeName.Morning);
    jest.spyOn(Math, 'random').mockReturnValue(0);
    await imageRepository.getRandomImage();

    jest.spyOn(DayTime, 'getName').mockReturnValue(DayTimeName.Evening);
    jest.spyOn(Math, 'random').mockReturnValue(1);
    await imageRepository.getRandomImage();

    jest.spyOn(DayTime, 'getName').mockReturnValue(DayTimeName.Night);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    await imageRepository.getRandomImage();

    expect(axiosGetSpy).nthCalledWith(1, 'https://unsplash.com/napi/photos/random', {
      params: {
        ...expectedBaseQueryParams,
        query: 'travel morning',
      },
    });
    expect(axiosGetSpy).nthCalledWith(2, 'https://unsplash.com/napi/photos/random', {
      params: {
        ...expectedBaseQueryParams,
        query: 'nature evening',
      },
    });
    expect(axiosGetSpy).nthCalledWith(3, 'https://unsplash.com/napi/photos/random', {
      params: {
        ...expectedBaseQueryParams,
        query: 'nature night',
      },
    });
  });

  it('should throw an error if a request fails', async () => {
    axiosGetSpy.mockRejectedValue(new Error('Test'));

    await expect(imageRepository.getRandomImage()).rejects.toEqual(new Error('Test'));
  });
});
