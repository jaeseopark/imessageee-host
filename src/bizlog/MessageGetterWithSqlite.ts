import fs from "fs";
import sqlite3 from "sqlite3";

import IMFMessage, { IMFMessageStatus } from "../datatype/IMFMessage";
import { MessageGetter } from "../interface/MessageGetter";

const SQLITE_PATH = `${process.env.HOME}/Library/Messages/chat.db`;

const GET_MESSAGES_BY_ORG_DATE = fs.readFileSync("src/sql/getMessagesByOriginalDate.sql", { encoding: "utf-8" });

const getMessageStatus = (isFromMe: boolean): IMFMessageStatus => {
    // TODO need more params to make a better decision here.
    return isFromMe ? "sent" : "received";
};

class MessageGetterWithSqlite implements MessageGetter {
    private db = new sqlite3.Database(SQLITE_PATH);
    private latestMessageId = 0;

    private getMessages = (messageDate: number, limit: number): Promise<IMFMessage[]> =>
        new Promise((resolve, reject) => {
            const params = [messageDate, limit];
            this.db.all(GET_MESSAGES_BY_ORG_DATE, params, (err, rows) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }

                const messages: IMFMessage[] = rows.map((row) => ({
                    id: row.message_id,
                    service: row.service,
                    timestamp: row.message_date,
                    status: getMessageStatus(row.is_from_me),
                    handle: row.chat_identifier,
                    alias: row.chat_identifier,
                    content: {
                        text: row.text,
                    },
                }));
                resolve(messages);
            });
        });

    getRecentMessages = () => this.getMessages(0, 1000);

    getNewMessages = () =>
        this.getMessages(this.latestMessageId, 25).then((messages) => {
            if (messages.length > 0) {
                // messages are ordered in descending order
                const [latestMessage] = messages;
                this.latestMessageId = latestMessage.id;
                console.log(`this.latestMessageId=${this.latestMessageId}`);
            }
            return messages;
        });

    close = () => {
        try {
            this.db.close();
            console.log("DB closed successfully");
        } catch (err) {
            console.error(err);
        }
    };
}

export default MessageGetterWithSqlite;
