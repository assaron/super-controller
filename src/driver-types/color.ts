import { EventType, MidiValue } from 'midi-message-parser';

/**
 * Represents a color which a hardware input can be set to.
 */
type Color = {
  /* Descriptive name for a color, e.g. Red or Amber */
  name: string;

  /* The event type which triggers the color. E.g. noteon */
  eventType: EventType;

  /* The value (velocity) value which triggers the color */
  value: MidiValue;

  /* css-valid string value. e.g. #FFF or rgba(100, 100, 100, 0.5) */
  string: string;

  /* is this the active color when pad turns on? */
  default: boolean;

  /* Descriptive modifier of color behavior */
  modifier?: 'blink';
};

export type { Color };
