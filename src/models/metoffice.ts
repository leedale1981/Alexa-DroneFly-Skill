import * as Mapping from "./map";
import * as http from "http";
import { Promise } from "es6-promise";

/**
 * / Met Office
 *
 * @class MetOffice
 */
export class MetOffice {

    private apiKey: string = "30d2c41c-20e6-4aec-9385-6d359d413bb3";
    private baseHost: string = "datapoint.metoffice.gov.uk";
    private basePath: string = "/public/data/";
    private address: string;
    private retryCount: number = 3;

    constructor(address: string) {
        this.address = address;
    }

    public GetMetData(): Promise<Forecast> {
        let self = this;
        let promise: Promise<Forecast> = new Promise<Forecast>(
            (resolve: (forecast: Forecast)=> void, reject: (str: string)=> void) => {
                let map = new Mapping.Map(this.address);

                map.GetCoordinates().then(function(coordinates: Mapping.Coordinates): Promise<number> {
                    return self.GetLocationIdFromCoords(coordinates);
                }).then(function(locationId: number): Promise<Forecast> {
                    return self.GetForcastFromLocation(locationId);
                }).then(function(forecast: Forecast): void {
                    resolve(forecast);
                }).catch(function(error: string): void {
                    reject(error);  
                });
            }
        );

        return promise;
    }

    private MapJsonToForecast(json: any): Forecast {
        let forecast: Forecast = new Forecast();
        forecast.windSpeed = json.S;
        forecast.windDirection = json.D;
        forecast.weatherType = json.W;
        forecast.visibility = json.V;
        forecast.precipitationChance = json.PPn;
        return forecast;
    }

    private GetForcastFromLocation(locationId: number) : Promise<Forecast> {
        let self = this;
        let promise: Promise<Forecast> = new Promise<Forecast>(
            (resolve: (forecast: Forecast)=> void, reject: (error: Error)=> void) => {
                http.get(this.GetForecastOptions(locationId.toString()), function(res: http.IncomingMessage): void {
                    let data: string = "";

                    res.setEncoding("utf8");
                    res.on("data", function(chunk: string): void {
                        data += chunk;
                    });

                    res.on("end", function() {
                        let json = JSON.parse(data);
                        let forecastValue: any = json.SiteRep.DV.Location.Period[0].Rep[0];
                        let forecast: Forecast = self.MapJsonToForecast(forecastValue);
                        resolve(forecast);
                    });
                }).on("error", function(error: Error): void {
                    reject(error);
                });
            }
        );
        
        return promise;
    }

    private GetLocationIdFromCoords(coordinates: Mapping.Coordinates): Promise<number> {
        let self = this;
        let retryIndex: number = 1;

        let promise: Promise<number> = new Promise<number>(
            (resolve: (locationId: number)=> void, reject: (error: Error)=> void) => {
                http.get(this.GetSiteListOptions(), function(res: http.IncomingMessage): void {
                    let data: string = "";

                    res.setEncoding("utf8");
                    res.on("data", function(chunk: string): void {
                        data += chunk;
                    });

                    res.on("end", function() {
                        if (data !== "") {
                            resolve(self.GetLocationIdFromData(data, coordinates));
                        }
                        else {
                            if (retryIndex <= self.retryCount) {
                                retryIndex++;
                                self.GetLocationIdFromCoords(coordinates).then(function(locationId: number): void {
                                    resolve(locationId)
                                });
                            }
                        }
                    });
                }).on("error", function(error: Error): void {
                    reject(error);
                });
            }
        );

        return promise;
    }

    private GetLocationIdFromData(data: string, coordinates: Mapping.Coordinates): number {
        let json = JSON.parse(data);
        let locations: Array<any> = json.Locations.Location;
        let locationId: number;
        let resolution: number = 0.04;
        let latHigh: number = parseFloat(coordinates.latitude) + resolution;
        let latLow: number = parseFloat(coordinates.latitude) - resolution;
        let longHigh: number = parseFloat(coordinates.longitude) + resolution;
        let longLow: number = parseFloat(coordinates.longitude) - resolution;
        
        locations.forEach(function(location: any, index: number): void {
            if (parseFloat(location.latitude) < latHigh &&
                parseFloat(location.latitude) > latLow &&
                parseFloat(location.longitude) < longHigh &&
                parseFloat(location.longitude) > longLow) {
                    locationId = parseInt(location.id);
                }
        });

        return locationId;
    }

    private GetSiteListOptions(): http.RequestOptions {
        let options: http.RequestOptions = {
            host: this.baseHost,
            path: this.basePath + "val/wxfcs/all/json/sitelist?res=daily&key=" + this.apiKey,
            protocol: "http:",
            method: "GET",
            port: 80
        };

        return options;
    }

    private GetForecastOptions(locationId: string): http.RequestOptions {
        let options: http.RequestOptions = {
            host: this.baseHost,
            path: this.basePath + "val/wxfcs/all/json/" + locationId + "?res=daily&key=" + this.apiKey,
            protocol: "http:",
            method: "GET",
            port: 80
        };

        return options;
    }
}

export class Forecast {
    public weatherType: string;
    public visibility: string;
    public windSpeed: string;
    public precipitationChance: string
    public windDirection: string;

}

export class WeatherText {
    public static GetVisibilityFromForecase(forecast: Forecast): string {
        let text: string;

        switch (forecast.visibility) {
            case "VP":
                text = "very poor at less than 1km.";
                break;

            case "PO":
                text = "poor at between 1 and 4km.";
                break;
            
            case "MO":
                text = "moderate at between 4 and 10km.";
                break;

            case "GO":
                text = "good at between 10 and 20km.";
                break;

            case "VG":
                text = "very good at between 20 and 40km.";
                break;

            case "EX":
                text = "excellent at more than 40km.";
                break;
        }

        return text;
    }

    public static GetFlyingTextFromForecast(forecast: Forecast): string {
        let yesResponseText: string = "Testing 4! Yes you can fly today.";
        let noResponseText: string = "Testing 4! You should not fly today.";
        let responseText: string;

        switch (forecast.weatherType) {
          case "6":
            responseText = noResponseText + " There is fog and the visibility is " + WeatherText.GetVisibilityFromForecase(forecast);
            break;

          case "1":
            responseText = yesResponseText + " It is a sunny day today and should be perfect for flying.";
            break;

          case "3":
          case "2":
          case "7":
            responseText = yesResponseText + " However it could be cloudy.";
            break;

          case "8":
            responseText = yesResponseText + " However it be overcast.";
            break;

          case "9":
          case "10":
          case "11":
          case "12":
            responseText = noResponseText + " There will be light rain showers today.";
            break;

          case "13":
          case "14":
          case "15":
            responseText = noResponseText + " There will be heavy rain showers today.";
            break;

          case "16":
          case "17":
          case "18":
          case "19":
          case "20":
          case "21":
            responseText = noResponseText + " There will be hail or sleet showers today.";
            break;

          case "22":
          case "23":
          case "24":
          case "25":
          case "26":
          case "27":
            responseText = noResponseText + " There will be snow showers today.";
            break;

          case "28":
          case "29":
          case "30":
            responseText = noResponseText + " There will be thunder today.";
            break;
        }

        return responseText;
    }
}

export enum WeatherCondition {
    Bad,
    Fair,
    Good,
    Excellent
}