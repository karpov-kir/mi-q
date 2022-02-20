import axios from 'axios';
import { Fragment, useEffect, useState } from 'react';

import { GlobeIcon } from '../../../components';
import { ShortcutItem } from './ShortcutItem';

interface ShortcutItemProps {
  onRemove: (id: string) => void;
  onEdit: (id: string) => void;
  id: string;
  url: string;
  name?: string;
}

export function SmartShortcutItem(props: ShortcutItemProps) {
  const { name, url, onRemove, id, onEdit } = props;
  const parsedUrl = new URL(url);
  const domain = parsedUrl.host;
  const nameToDisplay = name || parsedUrl.host;
  const [iconSource, setIconSource] = useState<string | undefined>();

  const handleRemove = () => onRemove(id);

  const handleEdit = () => onEdit(id);

  const handleClick = () => {
    window.location.href = url;
  };

  useEffect(() => {
    const iconSourceToTest = `https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURI(domain)}`;

    axios
      .get<unknown, unknown>(iconSourceToTest)
      .then((_response) => {
        setIconSource(iconSourceToTest);
      })
      .catch((_error) => {
        console.warn('Could not load favicon for', nameToDisplay);
      });
  }, [url]);

  return (
    <ShortcutItem
      onClick={handleClick}
      onEdit={handleEdit}
      onRemove={handleRemove}
      name={nameToDisplay}
      icon={
        <Fragment>
          {!!iconSource && <img src={iconSource} alt={name || url} />} {!iconSource && <GlobeIcon />}
        </Fragment>
      }
    />
  );
}
