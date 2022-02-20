import React, { Fragment } from 'react';

import {
  Clock,
  ClockFormat,
  ControlPanel,
  DynamicBackground,
  Greeting,
  Intro,
  Quote,
  Search,
  Shortcuts,
  ToDo,
} from '../../features';
import { useStorage } from '../../hooks';
import { namePersistedStorage, settingsPersistedStorage } from '../../storages';
import {
  StyledBottomContainer,
  StyledClockContainer,
  StyledContentContainer,
  StyledGreetingContainer,
  StyledQuoteContainer,
  StyledSearchContainer,
  StyledShortcutsContainer,
  StyledTopContainer,
} from './MainView.styles';

export function MainView() {
  const {
    data: name,
    isInitialized: isNameInitialized,
    error: nameError,
  } = useStorage({ storage: namePersistedStorage });
  const {
    data: settings,
    isInitialized: isSettingsInitialized,
    error: settingsError,
  } = useStorage({ storage: settingsPersistedStorage });

  if (nameError || settingsError) {
    return <div>Could not initialize the main screen</div>;
  }

  if (!settings || !isSettingsInitialized) {
    return null;
  }

  // The name storage does not have a default value, so we need to check only the initialization flag
  if (!isNameInitialized) {
    return null;
  }

  // Tp request user name
  const shouldRenderIntroScreen = settings.isGreetingEnabled && settings.isGreetingWithName && !name;

  return (
    <DynamicBackground>
      <StyledContentContainer>
        {shouldRenderIntroScreen && <Intro />}
        {!shouldRenderIntroScreen && (
          <Fragment>
            <StyledTopContainer>
              {settings.isClockEnabled && (
                <StyledClockContainer>
                  {/*TODO move logic to feature*/}
                  <Clock format={ClockFormat['24Hours']} />
                </StyledClockContainer>
              )}

              {settings.isGreetingEnabled && (
                <StyledGreetingContainer>
                  {/*TODO move logic to feature*/}
                  <Greeting name={settings.isGreetingWithName ? name : undefined} />
                </StyledGreetingContainer>
              )}

              {settings.isSearchEnabled && (
                <StyledSearchContainer>
                  <Search />
                </StyledSearchContainer>
              )}

              {settings.isShortcutsEnabled && (
                <StyledShortcutsContainer>
                  <Shortcuts />
                </StyledShortcutsContainer>
              )}
              <div style={{ display: 'none' }}>
                <ToDo />
                <ControlPanel />
              </div>
            </StyledTopContainer>

            <StyledBottomContainer>
              {settings.isQuoteEnabled && (
                <StyledQuoteContainer>
                  <Quote />
                </StyledQuoteContainer>
              )}
            </StyledBottomContainer>
          </Fragment>
        )}
      </StyledContentContainer>
    </DynamicBackground>
  );
}
