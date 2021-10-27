import { ICloudHandlerFactory } from "../interface/ICloudHandlerFactory";
import MessageGetterWithSqlite from "./MessageGetterWithSqlite";
import AppleScriptExecuter from "./AppleScriptExecuter"

class MessageHandlerFactoryImpl implements ICloudHandlerFactory {
    private appleScriptExecutor = new AppleScriptExecuter();

    getContactGetter = () => this.appleScriptExecutor;

    getMessageSender = () => this.appleScriptExecutor;

    getMessageGetter = () => {
        return new MessageGetterWithSqlite();
    }
}

export default MessageHandlerFactoryImpl;
