import ContactGetter from "./ContactGetter";
import { MessageGetter } from "./MessageGetter";
import { MessageSender } from "./MessageSender";

export interface ICloudHandlerFactory {
    getMessageGetter: () => MessageGetter;
    getMessageSender: () => MessageSender;
    getContactGetter: () => ContactGetter;
};
