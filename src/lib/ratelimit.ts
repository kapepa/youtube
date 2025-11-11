import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})

export { ratelimit }