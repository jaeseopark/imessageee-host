export const getTextScript = (message, recipient) =>
    Promise.resolve(`
    tell application "Messages"
        set targetService to 1st service whose service type = iMessage
        set msg to "${message}"
        set recipient to buddy "${recipient}" of targetService
        send msg to recipient
    end tell
    `);
