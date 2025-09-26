"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramSendImage = void 0;
class InstagramSendImage {
    constructor() {
        this.description = {
            displayName: 'Instagram Send Image/GIF',
            name: 'instagramSendImage',
            icon: 'file:../icons/instagram.svg',
            group: ['transform'],
            version: 1,
            description: 'Send an image or GIF to an Instagram user',
            defaults: {
                name: 'Instagram Send Image/GIF',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'instagramApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Instagram Business Account ID',
                    name: 'igId',
                    type: 'string',
                    default: '',
                    placeholder: '1789xxxxxxxxxxxx',
                    required: true,
                    description: 'The Instagram Business/Professional account ID',
                },
                {
                    displayName: 'Recipient ID',
                    name: 'recipientId',
                    type: 'string',
                    default: '',
                    placeholder: '12345678901234567',
                    required: true,
                    description: 'The IG SID of the recipient',
                },
                {
                    displayName: 'Image/GIF URL',
                    name: 'imageUrl',
                    type: 'string',
                    default: '',
                    placeholder: 'https://example.com/image.gif',
                    required: true,
                    description: 'Publicly accessible URL of the image or GIF to send',
                },
            ],
        };
    }
    async execute() {
        var _a, _b, _c, _d, _e;
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('instagramApi');
        const accessToken = credentials.accessToken;
        for (let i = 0; i < items.length; i++) {
            try {
                const igId = this.getNodeParameter('igId', i);
                const recipientId = this.getNodeParameter('recipientId', i);
                const imageUrl = this.getNodeParameter('imageUrl', i);
                const response = await this.helpers.httpRequest({
                    method: 'POST',
                    url: `https://graph.instagram.com/v23.0/${igId}/messages`,
                    body: {
                        recipient: { id: recipientId },
                        message: {
                            attachment: {
                                type: 'image',
                                payload: { url: imageUrl },
                            },
                        },
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    json: true,
                });
                returnData.push({
                    json: {
                        success: true,
                        data: response,
                    },
                });
            }
            catch (error) {
                returnData.push({
                    json: {
                        success: false,
                        error: error.message,
                        response: (_e = (_b = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.body) !== null && _b !== void 0 ? _b : (_d = (_c = error === null || error === void 0 ? void 0 : error.cause) === null || _c === void 0 ? void 0 : _c.response) === null || _d === void 0 ? void 0 : _d.body) !== null && _e !== void 0 ? _e : error === null || error === void 0 ? void 0 : error.cause,
                    },
                });
            }
        }
        return [returnData];
    }
}
exports.InstagramSendImage = InstagramSendImage;
