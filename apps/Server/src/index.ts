import express, { Application,Request, Response} from "express"
import dotenv from 'dotenv'
import cors from "cors"
import connectDB from "./config/DB"
import DepartmentRoutes from "./Routes/DepartmentRoutes"
import Authroutes from "./Routes/AuthRoutes"
import BookingRoutes from "./Routes/BookingRoutes"
import DoctorsRoutes from "./Routes/DoctorsRoutes"
import ActivityRoutes from "./Routes/ActivityRoutes"
import SupportRoutes from "./Routes/SupportRoutes"
import FlagRoutes from "./Routes/FlagRoutes"
import { logger, httpLogger } from "./Utils/logger"
import { apiLimiter, authLimiter, loginAccountLimiter, codeRequestAccountLimiter, aiLimiter } from "./middlewares/RateLimiter"
dotenv.config()
const app : Application = express()

// Render puts one proxy in front of the app; trusting it makes req.ip the real
// client IP, which the rate limiter keys on.
app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS ?? 1))
app.use(httpLogger)
app.use(express.json())

const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...configuredOrigins,
  "https://medi-bridge-client.vercel.app",
  "https://medi-bridge-client-git-main-mojolaoluwa-gafars-projects.vercel.app",
  "https://medi-bridge-client-58y7urxxy-mojolaoluwa-gafars-projects.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];

const isAllowedOrigin = (origin: string | undefined) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return /^(https?:\/\/)([\w.-]+\.)?(vercel\.app|app\.github\.dev)$/i.test(origin);
};

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    logger.warn({ origin }, "Blocked CORS origin");
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "authToken"],
};

app.use(cors(corsOptions));
app.get("/", (req : Request , res : Response)=>{  
    res.status(200).json({ success : true, message : "MediBridge Server running..."})
})
app.use("/api", apiLimiter)
app.use("/api/auth", authLimiter)
app.post("/api/auth/login", loginAccountLimiter)
app.post(["/api/auth/verifyUser", "/api/auth/codeReq"], codeRequestAccountLimiter)
app.use("/api/aiChat", aiLimiter)
app.use("/api/auth", Authroutes)
app.use("/api", BookingRoutes)
app.use("/api", DoctorsRoutes)
app.use("/api", ActivityRoutes)
app.use("/api", SupportRoutes)
app.use("/api", FlagRoutes)
app.use("/api", DepartmentRoutes)

const startServer = async () => {
    try {
        connectDB()
    
        logger.info("Starting server");
        const PORT : string | undefined = process.env.PORT
        app.listen(PORT, ()=>{
            logger.info(`MediBridge Server is running at http://localhost:${PORT}`);

        })
    } catch (error) {
        logger.error({ err: error }, "Startup error");
    }
}
process.on("uncaughtException", (err : any) => {
  logger.fatal({ err }, "Uncaught exception");
});
process.on("unhandledRejection", (err : any) => {
  logger.error({ err }, "Unhandled rejection");
});
startServer()

app.use((req : Request, res : Response) => {
  res.status(404).json({ success: false, message: "ROUTE NOT FOUND" });
});
