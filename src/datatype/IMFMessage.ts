export type IMFMessageStatus = "sending" | "sent" | "read" | "received";

export type AttachmentType = "photo" | "video";

export type IMFService = "iMessage" | "SMS";

type IMFBaseMessage = {
    handle: string;
    content: {
        text?: string;
        attachment?: {
            type: AttachmentType;
            data: string; // placeholder
        };
    };
};

export type IMFOutgoingMessage = IMFBaseMessage & {
    service?: Service;
};

type IMFMessage = IMFBaseMessage & {
    id: number;
    service: Service;
    alias: string;
    status: IMFMessageStatus;
    timestamp: number;
};

export default IMFMessage;
