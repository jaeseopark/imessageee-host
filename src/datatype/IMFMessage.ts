export type IMFMessageStatus = "sending" | "sent" | "read" | "received";

export type AttachmentType = "photo" | "video";

export type Service = "iMessage" | "SMS";

export type Conversation = {
    alias: string; // friend name or group name
     // one of: group id, phone number, and email address
    isGroup: boolean;
};

type IMFMessage = {
    id: number;
    timestamp: number;
    status: IMFMessageStatus;
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
