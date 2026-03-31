export type MonitoringEvent = {
  type: 'request' | 'error' | 'health';
  name: string;
  payload?: Record<string, unknown>;
  timestamp: string;
};

type MonitoringListener = (event: MonitoringEvent) => void;

const listeners = new Set<MonitoringListener>();

export const registerMonitoringHook = (listener: MonitoringListener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const emitMonitoringEvent = (
  type: MonitoringEvent['type'],
  name: string,
  payload?: Record<string, unknown>,
): void => {
  const event: MonitoringEvent = {
    type,
    name,
    payload,
    timestamp: new Date().toISOString(),
  };

  for (const listener of listeners) {
    listener(event);
  }
};
