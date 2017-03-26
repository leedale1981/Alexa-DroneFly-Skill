"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_1 = require("./route");
class CanIFlyRoute extends route_1.BaseRoute {
    static create(router) {
        console.log("[CanIFlyRoute::create] Creating index route.");
        router.get("/api/canifly", (req, res, next) => {
            new CanIFlyRoute().index(req, res, next);
        });
    }
    constructor() {
        super();
    }
    index(req, res, next) {
    }
}
exports.CanIFlyRoute = CanIFlyRoute;
