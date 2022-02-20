import axios from 'axios';

import { QuoteModel } from '../../models';
import { getRandomInteger } from '../../utils';
import { QuotesRepositoryInterface } from './QuoteRepositoryInterface';

interface QuotesMeta {
  pages: number;
  pageSize: number;
  quoteCount: number;
}

export class QuoteRepository implements QuotesRepositoryInterface {
  public async getRandomQuote() {
    const {
      data: { pageSize, quoteCount },
    } = await axios.get<QuotesMeta>('/quotes/quotes-meta.json');

    const quoteNumber = getRandomInteger(1, quoteCount);
    const page = Math.floor(quoteNumber / (pageSize + 1)) + 1;

    const { data: quotes } = await axios.get<QuoteModel[]>(`/quotes/quotes-${page}.json`);
    const quote = quotes[quoteNumber - 1 - pageSize * (page - 1)];

    return quote;
  }
}
