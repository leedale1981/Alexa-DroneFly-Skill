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
    let validIntentName: string = "IsItSafeToFly";
    let alexaRequest = new AlexaRequest(req.body, validApplicationId, validIntentName);

    if (alexaRequest.IsValidRequest()) {
      let metOffice: MetOffice.MetOffice = new MetOffice.MetOffice(alexaRequest.Region);
      metOffice.GetMetData().then(function(forecast: MetOffice.Forecast): void {
        
        let responseText: string = MetOffice.WeatherText.GetFlyingTextFromForecast(forecast);
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

        res.statusCode = 500;
        res.json({ message: "Problem with Alexa Request." });

      }).catch(function(error: string): void {
        res.statusCode = 500;
        res.json({ message: error });
      });
    }
    else {
      res.json({ message: "Invalid application id."});
    }
  }

  private handleLaunchRequest(): AlexaResponses.AlexaJson {
    
    let alexaCard: AlexaResponses.AlexaCard = new AlexaResponses.AlexaCard();
    alexaCard.type = "Simple";
    alexaCard.title = "Can I fly my drone?";
    alexaCard.content = "";

    let alexaOutput: AlexaResponses.AlexaOutputSpeech = new AlexaResponses.AlexaOutputSpeech();
    alexaOutput.type = "PlainText";
    alexaOutput.text = "Where are you flying and at what location?";

    let alexaResponse: AlexaResponses.AlexaResponse = new AlexaResponses.AlexaResponse();
    alexaResponse.card = alexaCard;
    alexaResponse.outputSpeech = alexaOutput;

    let alexaJson: AlexaResponses.AlexaJson = new AlexaResponses.AlexaJson();
    alexaJson.response = alexaResponse;

    return alexaJson;
  }

  private handleIntentRequest(responseText: string): AlexaResponses.AlexaJson {
    let alexaCard: AlexaResponses.AlexaCard = new AlexaResponses.AlexaCard();
    alexaCard.type = "Simple";
    alexaCard.title = responseText;
    alexaCard.content = "";

    let alexaOutput: AlexaResponses.AlexaOutputSpeech = new AlexaResponses.AlexaOutputSpeech();
    alexaOutput.type = "PlainText";
    alexaOutput.text = responseText;

    let alexaResponse: AlexaResponses.AlexaResponse = new AlexaResponses.AlexaResponse();
    alexaResponse.card = alexaCard;
    alexaResponse.outputSpeech = alexaOutput;

    let alexaJson: AlexaResponses.AlexaJson = new AlexaResponses.AlexaJson();
    alexaJson.response = alexaResponse;

    return alexaJson;
  }

  private handleSessionEndRequest(): any {

  }
}