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

/** Use on fields where Enter has its own action (e.g. add tag/location). */
export const INDIC_TRIGGER_KEYS_NO_ENTER = [
  TriggerKeys.KEY_SPACE,
  TriggerKeys.KEY_TAB,
];

export default function IndicInput({
  value,
  onChange,
  lang = 'hi',
  className = '',
  disabled,
  indic = true,
  triggerKeys = DEFAULT_TRIGGER_KEYS,
  onKeyDown,
  onBlur,
  ...rest
}) {
  const { enabled } = useIndicTyping();

  if (!indic || !enabled || disabled) {
    return (
      <input
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value, e)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
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
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      triggerKeys={triggerKeys}
      enabled={!disabled}
      renderComponent={(inputProps) => (
        <input
          {...rest}
          {...inputProps}
          data-indic-managed="true"
          className={className}
          disabled={disabled}
        />
      )}
    />
  );
}
