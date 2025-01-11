import winston from "winston";
import { config } from "dotenv";

config();
const logger = winston.createLogger({
  level: "debug",
  format: winston.format.json(),

  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export default logger;
