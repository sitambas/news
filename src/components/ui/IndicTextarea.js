'use client';

import { ReactTransliterate } from 'react-transliterate';
import 'react-transliterate/dist/index.css';
import { useIndicTyping } from './IndicTypingProvider';

export default function IndicTextarea({
  value,
  onChange,
  lang = 'hi',
  className = '',
  disabled,
  indic = true,
  rows,
  ...rest
}) {
  const { enabled } = useIndicTyping();

  if (!indic || !enabled || disabled) {
    return (
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value, e)}
        className={className}
        disabled={disabled}
        rows={rows}
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
        <textarea
          {...inputProps}
          className={className}
          disabled={disabled}
          rows={rows}
          {...rest}
        />
      )}
    />
  );
}
