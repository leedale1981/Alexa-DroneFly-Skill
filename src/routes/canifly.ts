import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";
import { AlexaRequest } from "../models/alexarequest";
import * as AlexaResponses from "../models/alexaresponses";
import * as MetOffice from "../models/metoffice";

/**
 * / route
 *
 * @class CanIFlyRoute
 */
export class CanIFlyRoute extends BaseRoute {

  /**
   * Create the routes.
   *
   * @class IndexRoute
   * @method create
   * @static
   */
  public static create(router: Router) {
    //log
    console.log("[CanIFlyRoute::create] Creating canifly route.");

    //add home page route
    router.post("/api/canifly", (req: Request, res: Response, next: NextFunction) => {
      new CanIFlyRoute().canifly(req, res, next);
    });
  }

  /**
   * Constructor
   *
   * @class IndexRoute
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * The home page route.
   *
   * @class CanIFlyRoute
   * @method canifly
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @next {NextFunction} Execute the next method.
   */
  public canifly(req: Request, res: Response, next: NextFunction) {
    let self = this;
    console.log("Calling canifly endpoint.");

    let validApplicationId: string = "amzn1.ask.skill.e8a3643d-86de-4f40-a180-84a1120a1533";
    let validIntentNames: Array<string> = ["IsItSafeToFly", "AMAZON.HelpIntent", "AMAZON.StopIntent", "AMAZON.CancelIntent"];
    let alexaRequest = new AlexaRequest(req.body, validApplicationId, validIntentNames);

    if (alexaRequest.IsValidRequest()) {
      
      if (alexaRequest.Type === "LaunchRequest") {
        console.log("Launch request.");
        res.json(self.handleLaunchRequest());
      }
      else {
        let responseText: string = "";

        if (alexaRequest.Type === "IntentRequest") {
          console.log("Intent request.");
          
          if (alexaRequest.IntentName === "IsItSafeToFly") {
            let metOffice: MetOffice.MetOffice = new MetOffice.MetOffice(alexaRequest.Region);

            metOffice.GetMetData(alexaRequest.IntentDate).then(function(forecast: MetOffice.Forecast): void {
              responseText = MetOffice.WeatherText.GetFlyingTextFromForecast(forecast);                
              console.log("Response text: " + responseText);
              res.json(self.handleIntentRequest(responseText));
            }).catch(function(error: string): void {
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

  private handleLaunchRequest(): AlexaResponses.AlexaJson {
    
    let alexaCard: AlexaResponses.AlexaCard = new AlexaResponses.AlexaCard();
    alexaCard.type = "Simple";
    alexaCard.title = "Can I fly my drone?";
    alexaCard.content = "";

    let alexaOutput: AlexaResponses.AlexaOutputSpeech = new AlexaResponses.AlexaOutputSpeech();
    alexaOutput.type = "PlainText";
    alexaOutput.text = this.getPromptReponseText();

    let alexaResponse: AlexaResponses.AlexaResponse = new AlexaResponses.AlexaResponse();
    alexaResponse.card = alexaCard;
    alexaResponse.outputSpeech = alexaOutput;
    alexaResponse.shouldEndSession = false;

    let alexaJson: AlexaResponses.AlexaJson = new AlexaResponses.AlexaJson();
    alexaJson.response = alexaResponse;

    return alexaJson;
  }

  private handleIntentRequest(responseText: string): AlexaResponses.AlexaJson {
    let alexaCard: AlexaResponses.AlexaCard = new AlexaResponses.AlexaCard();
    alexaCard.type = "Simple";
    alexaCard.title = responseText;
    alexaCard.content = responseText;

    let alexaOutput: AlexaResponses.AlexaOutputSpeech = new AlexaResponses.AlexaOutputSpeech();
    alexaOutput.type = "PlainText";
    alexaOutput.text = responseText;

    let alexaResponse: AlexaResponses.AlexaResponse = new AlexaResponses.AlexaResponse();
    alexaResponse.card = alexaCard;
    alexaResponse.outputSpeech = alexaOutput;
    alexaResponse.shouldEndSession = true;

    let alexaJson: AlexaResponses.AlexaJson = new AlexaResponses.AlexaJson();
    alexaJson.response = alexaResponse;

    return alexaJson;
  }

  private handleHelpIntentRequest(): AlexaResponses.AlexaJson {
    let responseText: string = this.getHelpResponseText();
    let alexaCard: AlexaResponses.AlexaCard = new AlexaResponses.AlexaCard();
    alexaCard.type = "Simple";
    alexaCard.title = responseText;
    alexaCard.content = responseText;

    let alexaOutput: AlexaResponses.AlexaOutputSpeech = new AlexaResponses.AlexaOutputSpeech();
    alexaOutput.type = "PlainText";
    alexaOutput.text = responseText;

    let alexaResponse: AlexaResponses.AlexaResponse = new AlexaResponses.AlexaResponse();
    alexaResponse.card = alexaCard;
    alexaResponse.outputSpeech = alexaOutput;
    alexaResponse.shouldEndSession = false;
    let reprompt: AlexaResponses.AlexaRepromptResponse = new AlexaResponses.AlexaRepromptResponse();
    let alexaRepromptOutput: AlexaResponses.AlexaOutputSpeech = new AlexaResponses.AlexaOutputSpeech();
    alexaRepromptOutput.type = "PlainText";
    alexaRepromptOutput.text = this.getPromptReponseText();
    reprompt.outputSpeech = alexaRepromptOutput;
    alexaResponse.reprompt = reprompt;

    let alexaJson: AlexaResponses.AlexaJson = new AlexaResponses.AlexaJson();
    alexaJson.response = alexaResponse;

    return alexaJson;
  }

  private handleErrorResponse(error: string): AlexaResponses.AlexaJson {
    
    let alexaCard: AlexaResponses.AlexaCard = new AlexaResponses.AlexaCard();
    alexaCard.type = "Simple";
    alexaCard.title = "Can I fly my drone?";
    alexaCard.content = "";

    let alexaOutput: AlexaResponses.AlexaOutputSpeech = new AlexaResponses.AlexaOutputSpeech();
    alexaOutput.type = "PlainText";
    alexaOutput.text = error;

    let alexaResponse: AlexaResponses.AlexaResponse = new AlexaResponses.AlexaResponse();
    alexaResponse.card = alexaCard;
    alexaResponse.outputSpeech = alexaOutput;
    alexaResponse.shouldEndSession = true;

    let alexaJson: AlexaResponses.AlexaJson = new AlexaResponses.AlexaJson();
    alexaJson.response = alexaResponse;

    return alexaJson;
  }

  private handleSessionEndRequest(): any {

  }

  private getHelpResponseText(): string {
    let responseText: string = "You may ask me if it is safe to fly today or tomorrow at a location in the UK. ";
    //responseText += "For example. You can ask drone safe is it safe to fly today in Essex. ";

    return responseText;
  }

  private getPromptReponseText(): string {
      let responseText: string = "Please tell me when you are flying, today or tomorrow and at what location?";

      return responseText;
  }
}