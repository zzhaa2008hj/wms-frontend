import { autoinject } from "aurelia-framework";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { MessageResultService } from "@app/base/services/message";
import { ReadNotification } from "@app/base/notifications/read";
import { DialogService } from "ui";

@autoinject
export class Notifier1 {

    constructor(private events: EventAggregator,
                private dialogService: DialogService,
                private messageResultService: MessageResultService,
                private subscription: Subscription) {
        doNo(this.events, this.dialogService, this.messageResultService, this.subscription);
    }
}

async function doNo(events: EventAggregator,
                    dialogService: DialogService,
                    messageResultService: MessageResultService,
                    subscription: Subscription) {

    let result = await Notification.requestPermission();
    if (result != 'granted') {
        console.log('没有被允许');
        return;
    }

    subscription = events.subscribe('event-source:message', event => {

        let { title, body, requireInteraction, tag, type } = event;
        let options = {
            body: title,
            requireInteraction: requireInteraction,
            icon: '/assets/images/note.png'
        };
        let notification = new Notification('您有一条新消息', options);
        notification.onclick = async () => {
            if (type == 1) {
                messageResultService.updateMessage(tag);
            }
            await dialogService.open({
                viewModel: ReadNotification,
                model: { title, body },
                lock: true
            }).whenClosed();
            events.publish('event-source:read');
        };
    });

    events.subscribeOnce('user:logout', () => {
        subscription.dispose();
    })
}



