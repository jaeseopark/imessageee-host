export type IMFMessageStatus = "sending" | "sent" | "read" | "received";

export type AttachmentType = "photo" | "video";

export type ConversationType = "iMessage" | "SMS";

export type Conversation = {
    alias: string; // friend name or group name
    handle: string; // one of: group id, phone number, and email address
    isGroup: boolean;
    type: ConversationType;
};

type IMFMessage = {
    id: string;
    timestamp: number;
    status: IMFMessageStatus;
    conversation: Conversation;
    content: {
        text?: string;
        attachment?: {
            type: AttachmentType;
            data: string; // placeholder
        };
    };
};

export default IMFMessage;
