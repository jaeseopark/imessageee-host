

import MessageHandlerFactory from "./bizlog/MessageHandlerFactoryImpl";
import IMFMessage from "./datatype/IMFMessage";
import IMFEvent from "./datatype/IMFEvent";
import { MessageGetter, MessageSender } from "./interface/MessageHandler";
import { split } from "./util/arrays";

const GET_MESSAGE_POLL_INTERVAL = 1000; // ms
const MESSAGES_PER_EVENT = 50;

type OnReceive = (m: IMFEvent) => void;

class MessagesApp {
    private interval?: number;
    private mSender: MessageSender;
    private mGetter: MessageGetter;

    constructor(factory: MessageHandlerFactory) {
        this.mSender = factory.getMessageSender();
        this.mGetter = factory.getMessageGetter();
    }

    getRecentConversations = (limit = 20) => this.mGetter.getRecentConversations(limit);

    send = (m: IMFMessage) => this.mSender.send(m);

    listen = (onReceive: OnReceive) => {
        this.interval = setInterval(() => {
            const messages = [
                ...this.mGetter.getNewIncomingMessages().map(m => ({ ...m, isNew: true })),
                ...this.mGetter.getUpdatesToExistingMessages().map(m => ({ ...m, isNew: false })),
            ];
            split(messages, MESSAGES_PER_EVENT).forEach(chunk => {
                onReceive({
                    messages: chunk
                });
            })
        }, GET_MESSAGE_POLL_INTERVAL);
    };

    stopListening = () => {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
};

export default MessagesApp;
