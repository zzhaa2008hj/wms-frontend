declare class EventSource extends EventTarget {
  constructor(url: string, configuration?: { withCredentials: boolean });

  onerror: (e: Event) => void;
  onmessage: (e: MessageEvent) => void;
  onopen: (e: Event) => void;
  readyState: number;
  url: string;
  withCredentials: boolean;

  close(): void;

}

declare interface MessageEvent extends Event {
  readonly lastEventId: string;
  readonly data: any;
  readonly origin: string;
  readonly ports: any;
}