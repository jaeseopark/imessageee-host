export type IMFMessageStatus = "sending" | "sent" | "read" | "received";

export type IMFAttachmentType = "photo" | "video";

export type IMFService = "iMessage" | "SMS";

type IMFBaseMessage = {
    handle: string;
    content: {
        text?: string;
        attachment?: {
            type: IMFAttachmentType;
            data: string; // placeholder
        };
    };
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
