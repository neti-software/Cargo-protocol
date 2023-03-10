FROM node:16.10-stretch-slim
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY . .
RUN chmod +x start.sh
EXPOSE 3003
CMD ["./start.sh"]