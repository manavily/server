import rateLimit from "express-rate-limit";

export default rateLimit({
  max: 100, // Maximum 100 requests per IP within a 1 minute period
  message: "Too many requests from this IP, please try again later.",
  windowMs: 1 * 60 * 1000, // 1 minutes
});
