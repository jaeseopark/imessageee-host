import IMFMessage from "./IMFMessage";

export type IMFEventType = "MESSAGE_PRELOAD" | "MESSAGE_NEW" | "CONTACTS";

type IMFEvent = {
    messages?: IMFMessage[];
    type: IMFEventType;
};

export default IMFEvent;
