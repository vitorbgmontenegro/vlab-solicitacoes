FROM node:20-alpine

WORKDIR /app

# O código é montado por volume no docker-compose (desenvolvimento).
# O npm install roda no command do compose para respeitar o volume de node_modules.

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
