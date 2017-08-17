declare class EventSource {
    constructor(url: string);

    onopen: (e: Event) => void;
    onerror: (e: Event) => void;
    onmessage: (e: Event) => void;
}

declare class Notification {
    constructor(title: string, options: {body:string ,title: string ,requireInteraction: boolean ,icon :string});

    onclick: (e: Event) => void;

}




