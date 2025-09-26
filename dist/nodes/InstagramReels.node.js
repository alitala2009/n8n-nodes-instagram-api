"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramReels = void 0;
class InstagramReels {
    constructor() {
        this.description = {
            displayName: 'Instagram Create Media',
            name: 'instagramReels',
            icon: 'file:../icons/instagram.svg',
            group: ['transform'],
            version: 1,
            description: 'Create Instagram Reel container',
            defaults: {
                name: 'Instagram Create Media',
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
                    displayName: 'Video URL',
                    name: 'videoUrl',
                    type: 'string',
                    default: '',
                    placeholder: 'https://example.com/video.mp4',
                    required: true,
                },
                {
                    displayName: 'Caption',
                    name: 'caption',
                    type: 'string',
                    default: '',
                    placeholder: 'Write your caption...',
                },
            ],
        };
    }
    async execute() {
        var _a;
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('instagramApi');
        for (let i = 0; i < items.length; i++) {
            const videoUrl = this.getNodeParameter('videoUrl', i);
            const caption = this.getNodeParameter('caption', i);
            const response = (await this.helpers.httpRequest({
                method: 'POST',
                url: 'https://graph.instagram.com/v23.0/me/media',
                body: {
                    media_type: 'REELS',
                    video_url: videoUrl,
                    caption,
                },
                headers: {
                    Authorization: `Bearer ${credentials.accessToken}`,
                },
                json: true,
            }));
            const id = String((_a = response.id) !== null && _a !== void 0 ? _a : '');
            returnData.push({ json: { id } });
        }
        return this.prepareOutputData(returnData);
    }
}
exports.InstagramReels = InstagramReels;
