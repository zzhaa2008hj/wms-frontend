import { EventAggregator } from "aurelia-event-aggregator";
import { inject } from "aurelia-dependency-injection";

export class Notifier {

    constructor(@inject private events: EventAggregator,
                @inject('config') config: any) {

        events.subscribe('user:authenticate', event => {
            let { userId, organizationId } = event; //
            let es = new EventSource(`${config.notification.baseUrl}/${userId}/notifications`);
            es.onopen = e => console.debug(e);
            es.onerror = e => console.debug(e);
            es.onmessage = e => {
                events.publish('event-source:message', JSON.parse(e.data));
            };

            let es1 = new EventSource(`${config.notification.baseUrl}/${organizationId}/notifications`);
            es1.onopen = e => console.debug(e);
            es1.onerror = e => console.debug(e);
            es1.onmessage = e => {
                events.publish('event-source:message', JSON.parse(e.data));
            };
        });
    }

    subscribe(listener: (msg: any) => void, event: string = "message") {
        this.events.subscribe(`event-source:${event}`, listener);
    }

}