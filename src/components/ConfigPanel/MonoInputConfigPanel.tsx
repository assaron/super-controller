import React, { useCallback } from 'react';
import { Channel, MidiValue, EventType } from 'midi-message-parser';

import SettingsLineItem from './SettingsLineItem';
import BacklightSettings from './BacklightSettings';

import { ipcRenderer } from '../../ipc-renderer';
import { InputConfig, SupportedDeviceConfig } from '../../hardware-config';
import { InputGroup } from '../../input-group';
import { Project } from '../../project';

type PropTypes = {
  group: InputGroup;
  project: Project;
  device: SupportedDeviceConfig;
  title: string;
};

export default function MonoInputConfigPanel(props: PropTypes) {
  const { group, device, project, title } = props;

  const {
    number,
    channel,
    eventType,
    propagationStrategy,
    eligibleEventTypes,
    eligibleResponses,
  } = group;

  const eligibleChannels = [...Array(16).keys()] as Channel[];
  const eligibleNumbers = [...Array(128).keys()] as MidiValue[];

  const numberLabels = eligibleNumbers.map((v) => {
    if (eventType === 'controlchange') {
      const inUseLabel = v === number ? '' : ' [in use]';
      return device.bindingAvailable(eventType, v, channel) || v === number
        ? group.labelForNumber(v)
        : `${v}${inUseLabel}`;
    }

    return group.labelForNumber(v);
  });
  const channelLabels = eligibleChannels.map((v) => group.labelForChannel(v));
  const eventTypeLabels = eligibleEventTypes.map((v) =>
    group.labelForEventType(v)
  );
  const responseLabels = eligibleResponses.map((v) =>
    group.labelForResponse(v)
  );

  const onChange = useCallback(
    (setter: (c: InputConfig) => void) => {
      group.inputs.forEach((i) => setter(i));

      ipcRenderer.sendProject(project, true);
    },
    [group, project]
  );

  const restoreDefaults = useCallback(() => {
    group.inputs.forEach((input) => input.restoreDefaults());
    ipcRenderer.sendProject(project, true);
  }, [group, project]);

  return (
    <>
      <h3>{title}</h3>
      <div id="controls-container">
        <SettingsLineItem
          label="Event Type:"
          value={eventType}
          valueList={eligibleEventTypes}
          labelList={eventTypeLabels}
          onChange={(v) =>
            onChange((c) => {
              c.eventType = v as EventType;
            })
          }
        />
        <SettingsLineItem
          label="Input Response:"
          value={propagationStrategy}
          valueList={eligibleResponses}
          labelList={responseLabels}
          onChange={(v) => {
            onChange((c) => {
              c.response = v as 'gate' | 'toggle' | 'linear';
            });
          }}
        />
        {eventType === 'pitchbend' ? null : (
          <SettingsLineItem
            label="Number:"
            value={number}
            valueList={eligibleNumbers}
            labelList={numberLabels}
            onChange={(v) => {
              onChange((c) => {
                c.number = v as MidiValue;
              });
            }}
          />
        )}
        <SettingsLineItem
          label="Channel:"
          value={channel}
          labelList={channelLabels}
          valueList={eligibleChannels}
          onChange={(v) => {
            onChange((c) => {
              c.channel = v as Channel;
            });
          }}
        />
        <button type="button" onClick={restoreDefaults}>
          Restore Defaults
        </button>
        <BacklightSettings group={group} project={project} device={device} />
      </div>
    </>
  );
}
