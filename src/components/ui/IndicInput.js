'use client';

import { ReactTransliterate } from 'react-transliterate';
import 'react-transliterate/dist/index.css';
import { useIndicTyping } from './IndicTypingProvider';

export default function IndicInput({
  value,
  onChange,
  lang = 'hi',
  className = '',
  disabled,
  indic = true,
  ...rest
}) {
  const { enabled } = useIndicTyping();

  if (!indic || !enabled || disabled) {
    return (
      <input
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value, e)}
        className={className}
        disabled={disabled}
        {...rest}
      />
    );
  }

  return (
    <ReactTransliterate
      lang={lang}
      value={value ?? ''}
      onChangeText={(text) => onChange?.(text)}
      renderComponent={(inputProps) => (
        <input
          {...rest}
          {...inputProps}
          className={className}
          disabled={disabled}
        />
      )}
    />
  );
}
