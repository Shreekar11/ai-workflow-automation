"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const dotenv_1 = require("dotenv");
const nodemailer_1 = __importDefault(require("nodemailer"));
(0, dotenv_1.config)();
class EmailService {
    constructor(to, from, subject, body) {
        this.to = to;
        this.from = from;
        this.subject = subject;
        this.body = body;
    }
    sendEmailFunction() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transporter = nodemailer_1.default.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.MAIL_USERNAME,
                        pass: process.env.MAIL_PASSWORD,
                    },
                    tls: {
                        rejectUnauthorized: false,
                    },
                });
                const mailOptions = {
                    to: this.to,
                    from: `Workflow Automation <${this.from}>`,
                    subject: this.subject,
                    text: this.body,
                    html: this.body,
                };
                const info = yield transporter.sendMail(mailOptions);
                console.log("Email sent successfully:", info.messageId);
                return true;
            }
            catch (error) {
                console.error("Error sending email:", error);
                return false;
            }
        });
    }
}
exports.EmailService = EmailService;
