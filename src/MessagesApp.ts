import MessageHandlerFactory from "./bizlog/MessageHandlerFactoryImpl";
import IMFMessage, { IMFOutgoingMessage } from "./datatype/IMFMessage";
import IMFEvent from "./datatype/IMFEvent";
import { split } from "./util/arrays";
import { MessageSender } from "./interface/MessageSender";
import { MessageGetter } from "./interface/MessageGetter";
import { ReverseLookp } from "./interface/ContactGetter";

const GET_MESSAGE_POLL_INTERVAL = 1000; // ms
const MESSAGES_PER_EVENT = 100;

type OnReceive = (m: IMFEvent) => void;

class MessagesApp {
    private interval?: NodeJS.Timer;
    private mSender: MessageSender;
    private mGetter: MessageGetter;
    private contactReverseLookup: ReverseLookp = {};

    constructor(factory: MessageHandlerFactory) {
        console.log("Initializing MessagesApp...");
        this.mSender = factory.getMessageSender();
        this.mGetter = factory.getMessageGetter();

        factory.getContactGetter().getReverseLookup()
            .then(rLookup => {
                this.contactReverseLookup = rLookup;
                console.log("Reverse Lookup table registered");
            })
    }

    private substituteContactAliasInPlace = (message: IMFMessage) => {
        const alias = this.contactReverseLookup[message.handle];
        if (alias) {
            message.alias = alias;
        }
    }

    getRecentMessagesAsEvents = (): Promise<IMFEvent[]> =>
        this.mGetter.getRecentMessages()
            .then(messages => split(messages, MESSAGES_PER_EVENT)
                .map(chunk => {
                    chunk.forEach(this.substituteContactAliasInPlace);
                    return { messages: chunk };
                }));

    send = (m: IMFOutgoingMessage) => this.mSender.sendMessage(m);

    listen = (onReceive: OnReceive) => {
        this.interval = setInterval(() => {
            if (!this.isReady()) return;
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

    isReady = () => Object.keys(this.contactReverseLookup).length > 0;

    cleanup = () => {
        this.stopListening();
        this.mSender.close();
        this.mGetter.close();
    }
};

export default MessagesApp;
