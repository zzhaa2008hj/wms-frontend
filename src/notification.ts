import { autoinject } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class Notifier {

  private es: EventSource;

  constructor(private events: EventAggregator) {

    events.subscribe('user:authenticate', event => {
      let { userId, orgId } = event; //
      let es = new EventSource("..."); //TODO
      es.onmessage = e => {
        let msg = JSON.parse(e.data);
        events.publish('notification:message', msg);
      };
      es.onerror = e => console.error(e);
      this.es = es;
    });
  }

  subscribe(listener: (msg: any) => void, event: string = "message") {
    this.events.subscribe(`notification:${event}`, listener);
  }

}