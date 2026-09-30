FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

RUN npm install --omit=dev

# Bundle app source
COPY . .

# Ensure data and uploads directories exist
RUN mkdir -p data uploads

EXPOSE 5000

CMD ["npm", "start"]
