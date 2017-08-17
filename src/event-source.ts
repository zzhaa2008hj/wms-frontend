import { autoinject } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { MessageResultService } from "@app/base/services/message";

@autoinject
export class Notifier {

  private es: EventSource;

  constructor(private events: EventAggregator) {

    events.subscribe('user:authenticate', event => {
      console.log(event);
      let { userId, orgId } = event; //
      let es = new EventSource(`http://localhost:3344/wms/${userId}/notifications`);
        es.onopen = e => console.log(e);
        es.onerror = e => console.log(e);
        es.onmessage = e => {
            console.log(e.data);
        events.publish('event-source:message', JSON.parse(e.data);
      };

        let es1 = new EventSource(`http://localhost:3344/wms/${orgId}/notifications`);
        es1.onopen = e => console.log(e);
        es1.onerror = e => console.log(e);
        es1.onmessage = e => {
            console.log(e);
            events.publish('event-source:message', JSON.parse(e.data));
        };
    });
  }
  subscribe(listener: (msg: any) => void, event: string = "message") {
    this.events.subscribe(`event-source:${event}`, listener);
  }

}