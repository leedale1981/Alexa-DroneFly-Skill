"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
const es6_promise_1 = require("es6-promise");
class Map {
    constructor(address) {
        this.apiKey = "AIzaSyDVHr6WB6Q3mH-Npc_i-VEWt333-avEdzM";
        this.baseHost = "maps.googleapis.com";
        this.basePath = "/maps/api/geocode/json";
        this.address = address;
    }
    GetCoordinates() {
        let promise = new es6_promise_1.Promise((resolve, reject) => {
            https.get(this.GetOptions(), function (res) {
                let data = "";
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    data += chunk;
                });
                res.on("end", function () {
                    let jsonData = JSON.parse(data);
                    let coordinates = new Coordinates();
                    coordinates.latitude = jsonData.results[0].geometry.location.lat;
                    coordinates.longitude = jsonData.results[0].geometry.location.lng;
                    resolve(coordinates);
                });
            }).on("error", function (error) {
                reject(error);
            });
        });
        return promise;
    }
    GetOptions() {
        let options = {
            host: this.baseHost,
            path: this.basePath + "?address=" + this.address + "&key=" + this.apiKey,
            protocol: "https:",
            method: "GET",
            port: 443
        };
        return options;
    }
}
exports.Map = Map;
class Coordinates {
}
exports.Coordinates = Coordinates;
//# sourceMappingURL=map.js.map