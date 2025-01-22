import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import logger from "./modules/logger";
import Initializer from "./initializer";
import { PrismaClient } from "@prisma/client";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import cron from "node-cron";
import axios from "axios";

dotenv.config();

class Server {
  private app: express.Application;
  public prisma: PrismaClient;
  private port: number = Number(process.env.PORT) || 8080;
  private static instance: Server = new this();

  constructor() {
    this.app = express();
    this.prisma = new PrismaClient();
    this.initHealthCheck();
  }

  private initHealthCheck() {
    const healthCheckUrl = process.env.BACKEND_URL!;
    cron.schedule("*/5 * * * *", async () => {
      try {
        const response = await axios.get(healthCheckUrl);
        logger.info(`Health check succeeded: ${response.status}`);
      } catch (error: any) {
        logger.error(`Health check failed: ${error.message}`);
      }
    });
    logger.info("Health check cron job initialized");
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
    await this.prisma.$connect();
    console.log("Database connected successfully");

    // cors configuration
    const corsOptions = {
      origin: [
        "*",
        process.env.FRONTEND_URL,
        "http://localhost:3000",
        "https://clerk.com",
      ].filter(Boolean) as string[],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-csrf-token",
        "clerk-session-id",
        "clerk-user-id",
      ],
      credentials: true,
      maxAge: 600,
    };

    this.app.use(bodyParser.json());
    this.app.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );
    this.app.use(ClerkExpressWithAuth());
    this.app.use(cors(corsOptions));

    // security headers
    this.app.use((req, res, next) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "DENY");
      res.setHeader("X-XSS-Protection", "1; mode=block");
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains"
      );
      next();
    });

    this.app.use(this.log);
    new Initializer().init(this.app);
    this.app.get("/", (req: any, res: any) => {
      return res.status(200).json({
        message: "Server running",
      });
    });
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}

Server.fn.start();
