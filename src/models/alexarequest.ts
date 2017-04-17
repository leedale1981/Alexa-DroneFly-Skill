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
    private validIntentNames: Array<string>;

    constructor(request, validAppId: string, validIntentNames: Array<string>) {
        this.validApplicationId = validAppId;
        this.validIntentNames = validIntentNames;

        this.requestJson = request;
        this.AppId = this.requestJson.session.application.applicationId;
        this.Type = this.requestJson.request.type;
        this.IntentName = "";

        if (this.requestJson.request.intent !== undefined) {
            this.IntentName = this.requestJson.request.intent.name;

            if (this.requestJson.request.intent.slots !== undefined) {
                if (this.requestJson.request.intent.slots.Date !== undefined &&
                    this.requestJson.request.intent.slots.Address !== undefined){

                    this.IntentDate = new Date(this.requestJson.request.intent.slots.Date.value);
                    this.Region = this.requestJson.request.intent.slots.Address.value;
                }
            }
        }
    }

    public IsValidRequest(): Boolean {
        if (this.AppId === this.validApplicationId) {
            if (this.IntentName === "" || 
                this.validIntentNames.indexOf(this.IntentName) !== -1) {
                return true;
            }
        }

        return false;
    }
}