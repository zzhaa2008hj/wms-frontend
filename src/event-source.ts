import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { inject } from "aurelia-dependency-injection";

export class Notifier {
    es: EventSource;
    es1: EventSource;

    constructor(@inject private events: EventAggregator,
                @inject('config') config: any,
                @inject private subscription: Subscription) {

        subscription = events.subscribe('user:authenticate', event => {
            let { userId, organizationId } = event; //
            this.es = new EventSource(`${config.notification.baseUrl}/${userId}/notifications`);
            this.es.onopen = e => console.log(e);
            this.es.onerror = e => console.log(e);
            this.es.onmessage = e => {
                events.publish('event-source:message', JSON.parse(e.data));
            };

            this.es1 = new EventSource(`${config.notification.baseUrl}/${organizationId}/notifications`);
            this.es1.onopen = e => console.log(e);
            this.es1.onerror = e => console.log(e);
            this.es1.onmessage = e => {
                events.publish('event-source:message', JSON.parse(e.data));
            };
        });

        events.subscribeOnce('user:logout', () => {
            this.subscription.dispose();
        })
    }

    subscribe(listener: (msg: any) => void, event: string = "message") {
        this.events.subscribe(`event-source:${event}`, listener);
        if (this.es != null) {
            this.es.close();
        }
        if (this.es1 != null) {
            this.es1.close();
        }
    }

}