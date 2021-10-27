import {
    runAppleScriptSync
} from "run-applescript";

import IMFMessage from "../datatype/IMFMessage";
import { MessageSender } from "../interface/MessageHandler";

export const getTextScript = (message: string, recipient: string, service: string) =>
    Promise.resolve(`
    tell application "Messages"
        set targetService to "${service}"
        set msg to "${message}"
        set recipient to buddy "${recipient}" of targetService
        send msg to recipient
    end tell
    `);


class MessageSenderWithAppleScript implements MessageSender {
    send = (m: IMFMessage) => getTextScript(m.content.text, m.handle)
        .then((script) => { runAppleScriptSync(script); });

    close = () => {
        // No cleanup needed
    };
}

export default MessageSenderWithAppleScript;
