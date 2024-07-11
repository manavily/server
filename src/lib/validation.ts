import type {ZodType} from "zod";

export default function <T>(schema: ZodType, request: T): T {
  return schema.parse(request);
}
