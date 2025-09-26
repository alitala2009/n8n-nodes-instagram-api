"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramApi = void 0;
class InstagramApi {
    constructor() {
        this.name = 'instagramApi';
        this.displayName = 'Instagram API';
        this.icon = 'file:../icons/instagram.svg';
        this.properties = [
            {
                displayName: 'Access Token',
                name: 'accessToken',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                description: 'Your Instagram Graph API access token',
            },
            {
                displayName: 'Instagram Business Account ID',
                name: 'igId',
                type: 'string',
                default: '',
                description: 'The Instagram Business Account ID to publish to',
            },
        ];
    }
}
exports.InstagramApi = InstagramApi;
