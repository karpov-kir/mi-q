// https://github.com/unsplash/unsplash-js

interface Entity {
  id: string;
}

type Nullable<T> = T | null;

interface BasicUser extends Entity {
  bio: Nullable<string>;
  first_name: string;
  instagram_username: Nullable<string>;
  last_name: Nullable<string>;
  links: {
    followers: string;
    following: string;
    html: string;
    likes: string;
    photos: string;
    portfolio: string;
    self: string;
  };
  location: Nullable<string>;
  name: string;
  portfolio_url: Nullable<string>;
  profile_image: {
    small: string;
    medium: string;
    large: string;
  };
  total_collections: number;
  total_likes: number;
  total_photos: number;
  twitter_username: Nullable<string>;
  updated_at: string;
  username: string;
}

interface VeryBasicRandomPhoto extends Entity {
  created_at: string;
  updated_at: string;
  urls: {
    full: string;
    raw: string;
    regular: string;
    small: string;
    thumb: string;
  };
}

interface BasicRandomPhoto extends VeryBasicRandomPhoto {
  alt_description: Nullable<string>;
  blur_hash: Nullable<string>;
  color: Nullable<string>;
  description: Nullable<string>;
  height: number;
  likes: number;
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
  promoted_at: Nullable<string>;
  width: number;
  user: BasicUser;
}

interface ExifAndLocation {
  exif: {
    make: Nullable<string>;
    model: Nullable<string>;
    exposure_time: Nullable<string>;
    aperture: Nullable<string>;
    focal_length: Nullable<string>;
    iso: Nullable<number>;
  };
  location: {
    city: Nullable<string>;
    country: Nullable<string>;

    /** full string representation of the location, including `city` and `country` if they exist. */
    name: Nullable<string>;

    position: {
      latitude: Nullable<number>;
      longitude: Nullable<number>;
    };
  };
}

export interface RandomPhoto extends BasicRandomPhoto, ExifAndLocation {}
