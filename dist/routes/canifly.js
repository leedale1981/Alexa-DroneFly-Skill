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
        let validIntentNames = ["IsItSafeToFly", "AMAZON.HelpIntent", "AMAZON.StopIntent", "AMAZON.CancelIntent"];
        let alexaRequest = new alexarequest_1.AlexaRequest(req.body, validApplicationId, validIntentNames);
        if (alexaRequest.IsValidRequest()) {
            if (alexaRequest.Type === "LaunchRequest") {
                console.log("Launch request.");
                res.json(self.handleLaunchRequest());
            }
            else {
                let responseText = "";
                if (alexaRequest.Type === "IntentRequest") {
                    console.log("Intent request.");
                    if (alexaRequest.IntentName === "IsItSafeToFly") {
                        let metOffice = new MetOffice.MetOffice(alexaRequest.Region);
                        metOffice.GetMetData(alexaRequest.IntentDate).then(function (forecast) {
                            responseText = MetOffice.WeatherText.GetFlyingTextFromForecast(forecast);
                            console.log("Response text: " + responseText);
                            res.json(self.handleIntentRequest(responseText));
                        }).catch(function (error) {
                            console.log(error);
                            res.json(self.handleErrorResponse(error));
                        });
                    }
                }
                if (alexaRequest.IntentName === "AMAZON.HelpIntent") {
                    res.json(self.handleHelpIntentRequest());
                }
                if (alexaRequest.IntentName === "AMAZON.StopIntent" ||
                    alexaRequest.IntentName === "AMAZON.CancelIntent") {
                    res.json(self.handleIntentRequest("OK."));
                }
            }
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
        alexaOutput.text = this.getPromptReponseText();
        let alexaResponse = new AlexaResponses.AlexaResponse();
        alexaResponse.card = alexaCard;
        alexaResponse.outputSpeech = alexaOutput;
        alexaResponse.shouldEndSession = false;
        let alexaJson = new AlexaResponses.AlexaJson();
        alexaJson.response = alexaResponse;
        return alexaJson;
    }
    handleIntentRequest(responseText) {
        let alexaCard = new AlexaResponses.AlexaCard();
        alexaCard.type = "Simple";
        alexaCard.title = responseText;
        alexaCard.content = responseText;
        let alexaOutput = new AlexaResponses.AlexaOutputSpeech();
        alexaOutput.type = "PlainText";
        alexaOutput.text = responseText;
        let alexaResponse = new AlexaResponses.AlexaResponse();
        alexaResponse.card = alexaCard;
        alexaResponse.outputSpeech = alexaOutput;
        alexaResponse.shouldEndSession = true;
        let alexaJson = new AlexaResponses.AlexaJson();
        alexaJson.response = alexaResponse;
        return alexaJson;
    }
    handleHelpIntentRequest() {
        let responseText = this.getHelpResponseText();
        let alexaCard = new AlexaResponses.AlexaCard();
        alexaCard.type = "Simple";
        alexaCard.title = responseText;
        alexaCard.content = responseText;
        let alexaOutput = new AlexaResponses.AlexaOutputSpeech();
        alexaOutput.type = "PlainText";
        alexaOutput.text = responseText;
        let alexaResponse = new AlexaResponses.AlexaResponse();
        alexaResponse.card = alexaCard;
        alexaResponse.outputSpeech = alexaOutput;
        alexaResponse.shouldEndSession = false;
        let reprompt = new AlexaResponses.AlexaRepromptResponse();
        let alexaRepromptOutput = new AlexaResponses.AlexaOutputSpeech();
        alexaRepromptOutput.type = "PlainText";
        alexaRepromptOutput.text = this.getPromptReponseText();
        reprompt.outputSpeech = alexaRepromptOutput;
        alexaResponse.reprompt = reprompt;
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
        alexaResponse.shouldEndSession = true;
        let alexaJson = new AlexaResponses.AlexaJson();
        alexaJson.response = alexaResponse;
        return alexaJson;
    }
    handleSessionEndRequest() {
    }
    getHelpResponseText() {
        let responseText = "You may ask me if it is safe to fly today or tomorrow at a location in the UK. ";
        return responseText;
    }
    getPromptReponseText() {
        let responseText = "Please tell me when you are flying, today or tomorrow and at what location?";
        return responseText;
    }
}
exports.CanIFlyRoute = CanIFlyRoute;
//# sourceMappingURL=canifly.js.map