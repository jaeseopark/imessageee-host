import fs from "fs";
import { runAppleScript, runAppleScriptSync } from "run-applescript";

import { IMFOutgoingMessage } from "../datatype/IMFMessage";
import ContactGetter, { ReverseLookp } from "../interface/ContactGetter";
import { MessageSender } from "../interface/MessageSender";

const getTextScript = (message: string, recipient: string, service: string) =>
    Promise.resolve(`
    tell application "Messages"
        set targetService to 1st service whose service type = ${service}
        set msg to "${message}"
        set recipient to buddy "${recipient}" of targetService
        send msg to recipient
    end tell
    `);

const GET_CONTACTS_SCRIPT = fs.readFileSync("src/applescript/getContacts.applescript", { encoding: "utf-8" });

class AppleScriptExecuter implements MessageSender, ContactGetter {
    sendMessage = (m: IMFOutgoingMessage) =>
        getTextScript(m.content.text!, m.handle, m.service || "iMessage").then((script) => {
            runAppleScriptSync(script);
            console.log("message sent");
        });

    getContacts = () =>
        runAppleScript(GET_CONTACTS_SCRIPT)
            .then((csvWithoutHeader: string) =>
                csvWithoutHeader.split("\n").reduce((acc: { [name: string]: string[] }, line: string) => {
                    const [name, handle] = line.split(",");
                    if (acc.hasOwnProperty(name)) acc[name].push(handle);
                    else acc[name] = [handle];
                    return acc;
                }, {})
            )
            .then((contactMap) => {
                return Object.keys(contactMap).map((name) => ({ name, handles: contactMap[name] }));
            });

    getReverseLookup = () =>
        this.getContacts().then((contacts) =>
            contacts.reduce((acc: ReverseLookp, contact) => {
                contact.handles.forEach((handle) => {
                    acc[handle] = contact.name;
                });
                return acc;
            }, {})
        );

    close = () => {
        // No cleanup needed
    };
}

export default AppleScriptExecuter;
