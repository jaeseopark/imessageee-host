export type IMFMessageStatus = "sending" | "sent" | "read" | "received";

export type IMFService = "iMessage" | "SMS";

export type IMFMessageContent = {
    text?: string;
    attachment?: {
        id: number;
        mimetype: string;
    };
};

type IMFBaseMessage = {
    handle: string;
    content: IMFMessageContent;
};

export type IMFOutgoingMessage = IMFBaseMessage & {
    service?: IMFService;
};

type IMFMessage = IMFBaseMessage & {
    id: number;
    service: IMFService;
    alias: string;
    status: IMFMessageStatus;
    timestamp: number;
};

export default IMFMessage;
