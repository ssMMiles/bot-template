import {
  DiscordApplication,
  InteractionHandlerNotFound,
  InteractionHandlerTimedOut,
  UnauthorizedInteraction,
  UnknownApplicationCommandType,
  UnknownComponentType,
  UnknownInteractionType
} from "@discord-interactions/core";
import "@discord-interactions/verify-node";
import "dotenv/config";
import fastify from "fastify";
import rawBody from "fastify-raw-body";
import { Config, Ping } from "./commands/index.js";

const keys = ["CLIENT_ID", "TOKEN", "PUBLIC_KEY", "PORT"];

const missing = keys.filter((key) => !(key in process.env));

if (missing.length !== 0) {
  console.error(`Missing Enviroment Variable${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`);
  process.exit(1);
}

(async () => {
  const cache = new Map();

  const app = new DiscordApplication({
    clientId: process.env.CLIENT_ID as string,
    token: process.env.TOKEN as string,
    publicKey: process.env.PUBLIC_KEY as string,

    cache: {
      get: async (key: string) => cache.get(key),
      set: async (key: string, ttl: number, value: string) => {
        cache.set(key, value);
      }
    }
  });

  await app.commands.register(new Ping(), new Config());

  const server = fastify();
  server.register(rawBody);

  server.post("/", async (req, res) => {
    const signature = req.headers["x-signature-ed25519"];
    const timestamp = req.headers["x-signature-timestamp"];

    if (typeof req.rawBody !== "string" || typeof signature !== "string" || typeof timestamp !== "string") {
      return res.code(400).send({
        error: "Invalid req"
      });
    }

    try {
      const [response, handling] = app.handleInteraction(req.rawBody, timestamp, signature);

      response.then((response) => {
        if (response.constructor.name === "FormData") {
          res.send(response);
          return;
        }

        res.code(200).send(response);
      });

      await handling;
    } catch (err) {
      if (err instanceof UnauthorizedInteraction) {
        console.error("Unauthorized Interaction");
        return res.code(401).send();
      }

      if (err instanceof InteractionHandlerNotFound) {
        console.error("Interaction Handler Not Found");
        console.dir(err.interaction);

        return res.code(404).send();
      }

      if (err instanceof InteractionHandlerTimedOut) {
        console.error("Interaction Handler Timed Out");

        return res.code(408).send();
      }

      if (
        err instanceof UnknownInteractionType ||
        err instanceof UnknownApplicationCommandType ||
        err instanceof UnknownComponentType
      ) {
        console.error("Unknown Interaction - Library may be out of date.");
        console.dir(err.interaction);

        return res.code(400).send();
      }

      console.error(err);
    }
  });

  const address = "0.0.0.0";
  const port = process.env.PORT as string;

  server.listen(port, address);
  console.log(`Listening for interactions on ${address}:${port}.`);
})();
