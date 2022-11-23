FROM node:18-alpine
WORKDIR /app


# Install pnpm
RUN npm install -g pnpm; \
   pnpm --version; \
   pnpm setup; \
   mkdir -p /usr/local/share/pnpm &&\
   export PNPM_HOME="/usr/local/share/pnpm" &&\
   export PATH="$PNPM_HOME:$PATH"; \
   pnpm bin -g

# Prepare start script
CMD ["pnpm", "start"]

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build the app
COPY . .
RUN pnpm build
