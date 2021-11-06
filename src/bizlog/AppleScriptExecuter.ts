import crypto from "crypto";
import { runAppleScript, runAppleScriptSync } from "run-applescript";

import { IMFOutgoingMessage } from "../datatype/IMFMessage";
import ContactGetter from "../interface/ContactGetter";
import FSAdapter from "../interface/FSAdapter";
import { MessageSender } from "../interface/MessageSender";
import { fill } from "../util/strings";

const SEND_MESSAGE_SCRIPT_PATH = "sendMessage.applescript";
const GET_CONTACTS_SCRIPT_PATH = "getContacts.applescript";

class AppleScriptExecuter extends FSAdapter implements MessageSender, ContactGetter {
    constructor() {
        super("src/applescript");
    }

    sendMessage = (m: IMFOutgoingMessage) => {
        const params: { [keyword: string]: string } = {
            "%service%": m.service || "iMessage",
            "%recipient%": m.handle,
            "%message%": m.content.text as string
        };

        return this.readStringAsync(SEND_MESSAGE_SCRIPT_PATH)
            .then((template) => fill(template!, params))
            .then((script) => {
                runAppleScriptSync(script);
                console.log("message sent");
            })
    }

    getContacts = () => runAppleScript(this.readString(GET_CONTACTS_SCRIPT_PATH)!)
        .then((csvWithoutHeader: string) =>
            csvWithoutHeader.split("\n").reduce((acc: { [name: string]: string[] }, line: string) => {
                const [name, handle] = line.split(",");
                if (acc.hasOwnProperty(name)) acc[name].push(handle);
                else acc[name] = [handle];
                return acc;
            }, {})
        )
        .then((contactMap) => {
            return Object.keys(contactMap).map((name) => ({
                id: crypto.createHash('md5').update(name).digest('hex'),
                name,
                handles: contactMap[name],
                hasProfilePicture: false
            }));
        });

    close = () => {
        // No cleanup needed
    };
}

export default AppleScriptExecuter;
