"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramCreatePublishMedia = void 0;
const promises_1 = require("node:timers/promises");
class InstagramCreatePublishMedia {
    constructor() {
        this.description = {
            displayName: 'Instagram Create/Publish Media',
            name: 'instagramCreatePublishMedia',
            icon: 'file:../icons/instagram.svg',
            group: ['transform'],
            version: 1,
            description: 'Create a container and/or publish media to Instagram (v23.0)',
            defaults: { name: 'Instagram Create/Publish Media' },
            inputs: ["main" /* NodeConnectionType.Main */],
            outputs: ["main" /* NodeConnectionType.Main */],
            credentials: [{ name: 'instagramApi', required: true }],
            properties: [
                {
                    displayName: 'Action',
                    name: 'action',
                    type: 'options',
                    options: [
                        { name: 'Create Container', value: 'create' },
                        { name: 'Publish Container', value: 'publish' },
                    ],
                    default: 'create',
                    description: 'Choose which Instagram action to perform',
                },
                {
                    displayName: 'Instagram Account ID',
                    name: 'igId',
                    type: 'string',
                    default: '',
                    placeholder: '1784xxxxxxxxxxxxx',
                    required: true,
                    description: 'Instagram Business/Professional Account ID',
                },
                {
                    displayName: 'Media Type',
                    name: 'mediaKind',
                    type: 'options',
                    options: [
                        { name: 'Reel (Video)', value: 'REEL' },
                        { name: 'Image (Photo)', value: 'IMAGE' },
                    ],
                    default: 'REEL',
                    displayOptions: { show: { action: ['create'] } },
                    description: 'Type of media to upload',
                },
                {
                    displayName: 'File URL',
                    name: 'fileUrl',
                    type: 'string',
                    default: '',
                    placeholder: 'https://example.com/file.mp4 (video) or .jpg/.png (image)',
                    required: true,
                    displayOptions: { show: { action: ['create'] } },
                    description: 'Public, direct URL to the media file',
                },
                {
                    displayName: 'Caption',
                    name: 'caption',
                    type: 'string',
                    default: '',
                    placeholder: 'Write your caption.',
                    displayOptions: { show: { action: ['create'] } },
                },
                {
                    displayName: 'Wait Until Ready (Reels Only)',
                    name: 'waitReady',
                    type: 'boolean',
                    default: true,
                    displayOptions: { show: { action: ['create'] } },
                    description: 'If enabled and media type is Reel, the node will poll the container status until FINISHED and then auto-publish (if "Auto Publish" is also enabled)',
                },
                {
                    displayName: 'Auto Publish After Create',
                    name: 'autoPublish',
                    type: 'boolean',
                    default: false,
                    displayOptions: { show: { action: ['create'] } },
                    description: 'If enabled, will immediately publish the created container (Reels wait for processing if Wait is on; Images publish immediately)',
                },
                {
                    displayName: 'Max Wait Seconds',
                    name: 'maxWaitSeconds',
                    type: 'number',
                    default: 120,
                    typeOptions: { minValue: 5, maxValue: 600 },
                    displayOptions: { show: { action: ['create'], waitReady: [true] } },
                    description: 'Maximum time to wait for Reel processing to finish',
                },
                {
                    displayName: 'Container ID',
                    name: 'containerId',
                    type: 'string',
                    default: '',
                    placeholder: 'Returned container ID from Create',
                    required: true,
                    displayOptions: { show: { action: ['publish'] } },
                },
            ],
        };
    }
    async execute() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const items = this.getInputData();
        const out = [];
        const creds = await this.getCredentials('instagramApi');
        const accessToken = String(creds.accessToken || '').trim();
        if (!accessToken)
            throw new Error('instagramApi credential is missing accessToken');
        const BASE = 'https://graph.facebook.com/v23.0';
        for (let i = 0; i < items.length; i++) {
            const action = this.getNodeParameter('action', i);
            const igId = String(this.getNodeParameter('igId', i)).trim();
            try {
                if (action === 'create') {
                    const mediaKind = this.getNodeParameter('mediaKind', i);
                    const fileUrl = String(this.getNodeParameter('fileUrl', i)).trim();
                    const caption = String(this.getNodeParameter('caption', i) || '').trim();
                    const waitReady = this.getNodeParameter('waitReady', i, true);
                    const autoPublish = this.getNodeParameter('autoPublish', i, false);
                    const maxWaitSeconds = this.getNodeParameter('maxWaitSeconds', i, 120);
                    const body = {};
                    if (mediaKind === 'REEL') {
                        body.media_type = 'REELS';
                        body.video_url = fileUrl;
                    }
                    else {
                        body.image_url = fileUrl;
                    }
                    if (caption)
                        body.caption = caption;
                    const createResp = await this.helpers.httpRequest({
                        method: 'POST',
                        url: `${BASE}/${igId}/media`,
                        body,
                        headers: { Authorization: `Bearer ${accessToken}` },
                        json: true,
                    });
                    const containerId = String((_a = createResp === null || createResp === void 0 ? void 0 : createResp.id) !== null && _a !== void 0 ? _a : '');
                    let readyContainerId = containerId;
                    if (mediaKind === 'REEL' && waitReady) {
                        const start = Date.now();
                        const statusUrl = `${BASE}/${containerId}?fields=status_code,status,video_status`;
                        let status = 'IN_PROGRESS';
                        while (Date.now() - start < maxWaitSeconds * 1000) {
                            const s = await this.helpers.httpRequest({
                                method: 'GET',
                                url: statusUrl,
                                headers: { Authorization: `Bearer ${accessToken}` },
                                json: true,
                            });
                            const bodyStatus = s;
                            status =
                                (bodyStatus === null || bodyStatus === void 0 ? void 0 : bodyStatus.status_code) ||
                                    (bodyStatus === null || bodyStatus === void 0 ? void 0 : bodyStatus.status) ||
                                    (bodyStatus === null || bodyStatus === void 0 ? void 0 : bodyStatus.video_status) ||
                                    'IN_PROGRESS';
                            if (String(status).toUpperCase() === 'FINISHED')
                                break;
                            if (String(status).toUpperCase() === 'READY')
                                break;
                            await (0, promises_1.setTimeout)(3000);
                        }
                    }
                    let autoPublishResult;
                    if (autoPublish) {
                        const pub = await this.helpers.httpRequest({
                            method: 'POST',
                            url: `${BASE}/${igId}/media_publish`,
                            body: { creation_id: readyContainerId },
                            headers: { Authorization: `Bearer ${accessToken}` },
                            json: true,
                        });
                        autoPublishResult = { mediaId: String((_b = pub === null || pub === void 0 ? void 0 : pub.id) !== null && _b !== void 0 ? _b : '') };
                    }
                    out.push({
                        json: {
                            success: true,
                            action: 'create',
                            mediaKind,
                            containerId,
                            autoPublished: Boolean(autoPublish),
                            ...(autoPublishResult !== null && autoPublishResult !== void 0 ? autoPublishResult : {}),
                            raw: createResp,
                        },
                    });
                }
                else {
                    const containerId = String(this.getNodeParameter('containerId', i)).trim();
                    const pub = await this.helpers.httpRequest({
                        method: 'POST',
                        url: `${BASE}/${igId}/media_publish`,
                        body: { creation_id: containerId },
                        headers: { Authorization: `Bearer ${accessToken}` },
                        json: true,
                    });
                    out.push({
                        json: {
                            success: true,
                            action: 'publish',
                            mediaId: String((_c = pub === null || pub === void 0 ? void 0 : pub.id) !== null && _c !== void 0 ? _c : ''),
                            raw: pub,
                        },
                    });
                }
            }
            catch (error) {
                const responseBody = (_j = (_h = (_e = (_d = error === null || error === void 0 ? void 0 : error.response) === null || _d === void 0 ? void 0 : _d.body) !== null && _e !== void 0 ? _e : (_g = (_f = error === null || error === void 0 ? void 0 : error.cause) === null || _f === void 0 ? void 0 : _f.response) === null || _g === void 0 ? void 0 : _g.body) !== null && _h !== void 0 ? _h : error === null || error === void 0 ? void 0 : error.cause) !== null && _j !== void 0 ? _j : undefined;
                const payload = {
                    success: false,
                    action,
                    error: error === null || error === void 0 ? void 0 : error.message,
                    response: responseBody,
                };
                if (this.continueOnFail()) {
                    out.push({ json: payload });
                    continue;
                }
                throw new Error(`Instagram ${action} failed: ${responseBody ? JSON.stringify(responseBody) : error === null || error === void 0 ? void 0 : error.message}`);
            }
        }
        return [out];
    }
}
exports.InstagramCreatePublishMedia = InstagramCreatePublishMedia;
