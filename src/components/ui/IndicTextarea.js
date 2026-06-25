'use client';

import { ReactTransliterate, TriggerKeys } from 'react-transliterate';
import 'react-transliterate/dist/index.css';
import { useIndicTyping } from './IndicTypingProvider';

const DEFAULT_TRIGGER_KEYS = [
  TriggerKeys.KEY_SPACE,
  TriggerKeys.KEY_ENTER,
  TriggerKeys.KEY_RETURN,
  TriggerKeys.KEY_TAB,
];

export default function IndicTextarea({
  value,
  onChange,
  lang = 'hi',
  className = '',
  disabled,
  indic = true,
  triggerKeys = DEFAULT_TRIGGER_KEYS,
  onKeyDown,
  onBlur,
  rows,
  ...rest
}) {
  const { enabled } = useIndicTyping();

  if (!indic || !enabled || disabled) {
    return (
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value, e)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
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
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      triggerKeys={triggerKeys}
      enabled={!disabled}
      renderComponent={(inputProps) => (
        <textarea
          {...rest}
          {...inputProps}
          data-indic-managed="true"
          className={className}
          disabled={disabled}
          rows={rows}
        />
      )}
    />
  );
}
