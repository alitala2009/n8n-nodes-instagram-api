"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramPublish = void 0;
class InstagramPublish {
    constructor() {
        this.description = {
            displayName: 'Instagram Publish Media',
            name: 'instagramPublish',
            icon: 'file:../icons/instagram.svg',
            group: ['transform'],
            version: 1,
            description: 'Publish Instagram Reel from a container',
            defaults: {
                name: 'Instagram Publish Media',
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
                    displayName: 'Container ID',
                    name: 'containerId',
                    type: 'string',
                    default: '',
                    placeholder: 'Returned container ID from Create Media',
                    required: true,
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('instagramApi');
        for (let i = 0; i < items.length; i++) {
            const containerIdInput = this.getNodeParameter('containerId', i);
            let containerId = String(containerIdInput !== null && containerIdInput !== void 0 ? containerIdInput : '').trim();
            if (typeof containerIdInput === 'number' && items[i].json.containerIdRaw) {
                containerId = String(items[i].json.containerIdRaw).trim();
            }
            const response = (await this.helpers.httpRequest({
                method: 'POST',
                url: 'https://graph.instagram.com/v23.0/me/media_publish',
                body: {
                    creation_id: containerId,
                },
                headers: {
                    Authorization: `Bearer ${credentials.accessToken}`,
                },
                json: true,
            }));
            returnData.push({
                json: {
                    success: true,
                    mediaId: response.id,
                },
            });
        }
        return this.prepareOutputData(returnData);
    }
}
exports.InstagramPublish = InstagramPublish;
