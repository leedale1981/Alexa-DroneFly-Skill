"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mapping = require("./map");
const http = require("http");
const es6_promise_1 = require("es6-promise");
class MetOffice {
    constructor(address) {
        this.apiKey = "30d2c41c-20e6-4aec-9385-6d359d413bb3";
        this.baseHost = "datapoint.metoffice.gov.uk";
        this.basePath = "/public/data/";
        this.retryCount = 3;
        this.address = address;
    }
    GetMetData() {
        let self = this;
        let promise = new es6_promise_1.Promise((resolve, reject) => {
            let map = new Mapping.Map(this.address);
            map.GetCoordinates().then(function (coordinates) {
                return self.GetLocationIdFromCoords(coordinates);
            }).then(function (locationId) {
                return self.GetForcastFromLocation(locationId);
            }).then(function (forecast) {
                resolve(forecast);
            }).catch(function (error) {
                reject(error);
            });
        });
        return promise;
    }
    MapJsonToForecast(json) {
        let forecast = new Forecast();
        forecast.windSpeed = json.S;
        forecast.windDirection = json.D;
        forecast.weatherType = json.W;
        forecast.visibility = json.V;
        forecast.precipitationChance = json.PPn;
        return forecast;
    }
    GetForcastFromLocation(locationId) {
        let self = this;
        let promise = new es6_promise_1.Promise((resolve, reject) => {
            http.get(this.GetForecastOptions(locationId.toString()), function (res) {
                let data = "";
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    data += chunk;
                });
                res.on("end", function () {
                    let json = JSON.parse(data);
                    let forecastValue = json.SiteRep.DV.Location.Period[0].Rep[0];
                    let forecast = self.MapJsonToForecast(forecastValue);
                    resolve(forecast);
                });
            }).on("error", function (error) {
                reject(error);
            });
        });
        return promise;
    }
    GetLocationIdFromCoords(coordinates) {
        let self = this;
        let retryIndex = 1;
        let promise = new es6_promise_1.Promise((resolve, reject) => {
            http.get(this.GetSiteListOptions(), function (res) {
                let data = "";
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    data += chunk;
                });
                res.on("end", function () {
                    if (data !== "") {
                        resolve(self.GetLocationIdFromData(data, coordinates));
                    }
                    else {
                        if (retryIndex <= self.retryCount) {
                            retryIndex++;
                            self.GetLocationIdFromCoords(coordinates).then(function (locationId) {
                                resolve(locationId);
                            });
                        }
                    }
                });
            }).on("error", function (error) {
                reject(error);
            });
        });
        return promise;
    }
    GetLocationIdFromData(data, coordinates) {
        let json = JSON.parse(data);
        let locations = json.Locations.Location;
        let locationId;
        let resolution = 0.04;
        let latHigh = parseFloat(coordinates.latitude) + resolution;
        let latLow = parseFloat(coordinates.latitude) - resolution;
        let longHigh = parseFloat(coordinates.longitude) + resolution;
        let longLow = parseFloat(coordinates.longitude) - resolution;
        locations.forEach(function (location, index) {
            if (parseFloat(location.latitude) < latHigh &&
                parseFloat(location.latitude) > latLow &&
                parseFloat(location.longitude) < longHigh &&
                parseFloat(location.longitude) > longLow) {
                locationId = parseInt(location.id);
            }
        });
        return locationId;
    }
    GetSiteListOptions() {
        let options = {
            host: this.baseHost,
            path: this.basePath + "val/wxfcs/all/json/sitelist?res=daily&key=" + this.apiKey,
            protocol: "http:",
            method: "GET",
            port: 80
        };
        return options;
    }
    GetForecastOptions(locationId) {
        let options = {
            host: this.baseHost,
            path: this.basePath + "val/wxfcs/all/json/" + locationId + "?res=daily&key=" + this.apiKey,
            protocol: "http:",
            method: "GET",
            port: 80
        };
        return options;
    }
}
exports.MetOffice = MetOffice;
class Forecast {
}
exports.Forecast = Forecast;
class WeatherText {
    static GetVisibilityFromForecase(forecast) {
        let text;
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
    static GetFlyingTextFromForecast(forecast) {
        let yesResponseText = "Yes you can fly today.";
        let noResponseText = "You should not fly today.";
        let responseText;
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
exports.WeatherText = WeatherText;
var WeatherCondition;
(function (WeatherCondition) {
    WeatherCondition[WeatherCondition["Bad"] = 0] = "Bad";
    WeatherCondition[WeatherCondition["Fair"] = 1] = "Fair";
    WeatherCondition[WeatherCondition["Good"] = 2] = "Good";
    WeatherCondition[WeatherCondition["Excellent"] = 3] = "Excellent";
})(WeatherCondition = exports.WeatherCondition || (exports.WeatherCondition = {}));
//# sourceMappingURL=metoffice.js.map