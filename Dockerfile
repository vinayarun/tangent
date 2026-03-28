FROM node:20-bullseye

# Install system dependencies for Tauri (Linux)
# https://tauri.app/v1/guides/getting-started/prerequisites#linux
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json ./

# Copy package.jsons (this is tricky in monorepo without copying everything, 
# for dev env we usually mount volume, so this is just base image setup)

CMD ["bash"]
