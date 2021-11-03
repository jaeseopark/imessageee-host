import fs from "fs";
import sqlite3 from "sqlite3";

import IMFMessage, { IMFMessageStatus } from "../datatype/IMFMessage";
import { MessageGetter } from "../interface/MessageGetter";
import { resolveUserHome } from "../util/fspath";

const SQLITE_PATH = `${process.env.HOME}/Library/Messages/chat.db`;

const getMessageStatus = (isFromMe: boolean): IMFMessageStatus => {
    // TODO need more params to make a better decision here.
    return isFromMe ? "sent" : "received";
};

class MessageGetterWithSqlite implements MessageGetter {
    private GET_MESSAGES_BY_ORG_DATE = fs.readFileSync("src/sql/getMessagesByOriginalDate.sql", { encoding: "utf-8" });
    private GET_ATTACHMENT = fs.readFileSync("src/sql/getAttachmentPath.sql", { encoding: "utf-8" });

    private db = new sqlite3.Database(SQLITE_PATH);
    private latestMessageId = 0;

    private getMessages = (messageDate: number, limit: number): Promise<IMFMessage[]> =>
        new Promise((resolve, reject) => {
            const params = [messageDate, limit];
            this.db.all(this.GET_MESSAGES_BY_ORG_DATE, params, (err, rows) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }

                const messages: IMFMessage[] = rows.map((row) => {
                    const content = row.attachment_id ? { id: row.attachment_id, mimetype: row.mime_type } : { text: row.text };
                    return {
                        id: row.message_id,
                        service: row.service,
                        timestamp: row.message_date,
                        status: getMessageStatus(row.is_from_me),
                        handle: row.chat_identifier,
                        alias: row.chat_identifier,
                        content
                    };
                });
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

    getAttachmentPath = (attachmentId: number): Promise<string> => new Promise((resolve, reject) => {
        this.db.each(this.GET_ATTACHMENT, [attachmentId], (err, row) => {
            if (err) reject(err);
            resolve(resolveUserHome(row.filename as string));
        });
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
