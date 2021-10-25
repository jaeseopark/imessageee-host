import { MessageGetter } from "../interface/MessageHandler";

class MessageGetterWithSqlite implements MessageGetter {
    getRecentConversations = (limit: number) => {
        // mock data
        return [{
            alias: "Jaeseo",
            handle: "+17801234567",
            isGroup: false
        }];
    };

    getNewIncomingMessages = () => {
        return [];
        // throw new Error("Not implemented");
    };

    getUpdatesToExistingMessages = () => {
        return [];
        // throw new Error("Not implemented");
    };

};

export default MessageGetterWithSqlite;
