# Discord Bot - Node.js Template
<div align="center">
  <p>
    <a href="https://discord.gg/BTXJmW4Bh7"><img src="https://img.shields.io/discord/395423304112013334?logo=discord&logoColor=white" alt="Discord server" /></a>
    <a href="https://github.com/ssMMiles/discord-interactions/actions"><img src="https://github.com/ssMMiles/discord-interactions/actions/workflows/tests.yml/badge.svg" alt="Tests status" /></a>
  </p>
</div>

*A template Discord Bot made using [`@discord-interactions`](https://github.com/ssMMiles/discord-interactions) and a `fastify` webserver*

## Getting Started
### Cloning the repo
You can either use degit to locally clone this repo without git, or [create your own repo](https://github.com/ssMMiles/discord-interactions-node/generate) and use that.
```sh
npx degit ssMMiles/discord-interactions-node
```

After that, make sure to install dependencies using npm:
```sh
npm install
```

Copy `.env.example` into `.env` and fill it with your bot's details, and you're set:
```sh
npm run start

> bot-template@1.0.2 start
> node dist/index.js

Listening for interactions on 0.0.0.0:8080
```