# F1-Frontend-React/Dockerfile
FROM node:20-alpine

# Installa solo libpq-dev per PostgreSQL
WORKDIR /app

# Installa le dipendenze
COPY package*.json ./
RUN npm install

# Copia il codice sorgente
COPY . .

# Porta 5173
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]