FROM node:16-alpine AS base

WORKDIR /usr/app

# Install env + dependencies

COPY .env .

COPY package.json .
COPY yarn.lock .

RUN yarn install

# Build
FROM base AS builder

COPY . .

RUN yarn build

# Copy and run
FROM base AS prod

COPY --from=builder /usr/app/dist ./dist

CMD yarn start
