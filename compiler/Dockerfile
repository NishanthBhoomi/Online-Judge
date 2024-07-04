FROM node:18-alpine
WORKDIR /app
RUN apk update && \
    apk add --no-cache g++ openjdk11-jdk python3 py3-pip build-base && \
    apk add --no-cache python3-dev libffi-dev

# Create a virtual environment and activate it
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"

# Upgrade pip in the virtual environment
RUN pip install --upgrade pip
COPY package*.json .
RUN npm i
COPY . .
EXPOSE 5000
CMD ["node","index.js"]