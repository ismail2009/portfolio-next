import { makeRouteHandler } from "@keystatic/next/route-handler";
import config, { adminEnabled } from "../../../../../keystatic.config";

const handlers = makeRouteHandler({ config });
const disabled = () => new Response("Not Found", { status: 404 });

export const GET = adminEnabled ? handlers.GET : disabled;
export const POST = adminEnabled ? handlers.POST : disabled;
