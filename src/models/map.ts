import * as https from "https";
import * as http from "http";
import * as bodyParser from "body-parser";
import { Promise } from "es6-promise";

/**
 * / Maps
 *
 * @class Map
 */
export class Map {

    private address: string;
    private apiKey: string = "AIzaSyDVHr6WB6Q3mH-Npc_i-VEWt333-avEdzM";
    private baseHost: string = "maps.googleapis.com";
    private basePath: string = "/maps/api/geocode/json";

    constructor(address: string) {
        this.address = address;
    }

    public GetCoordinates(): Promise<Coordinates> {

        let promise: Promise<Coordinates> = new Promise<Coordinates>(
            (resolve: (coordinates: Coordinates)=> void, reject: (error: Error)=> void) => {

                https.get(this.GetOptions(), function(res: http.IncomingMessage): void {
                    let data: string = "";

                    res.setEncoding("utf8");
                    res.on("data", function(chunk: string): void {
                        data += chunk;
                    });

                    res.on("end", function() {
                        let jsonData: any = JSON.parse(data);
                        let coordinates: Coordinates = new Coordinates();
                        coordinates.latitude = jsonData.results[0].geometry.location.lat;
                        coordinates.longitude = jsonData.results[0].geometry.location.lng;    
                        resolve(coordinates)
                    });
                }).on("error", function(error: Error): void {
                    reject(error);
                });
            }
        ); 

        return promise;
    }

    private GetOptions(): https.RequestOptions {
        let options: https.RequestOptions = {
            host: this.baseHost,
            path: this.basePath + "?address=" + this.address + "&key=" + this.apiKey,
            protocol: "https:",
            method: "GET",
            port: 443
        };

        return options;
    }
}

export class Coordinates {

    public latitude: string;
    public longitude: string;
}