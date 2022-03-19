import { QuoteModel } from '../models';
import { QuoteRepository } from '../repositories/quoteRepository';
import { AsyncCache, PersistedStorage } from '../services';

const RANDOM_QUOTE_CACHE_TTL = 6 * 60 * 60 * 1000;
export const randomQuoteCache = new AsyncCache<QuoteModel>(RANDOM_QUOTE_CACHE_TTL, new PersistedStorage('quote'), {
  text: 'If we did all the things we are capable of, we would literally astound ourselves.',
  author: 'Thomas Edison',
});
randomQuoteCache.setSource(() => new QuoteRepository().getRandomQuote());
