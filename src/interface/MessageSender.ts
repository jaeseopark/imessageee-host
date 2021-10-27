import IMFMessage from "../datatype/IMFMessage";

export interface MessageSender {
    sendMessage: (m: IMFMessage) => Promise<void>;
    close: () => void;
};
