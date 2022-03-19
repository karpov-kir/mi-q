import axios from 'axios';
import urlJoin from 'url-join';

import { DayTime } from '../../utils';
import { ImageRepositoryInterface } from './ImageRepositoryInterface';
import { RandomPhoto } from './unsplashTypes';

// Request URL: https://login.momentumdash.com/user/register?canceled=true

// Response headers:
// access-control-allow-credentials: true
// access-control-allow-origin: chrome-extension://laookkfknpbbblfpciffpaejjkokdgca
// access-control-expose-headers: x-momo-ts-notify
// content-encoding: gzip
// content-type: application/json; charset=utf-8
// date: Tue, 22 Mar 2022 06:37:20 GMT
// strict-transport-security: max-age=15724800; includeSubDomains; preload
// vary: Accept-Encoding
// vary: Origin

// Request headers:
// :authority: login.momentumdash.com
// :method: POST
// :path: /user/register?canceled=true
// :scheme: https
// accept: application/json, text/plain, */*
// accept-encoding: gzip, deflate, br
// accept-language: en-US,en;q=0.9,ru;q=0.8
// content-length: 36
// content-type: application/x-www-form-urlencoded
// origin: chrome-extension://laookkfknpbbblfpciffpaejjkokdgca
// sec-ch-ua: " Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"
// sec-ch-ua-mobile: ?0
// sec-ch-ua-platform: "Windows"
// sec-fetch-dest: empty
// sec-fetch-mode: cors
// sec-fetch-site: none
// user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36
// x-momentum-clientdate: 2022-03-22T09:37:19
// x-momentum-clientid: 9e2920ce-a209-47cc-ba49-1442440d81fa
// x-momentum-version: 2.5.53

// Response
// {"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2Nzk0NjcwMzkuMCwibmJmIjoxNjQ3OTMwNzM5LjAsImlzcyI6ImxvZ2luLWFwaS12MiIsInVzZXJfZ3VpZCI6IjA1YTk1M2ZlLTNlMGQtNGQwYi1hOTQzLWQ0MjI2ZWU5OWYzNiJ9.rbkTI3xDNlLbYV7t-ZZpzvVXTDPES778yJLCmSMj1WY","token_uuid":"7c76c8b3-e4a8-41c5-a103-c039dbde36d9","status":"Success","settings":{"addIns":[],"features":"WyJub3N5bmMiLCJvZmZsaW5lRGF0YU9ubHkiXQ==","greetings":"eyJ0b2RvIjp7fX0=","ts_onboarding":1647931040010,"user_id":"05a953fe-3e0d-4d0b-a943-d4226ee99f36","experimentEnrollments":[],"createTime":"2022-03-22T06:37:19.46Z"}}

const imageCategories = ['travel', 'nature'];

// The following is from the official documentation.
// This API requires an access token, returns the response in JSON format, and the response contains
// the author's details. This field `urls.raw` in the response contains a URL to the photo,
// this URL supports different parameters, e.g. `?w=1920&fm=jpg&q=95`.
// API URL - https://api.unsplash.com/photos/random.
// Source - https://unsplash.com/documentation.
// More API URLs available in the sources.

// The following is not officially documented (at least I could not find it on the official site).
// These APIs do not require an access token, but they return a plain photo (no JSON in the response),
// so it's not clear how to get the author's details. URLs below support different parameters to fetch
// different photos matching a size and a query.
// API URLs:
// - https://source.unsplash.com/featured/1920x1080?city,night
// - https://source.unsplash.com/random/1920x1080?city,night
// Sources:
// - https://awik.io/generate-random-images-unsplash-without-using-api/
// - https://www.reddit.com/r/unsplash/comments/s13x4h/what_happened_to_sourceunsplashcom/
// More API URLs available in the sources.

// The following is not officially documented (at least I could not find it on the official site).
// This API does not require an access token, returns the response in JSON format, and the response contains
// the author's details. It's not clear (need to test and investigate the source) if the URL below
// supports any parameters. The source has some other URLs (e.g. to search photos) that
// support different parameters.
// API URL - https://unsplash.com/napi/photos/random.
// Source - https://github.com/sauldom102/unsplashpy. More API URLs available in the source.

