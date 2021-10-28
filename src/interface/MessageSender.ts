import { IMFOutgoingMessage } from "../datatype/IMFMessage";

export interface MessageSender {
    sendMessage: (m: IMFOutgoingMessage) => Promise<void>;
    close: () => void;
}
