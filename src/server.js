import express from "express";
import enableWs from "express-ws";
import cors from "cors";

import {
    runAppleScript
} from "run-applescript";

import {
    getTextScript
} from "./template.js";
import {
    isValidJson
} from "./util/serial.js";

const port = 5000;
const app = express();

app.use(express.json());
app.use(cors({
    origin: "*"
}));

enableWs(app);

const SUCCESS_JSON = {
    result: "success"
};

const SUCCESS_STR = JSON.stringify(SUCCESS_JSON);

const NOT_JSON_RES = JSON.stringify({
    error: "Not a valid json string"
});

app.get("/contacts", (_, res) => {
    // TODO: pull live data from the Contacts app.
    res.send({
        "Khloe": "+17801234567",
        "Jaeseo": "+17807654321"
    });
});

const sendMessagee = (message, recipient, attachment = null) =>
    getTextScript(message, recipient)
    .then(runAppleScript);

app.post("/msg", (req, res) => {
    console.log(req.body);
    sendMessagee(req.body.message, req.body.recipient, req.body.attachment)
        .then(() => res.send())
});

app.ws("/msg", (ws) => {
    ws.on("message", (msg) => {
        if (!isValidJson(msg)) {
            return ws.send(NOT_JSON_RES);
        }

        const reqBody = JSON.parse(msg);
        console.log(reqBody);

        sendMessagee(reqBody.message, reqBody.recipient, reqBody.attachment)
            .then(() => ws.send(SUCCESS_STR))
            .catch(error => {
                const serialError = JSON.stringify({
                    error
                });
                ws.send(serialError);
            });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}...`));
