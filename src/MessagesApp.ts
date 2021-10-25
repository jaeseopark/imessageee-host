

import MessageHandlerFactory from "./bizlog/MessageHandlerFactoryImpl";
import IMFMessage from "./datatype/IMFMessage";
import IMFEvent from "./datatype/IMFEvent";
import { MessageGetter, MessageSender } from "./interface/MessageHandler";

const GET_MESSAGE_POLL_INTERVAL = 1000; // ms

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
            this.mGetter.getNewIncomingMessages().forEach(m => {
                onReceive({ message: { ...m, isNew: true, } });
            });
            this.mGetter.getUpdatesToExistingMessages().forEach(m => {
                onReceive({ message: { ...m, isNew: false } });
            });
        }, GET_MESSAGE_POLL_INTERVAL);
    };

    stopListening = () => {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
};

export default MessagesApp;
