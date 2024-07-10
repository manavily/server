import express from "express";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import logger from "./lib/logger";
import error from "./middleware/error";
import routes from "./routes";

const app = express();

app.use(express.json());

app.use(compression());
app.use(cookieParser());
app.use(cors());
app.use(helmet());

app.use(routes);
app.use(error);

app.listen(process.env.PORT, () => logger.info(process.env.APPLICATION_NAME + " is running on port " + process.env.PORT));
