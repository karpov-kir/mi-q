import axios from 'axios';

import { QuoteModel } from '../../models';
import { QuoteRepository } from './QuoteRepository';

const quoteRepository = new QuoteRepository();
const axiosGetSpy = jest.spyOn(axios, 'get');
const quotes: QuoteModel[] = [];

for (let i = 1; i <= 10; i++) {
  quotes.push({
    text: `Test quote ${i}`,
    author: `Test author ${i}`,
  });
}

describe(QuoteRepository, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get a random quote', async () => {
    mockQuotesResponses();
    jest.spyOn(Math, 'random').mockReturnValue(1);
    await expect(quoteRepository.getRandomQuote()).resolves.toEqual(quotes[9]);

    mockQuotesResponses();
    jest.spyOn(Math, 'random').mockReturnValue(0.33);
    await expect(quoteRepository.getRandomQuote()).resolves.toEqual(quotes[2]);

    mockQuotesResponses();
    jest.spyOn(Math, 'random').mockReturnValue(0);
    await expect(quoteRepository.getRandomQuote()).resolves.toEqual(quotes[0]);
  });

  it('should request a valid page', async () => {
    axiosGetSpy.mockResolvedValue({
      data: {
        quoteCount: 100,
        pageSize: 10,
        pages: 10,
      },
    });

    jest.spyOn(Math, 'random').mockReturnValue(1);
    await quoteRepository.getRandomQuote();

    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    await quoteRepository.getRandomQuote();

    jest.spyOn(Math, 'random').mockReturnValue(0);
    await quoteRepository.getRandomQuote();

    expect(axiosGetSpy).nthCalledWith(2, '/quotes/quotes-10.json');
    expect(axiosGetSpy).nthCalledWith(4, '/quotes/quotes-5.json');
    expect(axiosGetSpy).nthCalledWith(6, '/quotes/quotes-1.json');
  });

  it('should throw an error if a request fails', async () => {
    axiosGetSpy.mockRejectedValue(new Error('Test'));

    await expect(quoteRepository.getRandomQuote()).rejects.toEqual(new Error('Test'));
  });
});

function mockQuotesResponses() {
  axiosGetSpy.mockResolvedValueOnce({
    data: {
      quoteCount: 100,
      pageSize: 10,
      pages: 10,
    },
  });
  axiosGetSpy.mockResolvedValueOnce({
    data: quotes,
  });
}
