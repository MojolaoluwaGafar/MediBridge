"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const DB_1 = __importDefault(require("./config/DB"));
const DepartmentRoutes_1 = __importDefault(require("./Routes/DepartmentRoutes"));
const AuthRoutes_1 = __importDefault(require("./Routes/AuthRoutes"));
const BookingRoutes_1 = __importDefault(require("./Routes/BookingRoutes"));
const DoctorsRoutes_1 = __importDefault(require("./Routes/DoctorsRoutes"));
const ActivityRoutes_1 = __importDefault(require("./Routes/ActivityRoutes"));
const SupportRoutes_1 = __importDefault(require("./Routes/SupportRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
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
const isAllowedOrigin = (origin) => {
    if (!origin) {
        return true;
    }
    if (allowedOrigins.includes(origin)) {
        return true;
    }
    return /^(https?:\/\/)([\w.-]+\.)?(vercel\.app|app\.github\.dev)$/i.test(origin);
};
const corsOptions = {
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }
        console.warn("Blocked CORS origin:", origin);
        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "authToken"],
};
app.use((0, cors_1.default)(corsOptions));
app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "MediBridge Server running..." });
});
app.use("/api/auth", AuthRoutes_1.default);
app.use("/api", BookingRoutes_1.default);
app.use("/api", DoctorsRoutes_1.default);
app.use("/api", ActivityRoutes_1.default);
app.use("/api", SupportRoutes_1.default);
app.use("/api", DepartmentRoutes_1.default);
const startServer = async () => {
    try {
        (0, DB_1.default)();
        console.log("starting server");
        const PORT = process.env.PORT;
        app.listen(PORT, () => {
            console.log(`MediBridge Server is running at http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Startup error", error);
    }
};
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err.stack || err);
});
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err.stack || err);
});
startServer();
app.use((req, res) => {
    res.status(404).json({ success: false, message: "ROUTE NOT FOUND" });
});
