/**
 * / alexa
 *
 * @class AlexaJson
 */
export class AlexaJson {

    public version: string;
    public response: AlexaResponse;

    constructor() {
        this.version = "1.0";
    }
}

/**
 * / alexa
 *
 * @class AlexaResponse
 */
export class AlexaResponse {

    public outputSpeech: AlexaOutputSpeech;
    public card: AlexaCard;
    public reprompt: AlexaRepromptResponse;
    public shouldEndSession: boolean;
}

export class AlexaRepromptResponse {
    public outputSpeech: AlexaOutputSpeech;
}

/**
 * / alexa
 *
 * @class AlexaCard
 */
export class AlexaCard {

    public type: string;
    public title: string;
    public content: string;
}

/**
 * / alexa
 *
 * @class AlexaOutputSpeech
 */
export class AlexaOutputSpeech {

    public type: string;
    public text: string;
}
