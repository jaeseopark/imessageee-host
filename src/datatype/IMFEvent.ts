import IMFMessage, { Conversation } from "./IMFMessage";

type IMFEvent = {
    message?: IMFMessage & { isNew: boolean };
    conversations?: Conversation[];
};

export default IMFEvent;
