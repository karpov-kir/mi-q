import { ImageModel } from '../../models';

export interface ImageRepositoryInterface {
  getRandomImage: () => Promise<ImageModel>;
}
