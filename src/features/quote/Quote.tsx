import { useEffect, useState } from 'react';

import { randomQuoteCache } from '../../caches';
import { QuoteModel } from '../../models';
import { StyledAuthor, StyledQuote, StyledRoot } from './Quote.styles';

export function Quote() {
  const [quote, setQuote] = useState<QuoteModel | undefined>();

  useEffect(() => {
    randomQuoteCache.getItem().then(setQuote);
  }, []);

  return (
    <StyledRoot>
      <StyledQuote>{quote?.text}</StyledQuote>
      <StyledAuthor>{quote?.author}</StyledAuthor>
    </StyledRoot>
  );
}
