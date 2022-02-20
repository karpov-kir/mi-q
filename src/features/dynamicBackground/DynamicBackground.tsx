import { ReactNode, useEffect, useState } from 'react';

import { waitNextRender } from '../../utils';
import { useRandomImage } from '../../views/main/hooks';
import { StyledBackground, StyledContentContainer, StyledOverlay, StyledRoot } from './DynamicBackground.styles';

interface DynamicBackgroundProps {
  children: ReactNode;
}

export function DynamicBackground(props: DynamicBackgroundProps) {
  const { children } = props;
  const [isBackgroundReady, setIsBackgroundReady] = useState(false);
  const image = useRandomImage();

  const style = {
    backgroundImage: `url("${image?.source}")`,
  };

  useEffect(() => {
    if (!image) {
      return;
    }

    // Give the browser some time to render the image
    // TODO: try this instead https://stackoverflow.com/a/57569491/18044839
    // as this seems not working consistently
    waitNextRender().then(() => {
      const loadingOverlayElement = document.getElementById('main-view-loading-overlay');

      if (loadingOverlayElement) {
        // TODO make it more smooth
        loadingOverlayElement.style.display = 'none';
      }

      setIsBackgroundReady(true);
    });
  }, [image]);

  return (
    <StyledRoot>
      <StyledBackground style={style} />
      <StyledOverlay />
      {isBackgroundReady && <StyledContentContainer>{children}</StyledContentContainer>}
    </StyledRoot>
  );
}
