export type IMFMessageStatus = "sending" | "sent" | "read" | "received";

export type AttachmentType = "photo" | "video";

export type Service = "iMessage" | "SMS";

type IMFMessage = {
    id: number;
    timestamp: number;
    status: IMFMessageStatus;
    alias: string;
    handle: string;
    service: Service;
    content: {
        text?: string;
        attachment?: {
            type: AttachmentType;
            data: string; // placeholder
        };
    };
};

export default IMFMessage;
