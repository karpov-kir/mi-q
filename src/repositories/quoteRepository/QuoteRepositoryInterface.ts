import { QuoteModel } from '../../models';

export interface QuotesRepositoryInterface {
  getRandomQuote: () => Promise<QuoteModel>;
}
