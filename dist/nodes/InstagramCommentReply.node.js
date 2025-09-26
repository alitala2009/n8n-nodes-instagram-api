"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramCommentReply = void 0;
class InstagramCommentReply {
    constructor() {
        this.description = {
            displayName: 'Instagram Comment Reply',
            name: 'instagramCommentReply',
            icon: 'file:../icons/instagram.svg',
            group: ['transform'],
            version: 1,
            description: 'Reply to an Instagram comment',
            defaults: {
                name: 'Instagram Comment Reply',
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
                    displayName: 'Comment ID',
                    name: 'commentId',
                    type: 'string',
                    default: '',
                    placeholder: 'IG Comment ID',
                    required: true,
                },
                {
                    displayName: 'Message',
                    name: 'message',
                    type: 'string',
                    default: 'Thanks for sharing!',
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
            const commentId = this.getNodeParameter('commentId', i);
            const message = this.getNodeParameter('message', i);
            const response = await this.helpers.httpRequest({
                method: 'POST',
                url: `https://graph.instagram.com/v23.0/${commentId}/replies`,
                body: { message },
                headers: {
                    Authorization: `Bearer ${credentials.accessToken}`,
                },
                json: true,
            });
            returnData.push({ json: response });
        }
        return this.prepareOutputData(returnData);
    }
}
exports.InstagramCommentReply = InstagramCommentReply;
