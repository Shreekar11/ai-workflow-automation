import { PrismaClient } from "@prisma/client";
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { Initializer } from "./util/initializer";

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

  public async start(): Promise<void> {
    await this.prisma.$connect();
    console.log("Database connected successfully");
    this.app.use(bodyParser.json());
    this.app.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );
    this.app.use(cors());
    new Initializer().init(this.app);
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}

Server.fn.start();
