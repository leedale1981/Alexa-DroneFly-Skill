"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AlexaRequest {
    constructor(request, validAppId, validIntentNames) {
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
                    this.requestJson.request.intent.slots.Address !== undefined) {
                    this.IntentDate = new Date(this.requestJson.request.intent.slots.Date.value);
                    this.Region = this.requestJson.request.intent.slots.Address.value;
                }
            }
        }
    }
    IsValidRequest() {
        if (this.AppId === this.validApplicationId) {
            if (this.IntentName === "" ||
                this.validIntentNames.indexOf(this.IntentName) !== -1) {
                return true;
            }
        }
        return false;
    }
}
exports.AlexaRequest = AlexaRequest;
//# sourceMappingURL=alexarequest.js.map