// As the application is publicly available and does not require users to login I don't see
// any point in using access tokens to fetch the photos. Even if we proxied requests to Unsplash via a backend
// in order to hide the keys this proxy would be publicly available, which beats the purpose.

// It looks like the best result can be achieved using https://source.unsplash.com/featured/1920x1080?city,night
// because:
// - We do not have to use access tokens at all
// - Photos under "featured" category are very good
// - The API supports some search parameters to fetch e.g. night / day photos
// There is a setback that it's not clear how to fetch the author's details. It looks like that as it's not possible to
// fetch the author's details it makes this API illegal to be used as the following official guidelines
// https://help.unsplash.com/en/collections/1451694-api-guidelines say that when displaying a photo from Unsplash,
// your application must attribute Unsplash, the Unsplash photographer, and contain a link back to
// their Unsplash profile.
// TODO reach Unsplash to clarify usage of this API.

// An alternative would be to use https://unsplash.com/napi/photos/random. It seems it returns the response in the
// same format as the official https://api.unsplash.com/photos/random (so we can use `urls.raw` from the response
// and attach the size and quality parameters). Also, it seems, that is supports all parameters as the official
// documentation. Therefore, we get everything from the previous point, plus we can retrieve the author's details.
// TODO reach Unsplash to clarify usage of this API.

export class ImageRepository implements ImageRepositoryInterface {
  public async getRandomImage() {
    const categoryIndex = Math.round(Math.random() * (imageCategories.length - 1));
    // TODO respect seasons
    const query = `${imageCategories[categoryIndex]} ${DayTime.getName()}`;

    const { data: randomPhoto } = await axios.get<RandomPhoto>('https://unsplash.com/napi/photos/random', {
      params: {
        orientation: 'landscape',
        query,
        topics: 'featured',
      },
    });

    return {
      source: urlJoin(randomPhoto.urls.raw, '?w=1920&fm=jpg&q=95'),
      author: {
        name: randomPhoto.user.name,
        url: randomPhoto.user.links.photos,
      },
    };
  }

  // TODO cover with unit test if it goes to the production
  public async getPlainRandomImage() {
    const categoryIndex = Math.round(Math.random() * (imageCategories.length - 1));
    // TODO respect seasons
    const query = `${imageCategories[categoryIndex]},${DayTime.getName()}`;

    const {
      request: { responseURL },
    } = await axios.get<string>(`https://source.unsplash.com/featured/1920x1080?${query}`);

    if (typeof responseURL !== 'string') {
      throw new Error('Could not retrieve photo URL');
    }

    return {
      source: responseURL,
      author: undefined,
    };
  }

  // TODO cover with unit test if it goes to the production
  public async getAuthorizedRandomImage() {
    // This access token has been revoked, let's keep it here for history purposes until it is decided
    // to stick to an exact way of working with Unsplash (should be decided after reaching theirs support).
    const headers = {
      [window.atob('QXV0aG9yaXphdGlvbg==')]: window.atob(
        'QmVhcmVyIDVndG1CNmJ0b3VrUjJMbmVTcWdHODNkTXU2a200LXpfZVJSdDJUX0pUM28=',
      ),
    };
    const categoryIndex = Math.round(Math.random() * (imageCategories.length - 1));
    // TODO respect seasons
    const query = `${imageCategories[categoryIndex]} ${DayTime.getName()}`;

    const {
      data: [randomPhoto],
    } = await axios.get<[RandomPhoto]>('https://api.unsplash.com/photos/random', {
      params: {
        orientation: 'landscape',
        query,
        count: 1,
        topics: 'featured',
      },
      headers,
    });

    return {
      source: urlJoin(randomPhoto.urls.raw, '?w=1920&fm=jpg&q=95'),
      author: {
        name: randomPhoto.user.name,
        url: randomPhoto.user.links.photos,
      },
    };
  }
}
