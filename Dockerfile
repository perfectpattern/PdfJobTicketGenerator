FROM alpine:3.11

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Installs latest Chromium (77) package.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn \
      npm \
      # Puppeteer v1.19.0 works with Chromium 77.
      && yarn add puppeteer@1.19.0  && \
      # Add user so we don't need --no-sandbox. \
      addgroup -S pptruser && adduser -S -g pptruser pptruser \
      && mkdir -p /home/pptruser/Downloads /app \
      && chown -R pptruser:pptruser /home/pptruser \
      && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
USER pptruser

WORKDIR /app
COPY --chown=pptruser:pptruser ["package.json","./"]
COPY --chown=pptruser:pptruser ["src","./src"]

RUN npm install
EXPOSE 8080
ENTRYPOINT npm start