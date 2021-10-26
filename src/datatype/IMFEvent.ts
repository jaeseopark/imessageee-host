import IMFMessage, { Conversation } from "./IMFMessage";

type DecoratedIMFMessage = IMFMessage & { isNew: boolean };

type IMFEvent = {
    messages?: DecoratedIMFMessage[];
    conversations?: Conversation[];
};

export default IMFEvent;
