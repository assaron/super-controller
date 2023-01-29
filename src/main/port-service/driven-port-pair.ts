import { setStatus } from '@shared/midi-util';
import { DeviceDriver } from '@shared/driver-types';
import { ColorImpl } from '@shared/hardware-config';

import { PortPair } from './port-pair';

/**
 * PortPair with an attached driver. Useful so that we can reset the lights
 * on devices to their initial state without having to know a device's configuration
 * (if it has any).
 */
export class DrivenPortPair extends PortPair {
  /* The actual PortPair */
  #pair: PortPair;

  /* The related driver, if any */
  driver: DeviceDriver;

  /* eslint-disable-next-line */
  testables = new Map<string, any>();

  constructor(pair: PortPair, driver: DeviceDriver) {
    super(pair.iPort, pair.oPort);

    this.#pair = pair;
    this.driver = driver;

    this.testables.set('pair', this.#pair);
  }

  /* Reset all of the lights on the device to their initial state. */
  resetLights() {
    this.driver.inputGrids.forEach((ig) => {
      ig.inputs.forEach((i) => {
        const defs = ig.inputDefaults;
        const channel = (i.channel || defs.channel)!;
        const availableColors = i.availableColors || defs.availableColors || [];

        if (availableColors.length === 0) return;

        const defColor = availableColors.filter((c) => c.default)[0];
        const defColorImpl = new ColorImpl(defColor, i.number, channel);

        this.#pair.send(defColorImpl.toMidiArray());
      });
    });
  }

  /**
   * Sends a sequence of MIDI messages to the device in order to gain control of its
   * lights. This sequence of messages is the same sequence sent by Ableton in order
   * to put devices into Control Surface mode. Not all devices require a control
   * sequence in order to relinquish control of lights.
   */
  runControlSequence() {
    this.driver.controlSequence?.forEach((msgArray) => {
      const msg = setStatus(
        [msgArray[3], msgArray[1], msgArray[2]],
        msgArray[0]
      );
      this.#pair.send(msg);
    });
  }
}
