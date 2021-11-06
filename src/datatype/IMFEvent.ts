import IMFContact from "./IMFContact";
import IMFMessage from "./IMFMessage";

export type IMFEventType = "MESSAGE_PRELOAD" | "MESSAGE_NEW" | "CONTACTS";

type IMFEvent = {
    messages?: IMFMessage[];
    contacts?: IMFContact[];
    type: IMFEventType;
};

export default IMFEvent;
