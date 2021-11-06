import parsePhoneNumber from 'libphonenumber-js'
import MessageHandlerFactory from "./bizlog/MessageHandlerFactoryImpl";
import IMFMessage, { IMFOutgoingMessage } from "./datatype/IMFMessage";
import IMFEvent from "./datatype/IMFEvent";
import { split } from "./util/arrays";
import { MessageSender } from "./interface/MessageSender";
import { MessageGetter } from "./interface/MessageGetter";
import { ReverseLookp } from "./interface/ContactGetter";
import LocalFileManager from "./bizlog/LocalFileManager";

const APP_DIR = "~/.imf";
const CONTACT_CACHE_PATH = "contacts.json";
const LOCAL_FILE_MANGER = new LocalFileManager(APP_DIR);

const GET_MESSAGE_POLL_INTERVAL = 1000; // ms
const MESSAGES_PER_EVENT = 100;

type OnReceive = (m: IMFEvent) => void;

// TODO: move out to a new file
const normalizeContactLookup = (reverseLookup: ReverseLookp) => {
    const defaultCountry = "US";
    const normalized: ReverseLookp = {};
    Object.entries(reverseLookup).forEach(([handle, alias]) => {
        const isEmail = handle.includes("@");
        if (isEmail) {
            normalized[handle] = alias;
            return;
        }

        const phoneNumber = parsePhoneNumber(handle, defaultCountry);
        if (phoneNumber) {
            const normalizedHandle = phoneNumber.formatInternational().replace(/ /g, "");
            normalized[normalizedHandle] = alias;
        } else {
            normalized[handle] = alias;
        }
    });

    return normalized;
}

class MessagesApp {
    private interval?: NodeJS.Timer;
    private mSender: MessageSender;
    private mGetter: MessageGetter;
    private contactReverseLookup: ReverseLookp = {};

    constructor(factory: MessageHandlerFactory) {
        console.log("Initializing MessagesApp...");
        this.mSender = factory.getMessageSender();
        this.mGetter = factory.getMessageGetter();

        if (LOCAL_FILE_MANGER.exists(CONTACT_CACHE_PATH)) {
            this.contactReverseLookup = LOCAL_FILE_MANGER.readJson(CONTACT_CACHE_PATH);
            console.log("consumed contact cache from local disk");
        }

        factory
            .getContactGetter()
            .getReverseLookup()
            .then(normalizeContactLookup)
            .then((reverseLookup) => {
                this.contactReverseLookup = reverseLookup;
                console.log("Reverse Lookup table registered.", "length:", Object.keys(reverseLookup).length);
                LOCAL_FILE_MANGER.writeJson(CONTACT_CACHE_PATH, reverseLookup);
            });
    }

    private substituteContactAliasInPlace = (message: IMFMessage) => {
        const alias = this.contactReverseLookup[message.handle];
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
            if (!this.isReady()) return;
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

    isReady = () => Object.keys(this.contactReverseLookup).length > 0;

    cleanup = () => {
        this.stopListening();
        this.mSender.close();
        this.mGetter.close();
    };
}

export default MessagesApp;
