import IMFMessage from "../datatype/IMFMessage";

export interface MessageGetter {
    getRecentMessages: () => Promise<IMFMessage[]>;
    getNewMessages: () => Promise<IMFMessage[]>;
    getAttachmentPath: (attachmentId: number) => Promise<string>;
    close: () => void;
}
