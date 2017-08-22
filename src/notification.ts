import { autoinject } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { MessageResultService } from "@app/base/services/message";
import { ReadNotification } from "@app/base/notifications/read";
import { DialogService } from "ui";

@autoinject
export class Notifier1 {

    private es: EventSource;
    Notification.requestPermission();

    constructor(private events: EventAggregator,
                private dialogService: DialogService,
                private messageResultService: MessageResultService) {

        events.subscribe('event-source:message', event => {

            let { title, body, requireInteraction, tag, type } = event;
            let notification = new Notification(title, {
                body: body,
                title: title,
                requireInteraction: requireInteraction,
                icon: '/assets/images/note.png'
            });
            notification.onclick = async click => {
                if (type == 1) {
                    this.messageResultService.updateMessage(tag);
                }
                await this.dialogService.open({
                    viewModel: ReadNotification,
                    model: { title, body },
                    lock: true
                }).whenClosed();
            }
        });
    }

    subscribe(listener: (msg: any) => void, event: string = "message") {
        this.events.subscribe(`notification:${event}`, listener);
    }

}