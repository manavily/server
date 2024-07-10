import winston from "winston";

const logger = winston.createLogger({
  format: winston.format.json(),
  level: "debug",
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    // - Write all logs with importance level of `info` or less to `combined.log`
    // new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

export default logger;
