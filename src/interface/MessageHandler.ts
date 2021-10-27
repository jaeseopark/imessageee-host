import IMFMessage from "../datatype/IMFMessage";

export interface MessageGetter {
    getRecentMessages: () => Promise<IMFMessage[]>;
    getNewMessages: () => Promise<IMFMessage[]>;
    close: () => void;
};

export interface MessageSender {
    send: (m: IMFMessage) => Promise<void>;
    close: () => void;
};

export interface MessageHook {
    // kinda like MessageGetter but receive events instead of poll.
    // TODO: when Apple adds support for hooks.
}

export interface MessageHandlerFactory {
    getMessageGetter: () => MessageGetter;
    getMessageSender: () => MessageSender;
};
