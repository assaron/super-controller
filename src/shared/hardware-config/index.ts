import { SupportedDeviceConfig } from './supported-device-config';
import { AnonymousDeviceConfig } from './anonymous-device-config';
import { AdapterDeviceConfig } from './adapter-device-config';
import { DeviceConfig } from './device-config';
import { DeviceDriver } from '../driver-types';

export { InputConfig } from './input-config';
export { AdapterDeviceConfig };
export { DeviceConfig };
export { AnonymousDeviceConfig };
export { SupportedDeviceConfig };

export function configFromDriver(siblingIndex: number, driver: DeviceDriver) {
  if (driver.anonymous) {
    return new AnonymousDeviceConfig(driver.name, siblingIndex, new Map(), []);
  }

  if (driver.type === 'adapter') {
    return new AdapterDeviceConfig(driver.name, siblingIndex);
  }

  return SupportedDeviceConfig.fromDriver(siblingIndex, driver);
}

export function configFromJSON(json: string): DeviceConfig {
  // deserialize device
  const deviceObj = JSON.parse(json);

  return deviceObj.supported
    ? SupportedDeviceConfig.fromParsedJSON(deviceObj)
    : AnonymousDeviceConfig.fromParsedJSON(deviceObj);
}
