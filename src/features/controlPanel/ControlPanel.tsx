import { ChangeEvent } from 'react';

import { Checkbox } from '../../components';
import { useStorage } from '../../hooks/useStorage';
import { settingsPersistedStorage } from '../../storages';

export function ControlPanel() {
  const { data, isInitialized, error, setData } = useStorage({ storage: settingsPersistedStorage });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    if (!data) {
      return;
    }

    if (!(name in data)) {
      throw new Error(`Cannot update ${name} in the settings as this field is unknown`);
    }

    setData({
      ...data,
      [name]: checked,
    });
  };

  if (error) {
    return <div>Could not initialize the control panel</div>;
  }

  if (!data || !isInitialized) {
    return null;
  }

  return (
    <div>
      <div>
        <Checkbox onChange={handleChange} name="isClockEnabled" label="Clock" checked={data.isClockEnabled} />
      </div>
      <div>
        <Checkbox onChange={handleChange} name="isGreetingEnabled" label="Greeting" checked={data.isGreetingEnabled} />
      </div>
      <div>
        <Checkbox
          disabled={!data.isGreetingEnabled}
          onChange={handleChange}
          name="isGreetingWithName"
          label="Name in greeting"
          checked={data.isGreetingWithName}
        />
      </div>
      <div>
        <Checkbox onChange={handleChange} name="isSearchEnabled" label="Search" checked={data.isSearchEnabled} />
      </div>
      <div>
        <Checkbox
          onChange={handleChange}
          name="isShortcutsEnabled"
          label="Shortcuts"
          checked={data.isShortcutsEnabled}
        />
      </div>
      <div>
        <Checkbox onChange={handleChange} name="isQuoteEnabled" label="Quote" checked={data.isQuoteEnabled} />
      </div>
    </div>
  );
}
