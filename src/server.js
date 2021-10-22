import express from "express";

import {
    runAppleScript
} from "run-applescript";

import {
    getTextScript
} from "./template.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.listen(port, () => {
    console.log(`listening on port ${port}...`);
});

app.get("/", (_, res) => {
    res.send({
        result: "server is running"
    });
});

app.get("/contacts", (_, res) => {
    // TODO: pull live data from the Contacts app.
    res.send({
        "Khloe": "+17801234567"
    });
})

app.post("/msg", (req, res) => {
    if (req.attachment) {
        // TODO
    } else {
        getTextScript(req.body.message, req.body.recipient)
            .then(runAppleScript)
            .then((result) =>
                res.send({
                    result
                }));
    }
});