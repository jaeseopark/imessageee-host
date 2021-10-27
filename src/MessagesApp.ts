import MessageHandlerFactory from "./bizlog/MessageHandlerFactoryImpl";
import IMFMessage from "./datatype/IMFMessage";
import IMFEvent from "./datatype/IMFEvent";
import { MessageGetter, MessageSender } from "./interface/MessageHandler";
import { split } from "./util/arrays";

const GET_MESSAGE_POLL_INTERVAL = 1000; // ms
const MESSAGES_PER_EVENT = 100;

type OnReceive = (m: IMFEvent) => void;

class MessagesApp {
    private interval?: NodeJS.Timer;
    private mSender: MessageSender;
    private mGetter: MessageGetter;

    constructor(factory: MessageHandlerFactory) {
        this.mSender = factory.getMessageSender();
        this.mGetter = factory.getMessageGetter();
    }

    getRecentMessagesAsEvents = (): Promise<IMFEvent[]> =>
        this.mGetter.getRecentMessages()
            .then(messages => split(messages, MESSAGES_PER_EVENT)
                .map(chunk => ({ messages: chunk })));

    send = (m: IMFMessage) => this.mSender.send(m);

    listen = (onReceive: OnReceive) => {
        this.interval = setInterval(() => {
            this.mGetter.getNewMessages()
                .then((messages) => {
                    split(messages, MESSAGES_PER_EVENT).forEach(chunk => {
                        onReceive({
                            messages: chunk
                        });
                    });
                    return null;
                });
        }, GET_MESSAGE_POLL_INTERVAL);
    };

    stopListening = () => {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    cleanup = () => {
        this.stopListening();
        this.mSender.close();
        this.mGetter.close();
    }
};

export default MessagesApp;
