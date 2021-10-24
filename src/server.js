import cors from "cors";
import express from "express";
import enableWs from "express-ws";
import { runAppleScript } from "run-applescript";
import IMFMessage from "./IMFMessage.js";
import { isValidJson } from "./serial.js";
import { getTextScript } from "./template.js";

const port = 5000;
const app = express();
enableWs(app);

app.use(express.json());
app.use(
    cors({
        origin: "*",
    })
);

const sendMessagee = (message) =>
    getTextScript(message.content.text, message.phoneOrEmail)
        .then(runAppleScript)
        .then(() => ({ ...message, status: "sent" }));

app.get("/contacts", (_, res) => {
    // TODO: pull live data from the Contacts app.
    res.send({
        Khloe: "+17801234567",
        Jaeseo: "+17807654321",
    });
});

app.post("/msg", (req, res) => {
    console.log(req.body);
    sendMessagee(req.body).then((body) => res.send(body));
});

app.ws("/msg", (ws) => {
    ws.on("message", (msg) => {
        if (!isValidJson(msg)) {
            return ws.send(
                JSON.stringify({
                    error: "Not a valid json string",
                })
            );
        }

        const reqBody = JSON.parse(msg);
        console.log(reqBody);

        sendMessagee(reqBody)
            .then((updatedMsg) => ws.send(JSON.stringify(updatedMsg)))
            .catch((error) =>
                ws.send(
                    JSON.stringify({
                        error,
                    })
                )
            );
    });
});

app.listen(port, () => console.log(`Listening on port ${port}...`));
