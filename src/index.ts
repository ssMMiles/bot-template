import {
  DiscordApplication,
  InteractionHandlerNotFound,
  InteractionHandlerTimedOut,
  UnauthorizedInteraction,
  UnknownApplicationCommandType,
  UnknownComponentType,
  UnknownInteractionType
} from "@discord-interactions/core";
import "@discord-interactions/verify";
import "dotenv/config";
import { fastify } from "fastify";
import { default as rawBody } from "fastify-raw-body";
import { Ping } from "./commands/index.js";

const REQUIRED_KEYS = ["CLIENT_ID", "TOKEN", "PUBLIC_KEY"];
const missing = REQUIRED_KEYS.filter((key) => !(key in process.env));

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

  await app.commands.register(new Ping());

  const server = fastify();
  await server.register(rawBody);

  server.post("/", async (req, res) => {
    const signature = req.headers["x-signature-ed25519"];
    const timestamp = req.headers["x-signature-timestamp"];

    if (typeof req.rawBody !== "string" || typeof signature !== "string" || typeof timestamp !== "string") {
      return res.code(400).send({
        error: "Invalid req"
      });
    }

    try {
      const [response, handling] = await app.handleInteraction(req.rawBody, signature, timestamp);

      response.then((response) => {
        // This part is for responding with interactions, and doesn't currently work here.
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

  const host = process.env.HOST ?? "0.0.0.0";
  const port = Number(process.env.PORT ?? 8080);

  server.listen({
    host,
    port
  });

  console.log(`Listening for interactions on ${host}:${port}.`);
})();
