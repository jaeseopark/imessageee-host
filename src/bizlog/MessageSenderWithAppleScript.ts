import {
    runAppleScriptSync
} from "run-applescript";

import IMFMessage from "../datatype/IMFMessage";
import { MessageSender } from "../interface/MessageHandler";
import { getTextScript } from "../template";

class MessageSenderWithAppleScript implements MessageSender {
    send = (m: IMFMessage) => getTextScript(m.content.text, m.conversation.handle)
        .then((script) => { runAppleScriptSync(script); });

    close = () => {
        // No cleanup needed
    };
}

export default MessageSenderWithAppleScript;
