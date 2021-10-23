import cors from "cors";
import express from "express";
import enableWs from "express-ws";
import { runAppleScript } from "run-applescript";
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

const SUCCESS_JSON = {
  result: "success",
};

const sendMessagee = (message, recipient, attachment = null) =>
  getTextScript(message, recipient).then(runAppleScript);

app.get("/contacts", (_, res) => {
  // TODO: pull live data from the Contacts app.
  res.send({
    Khloe: "+17801234567",
    Jaeseo: "+17807654321",
  });
});

app.post("/msg", (req, res) => {
  console.log(req.body);
  sendMessagee(req.body.message, req.body.recipient, req.body.attachment).then(
    () => res.send(SUCCESS_JSON)
  );
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

    sendMessagee(reqBody.message, reqBody.recipient, reqBody.attachment)
      .then(() => ws.send(JSON.stringify(SUCCESS_JSON)))
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
