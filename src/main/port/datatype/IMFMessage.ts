export type IMFMessageStatus = "sending" | "sent" | "read" | "received";

export type IMFService = "iMessage" | "SMS";

export type IMFAttachment = {
    id: number;
    mimetype: string;
    size: number;
};

export type IMFMessageContent = {
    text?: string;
    attachments?: IMFAttachment[];
};

export type IMFOutgoingMessageContent = {
    text?: string;
    attachment?: {
        data: string; // b64 to make it work with the existing endpoint -- consider using bytestream later.
        mimetype: string;
    };
};

type IMFBaseMessage = {
    handle: string;
};

export type IMFOutgoingMessage = IMFBaseMessage & {
    service?: IMFService;
    content: IMFOutgoingMessageContent;
};

type IMFMessage = IMFBaseMessage & {
    id: number;
    service: IMFService;
    alias: string;
    status: IMFMessageStatus;
    timestamp: number;
    content: IMFMessageContent;
};

export default IMFMessage;
