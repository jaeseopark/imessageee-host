import { MessageHandlerFactory } from "../interface/MessageHandler";
import MessageGetterWithSqlite from "./MessageGetterWithSqlite";
import MessageSenderWithAppleScript from "./MessageSenderWithAppleScript"

class MessageHandlerFactoryImpl implements MessageHandlerFactory {
    getMessageSender = () => {
        return new MessageSenderWithAppleScript();
    };

    getMessageGetter = () => {
        return new MessageGetterWithSqlite();
    }
}

export default MessageHandlerFactoryImpl;
