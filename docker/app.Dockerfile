# Made by Jack (iamjustjack.de)
FROM mcr.microsoft.com/playwright:v1.63.0-noble AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run og && npm run build

FROM nginx:1.27-alpine
RUN apk add --no-cache nodejs
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/gallery /usr/share/nginx/html
COPY package.json /opt/paperpop/package.json
COPY mcp /opt/paperpop/mcp
COPY src /opt/paperpop/src
COPY docs/components.json /opt/paperpop/docs/components.json
COPY docs/components /opt/paperpop/docs/components
COPY docs/guides /opt/paperpop/docs/guides
COPY docker/entrypoint.sh /entrypoint.sh
EXPOSE 80
CMD ["/entrypoint.sh"]
