import styled from 'styled-components/macro';

import { StyledRoot as ShortcutItem } from './shortcutItem/ShortcutItem.styles';

export const StyledRoot = styled.div``;

export const StyledShortcutItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;

  // A more correct way of styling this would be to use styles overriding, instead of direct changing the
  // styles of the the root element. But in this case we would need to override styles two times:
  // 1. Override ShortcutItem
  // 2. Override SmartShortcutItem
  // Because both these components are used. The current way requires less styles and classes,
  // so let's keep it this way.
  ${ShortcutItem} {
    margin-right: 54.8px;
    margin-bottom: 30px;

    &:nth-child(6n) {
      margin-right: 0;
    }
  }
`;
