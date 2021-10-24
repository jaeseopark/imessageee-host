export type IMFMessageStatus = "sending" | "sent" | "read" | "received";

export type AttachmentType = "photo" | "video";

type IMFMessage = {
    id: string;
    timestamp: number;
    status: IMFMessageStatus;
    content: {
        text?: string;
        attachment?: {
            type: AttachmentType;
            data: Uint8Array;
        };
    };
    phoneOrEmail: string;
    isWrittenByMe: boolean;
};

export default IMFMessage;
