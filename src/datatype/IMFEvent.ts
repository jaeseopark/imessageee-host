import IMFMessage, { Conversation } from "./IMFMessage";

type IMFEvent = {
    messages?: IMFMessage[];
    conversations?: Conversation[];
};

export default IMFEvent;
