import cors from "cors";
import express from "express";
import expressWs from "express-ws";

import {
    isValidJson
} from "./serial.js";
import MessagesApp from "./MessagesApp.js";
import MessageHandlerFactoryImpl from "./bizlog/MessageHandlerFactoryImpl.js";

const port = process.env.IMF_PORT || 5000;
const wsInstance = expressWs(express());
const app = wsInstance.app;
const wsServer = wsInstance.getWss();

const messageHandlerFactory = new MessageHandlerFactoryImpl();
const messages = new MessagesApp(messageHandlerFactory);

app.use(express.json());
app.use(
    cors({
        origin: "*",
    })
);

// Handle outgoing messages (written by me)
app.ws("/", (ws) => {
    ws.send(JSON.stringify(messages.getRecentConversations()));

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

        messages.send(reqBody)
            .catch((error) =>
                ws.send(
                    JSON.stringify({
                        error,
                    })
                )
            );
    });
});

// Handle incoming messages (written by a friend)
messages.listen((m) => wsServer.clients.forEach(client => client.send(JSON.stringify(m))));

app.listen(port, () => console.log(`Listening on port ${port}...`));
