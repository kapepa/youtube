import { Client } from "@upstash/workflow";

const workflow = new Client({ token: process.env.QSTASH_TOKEN! });

export { workflow }