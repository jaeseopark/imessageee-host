import MessageHandlerFactory from "./bizlog/MessageHandlerFactoryImpl";
import IMFMessage from "./datatype/IMFMessage";
import IMFEvent from "./datatype/IMFEvent";
import { MessageGetter, MessageSender } from "./interface/MessageHandler";
import { split } from "./util/arrays";

const GET_MESSAGE_POLL_INTERVAL = 1000; // ms
const MESSAGES_PER_EVENT = 50;

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
        const processMessages = (promise: Promise<IMFMessage[]>, isNew: boolean) => {
            promise.then((messages) => {
                return messages.map(m => ({ ...m, isNew }));
            }).then((messages) => {
                split(messages, MESSAGES_PER_EVENT).forEach(chunk => {
                    onReceive({
                        messages: chunk
                    });
                });
                return null;
            });
        };

        this.interval = setInterval(() => {
            const newMsgPromise = this.mGetter.getNewIncomingMessages();
            const existingMsgPromise = this.mGetter.getUpdatesToExistingMessages();
            processMessages(newMsgPromise, true);
            processMessages(existingMsgPromise, false);
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
