"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramSendMedia = void 0;
class InstagramSendMedia {
    constructor() {
        this.description = {
            displayName: 'Instagram Send Media',
            name: 'instagramSendMedia',
            icon: 'file:../icons/instagram.svg',
            group: ['transform'],
            version: 1,
            description: 'Send audio or video messages to an Instagram user',
            defaults: {
                name: 'Instagram Send Media',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'IG User ID (recipient)',
                    name: 'recipientId',
                    type: 'string',
                    default: '',
                    placeholder: 'e.g. 123456789',
                    required: true,
                    description: 'The Instagram user ID of the recipient',
                },
                {
                    displayName: 'Media Type',
                    name: 'mediaType',
                    type: 'options',
                    options: [
                        { name: 'Audio', value: 'audio' },
                        { name: 'Video', value: 'video' },
                    ],
                    default: 'audio',
                    description: 'Choose whether to send audio or video',
                },
                {
                    displayName: 'Media URL',
                    name: 'mediaUrl',
                    type: 'string',
                    default: '',
                    placeholder: 'https://example.com/file.mp3',
                    required: true,
                    description: 'Publicly accessible URL of the audio or video file',
                },
                {
                    displayName: 'Instagram Account ID',
                    name: 'igId',
                    type: 'string',
                    default: '',
                    required: true,
                    description: 'The Instagram account ID sending the message',
                },
                {
                    displayName: 'Access Token',
                    name: 'accessToken',
                    type: 'string',
                    typeOptions: { password: true },
                    default: '',
                    required: true,
                    description: 'Your Instagram user access token',
                },
            ],
        };
    }
    async execute() {
        var _a, _b, _c, _d, _e;
        const items = this.getInputData();
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            try {
                const recipientId = this.getNodeParameter('recipientId', i);
                const mediaType = this.getNodeParameter('mediaType', i);
                const mediaUrl = this.getNodeParameter('mediaUrl', i);
                const igId = this.getNodeParameter('igId', i);
                const accessToken = this.getNodeParameter('accessToken', i);
                const response = await this.helpers.httpRequest({
                    method: 'POST',
                    url: `https://graph.instagram.com/v23.0/${igId}/messages`,
                    body: {
                        recipient: { id: recipientId },
                        message: {
                            attachment: {
                                type: mediaType,
                                payload: { url: mediaUrl },
                            },
                        },
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    json: true,
                });
                returnData.push({ json: response });
            }
            catch (error) {
                const body = (_e = (_b = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.body) !== null && _b !== void 0 ? _b : (_d = (_c = error === null || error === void 0 ? void 0 : error.cause) === null || _c === void 0 ? void 0 : _c.response) === null || _d === void 0 ? void 0 : _d.body) !== null && _e !== void 0 ? _e : error === null || error === void 0 ? void 0 : error.cause;
                throw new Error(`Request failed: ${body ? JSON.stringify(body) : error.message}`);
            }
        }
        return [returnData];
    }
}
exports.InstagramSendMedia = InstagramSendMedia;
