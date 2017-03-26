/**
 * / alexa
 *
 * @class AlexaRequest
 */
export class AlexaRequest {

    public Type: string;
    public IntentName: string;
    public IntentDate: Date;
    public AppId: string;
    public Region: string;

    private requestJson: any;
    private validApplicationId: string;
    private validIntentName: string;

    constructor(request, validAppId: string, validIntentName: string) {
        this.validApplicationId = validAppId;
        this.validIntentName = validIntentName;

        this.requestJson = request;
        this.AppId = this.requestJson.session.application.applicationId;
        this.Type = this.requestJson.request.type;
        this.IntentName = this.requestJson.request.intent.name;
        this.IntentDate = new Date(this.requestJson.request.intent.slots.Date.value);
        this.Region = this.requestJson.request.intent.slots.Address.value;
    }

    public IsValidRequest(): Boolean {
        if (this.AppId === this.validApplicationId && this.IntentName === this.validIntentName) {
            return true;
        }
    }


}