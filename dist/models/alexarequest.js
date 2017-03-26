"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AlexaRequest {
    constructor(request, validAppId, validIntentName) {
        this.validApplicationId = validAppId;
        this.validIntentName = validIntentName;
        this.requestJson = request;
        this.AppId = this.requestJson.session.application.applicationId;
        this.Type = this.requestJson.request.type;
        this.IntentName = this.requestJson.request.intent.name;
        this.IntentDate = new Date(this.requestJson.request.intent.slots.Date.value);
        this.Region = this.requestJson.request.intent.slots.Address.value;
    }
    IsValidRequest() {
        if (this.AppId === this.validApplicationId && this.IntentName === this.validIntentName) {
            return true;
        }
    }
}
exports.AlexaRequest = AlexaRequest;
//# sourceMappingURL=alexarequest.js.map