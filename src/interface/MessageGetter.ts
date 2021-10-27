import IMFMessage from "../datatype/IMFMessage";

export interface MessageGetter {
    getRecentMessages: () => Promise<IMFMessage[]>;
    getNewMessages: () => Promise<IMFMessage[]>;
    close: () => void;
};
