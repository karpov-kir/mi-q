import { css } from 'styled-components/macro';

export const textShadowAndStroke = css`
  text-shadow: 
    // Text shadow
    0.5px 0.5px 0.5px rgba(0, 0, 0, 0.25),
    // Text stroke
    0.1px 0 0 rgba(20, 20, 20, 1),
    -0.1px 0 0 rgba(20, 20, 20, 1), 0 0.1px rgba(20, 20, 20, 1), 0 -0.1px rgba(20, 20, 20, 1);
`;
