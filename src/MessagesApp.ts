import MessageHandlerFactory from "./bizlog/MessageHandlerFactoryImpl";
import IMFMessage, { IMFOutgoingMessage } from "./datatype/IMFMessage";
import IMFEvent from "./datatype/IMFEvent";
import { split } from "./util/arrays";
import { MessageSender } from "./interface/MessageSender";
import { MessageGetter } from "./interface/MessageGetter";
import ContactsApp from './ContactsApp';

const GET_MESSAGE_POLL_INTERVAL = 1000; // ms
const MESSAGES_PER_EVENT = 100;

type OnReceive = (m: IMFEvent) => void;

class MessagesApp {
    private interval?: NodeJS.Timer;
    private mSender: MessageSender;
    private mGetter: MessageGetter;
    private contactsApp: ContactsApp;

    constructor(contactsApp: ContactsApp, factory: MessageHandlerFactory) {
        console.log("Initializing MessagesApp...");
        this.contactsApp = contactsApp;
        this.mSender = factory.getMessageSender();
        this.mGetter = factory.getMessageGetter();
    }

    private substituteContactAliasInPlace = (message: IMFMessage) => {
        const alias = this.contactsApp.getAliasByHandle(message.handle);
        if (alias) {
            message.alias = alias;
        }
    };

    private decorateMessageInPlace = (message: IMFMessage) => {
        this.substituteContactAliasInPlace(message);
    };

    getPreloadEvents = (): Promise<IMFEvent[]> =>
        this.mGetter.getRecentMessages().then((messages) => {
            console.log(messages.length, "preloaded messages");
            return split(messages, MESSAGES_PER_EVENT).map((chunk) => {
                chunk.forEach(this.decorateMessageInPlace);
                return { messages: chunk, type: "MESSAGE_PRELOAD" };
            });
        });

    send = (m: IMFOutgoingMessage) => this.mSender.sendMessage(m);

    listen = (onReceive: OnReceive) => {
        this.interval = setInterval(() => {
            this.mGetter.getNewMessages().then((messages) => {
                if (messages.length > 0) {
                    console.log(messages.length, "new messages");
                }
                split(messages, MESSAGES_PER_EVENT).forEach((chunk) => {
                    chunk.forEach(this.decorateMessageInPlace);
                    onReceive({
                        messages: chunk,
                        type: "MESSAGE_NEW",
                    });
                });
                return null;
            });
        }, GET_MESSAGE_POLL_INTERVAL);
    };

    getAttachmentPath = (attachmentId: number) => this.mGetter.getAttachmentPath(attachmentId);

    stopListening = () => {
        if (this.interval) {
            clearInterval(this.interval);
        }
    };

    cleanup = () => {
        this.stopListening();
        this.mSender.close();
        this.mGetter.close();
    };
}

export default MessagesApp;
