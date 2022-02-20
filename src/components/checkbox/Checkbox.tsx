import { ChangeEvent } from 'react';

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  disabled?: boolean;
}

export function Checkbox(props: CheckboxProps) {
  const { label, checked, name, onChange, disabled } = props;

  return (
    <div>
      <label>
        {label && <span>{label}</span>}
        <input onChange={onChange} name={name} type="checkbox" checked={checked} disabled={disabled} />
      </label>
    </div>
  );
}
