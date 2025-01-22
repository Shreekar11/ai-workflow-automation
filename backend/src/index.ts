import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import logger from "./modules/logger";
import Initializer from "./initializer";
import { PrismaClient } from "@prisma/client";
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

dotenv.config();

class Server {
  private app: express.Application;
  public prisma: PrismaClient;
  private port: number = Number(process.env.PORT) || 8080;
  private static instance: Server = new this();

  constructor() {
    this.app = express();
    this.prisma = new PrismaClient();
  }

  public static get fn(): Server {
    return this.instance;
  }

  private log = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.on("finish", () => {
      logger.info(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${
          res.statusMessage
        } ${res.get("Content-Length") || 0}`
      );
    });

    next();
  };

  public async start(): Promise<void> {

    // connect to the database
    await this.prisma.$connect();
    console.log("Database connected successfully");
    
    this.app.use(bodyParser.json());
    this.app.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );
    this.app.use(ClerkExpressWithAuth());
    this.app.use(cors());
    this.app.use(this.log);
    new Initializer().init(this.app);
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}

Server.fn.start();
