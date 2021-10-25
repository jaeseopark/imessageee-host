import IMFMessage, { Conversation } from "../datatype/IMFMessage";

export interface MessageGetter {
    getNewIncomingMessages: () => IMFMessage[];
    getUpdatesToExistingMessages: () => IMFMessage[];
    getRecentConversations: (limit: number) => Conversation[];
};

export interface MessageSender {
    send: (m: IMFMessage) => Promise<void>;
};

export interface MessageHook {
    // kinda like MessageGetter but receive events instead of poll.
    // TODO: when Apple adds support for hooks.
}

export interface MessageHandlerFactory {
    getMessageGetter: () => MessageGetter;
    getMessageSender: () => MessageSender;
};
