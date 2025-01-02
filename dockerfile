# Stage 1: Build the project
FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

ARG ENV
RUN if [ -z "$ENV" ]; then echo "ENV build argument is required" && exit 1; fi
COPY env/${ENV}/.env .env

RUN npm run build

RUN rm -rf env

# Stage 2: Serve with a production server
FROM node:18-alpine

RUN apk add --no-cache curl

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/.next ./.next
COPY --from=build /usr/src/app/public ./public
COPY --from=build /usr/src/app/.env ./.env 
COPY --from=build /usr/src/app/next.config.ts ./next.config.ts
COPY package*.json ./

# RUN npm install --omit=dev
RUN npm ci --omit=dev
ENV NODE_ENV=production

EXPOSE 8003

CMD ["npm","run", "startBuild", "--", "--port", "8003"]
