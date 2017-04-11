"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_1 = require("./route");
const alexarequest_1 = require("../models/alexarequest");
const AlexaResponses = require("../models/alexaresponses");
const MetOffice = require("../models/metoffice");
class CanIFlyRoute extends route_1.BaseRoute {
    static create(router) {
        console.log("[CanIFlyRoute::create] Creating canifly route.");
        router.post("/api/canifly", (req, res, next) => {
            new CanIFlyRoute().canifly(req, res, next);
        });
    }
    constructor() {
        super();
    }
    canifly(req, res, next) {
        let self = this;
        console.log("Calling canifly endpoint.");
        let validApplicationId = "amzn1.ask.skill.e8a3643d-86de-4f40-a180-84a1120a1533";
        let validIntentName = "IsItSafeToFly";
        let alexaRequest = new alexarequest_1.AlexaRequest(req.body, validApplicationId, validIntentName);
        if (alexaRequest.IsValidRequest()) {
            let metOffice = new MetOffice.MetOffice(alexaRequest.Region);
            metOffice.GetMetData(alexaRequest.IntentDate).then(function (forecast) {
                let responseText = MetOffice.WeatherText.GetFlyingTextFromForecast(forecast);
                console.log("Response text: " + responseText);
                if (alexaRequest.Type === "IntentRequest") {
                    console.log("Intent request.");
                    res.json(self.handleIntentRequest(responseText));
                }
                if (alexaRequest.Type === "LaunchRequest") {
                    console.log("Launch request.");
                    res.json(self.handleLaunchRequest());
                }
                console.log("Problem with Alexa Request.");
                res.json(self.handleErrorResponse("Problem with Alexa Request."));
            }).catch(function (error) {
                res.json(self.handleErrorResponse(error));
            });
        }
        else {
            res.json(self.handleErrorResponse("Invalid application id."));
        }
    }
    handleLaunchRequest() {
        let alexaCard = new AlexaResponses.AlexaCard();
        alexaCard.type = "Simple";
        alexaCard.title = "Can I fly my drone?";
        alexaCard.content = "";
        let alexaOutput = new AlexaResponses.AlexaOutputSpeech();
        alexaOutput.type = "PlainText";
        alexaOutput.text = "Where are you flying and at what location?";
        let alexaResponse = new AlexaResponses.AlexaResponse();
        alexaResponse.card = alexaCard;
        alexaResponse.outputSpeech = alexaOutput;
        let alexaJson = new AlexaResponses.AlexaJson();
        alexaJson.response = alexaResponse;
        return alexaJson;
    }
    handleIntentRequest(responseText) {
        let alexaCard = new AlexaResponses.AlexaCard();
        alexaCard.type = "Simple";
        alexaCard.title = responseText;
        alexaCard.content = "";
        let alexaOutput = new AlexaResponses.AlexaOutputSpeech();
        alexaOutput.type = "PlainText";
        alexaOutput.text = responseText;
        let alexaResponse = new AlexaResponses.AlexaResponse();
        alexaResponse.card = alexaCard;
        alexaResponse.outputSpeech = alexaOutput;
        let alexaJson = new AlexaResponses.AlexaJson();
        alexaJson.response = alexaResponse;
        return alexaJson;
    }
    handleErrorResponse(error) {
        let alexaCard = new AlexaResponses.AlexaCard();
        alexaCard.type = "Simple";
        alexaCard.title = "Can I fly my drone?";
        alexaCard.content = "";
        let alexaOutput = new AlexaResponses.AlexaOutputSpeech();
        alexaOutput.type = "PlainText";
        alexaOutput.text = error;
        let alexaResponse = new AlexaResponses.AlexaResponse();
        alexaResponse.card = alexaCard;
        alexaResponse.outputSpeech = alexaOutput;
        let alexaJson = new AlexaResponses.AlexaJson();
        alexaJson.response = alexaResponse;
        return alexaJson;
    }
    handleSessionEndRequest() {
    }
}
exports.CanIFlyRoute = CanIFlyRoute;
//# sourceMappingURL=canifly.js.map