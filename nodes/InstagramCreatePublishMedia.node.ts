import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { setTimeout as sleep } from 'node:timers/promises';

type Action = 'create' | 'publish';
type MediaKind = 'REEL' | 'IMAGE';

export class InstagramCreatePublishMedia implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Instagram Create/Publish Media',
		name: 'instagramCreatePublishMedia',
		icon: 'file:../icons/instagram.svg',
		group: ['transform'],
		version: 1,
		description: 'Create a container and/or publish media to Instagram (v23.0)',
		defaults: { name: 'Instagram Create/Publish Media' },
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
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
				description:
					'If enabled and media type is Reel, the node will poll the container status until FINISHED and then auto-publish (if "Auto Publish" is also enabled)',
			},
			{
				displayName: 'Auto Publish After Create',
				name: 'autoPublish',
				type: 'boolean',
				default: false,
				displayOptions: { show: { action: ['create'] } },
				description:
					'If enabled, will immediately publish the created container (Reels wait for processing if Wait is on; Images publish immediately)',
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const out: INodeExecutionData[] = [];
		const creds = await this.getCredentials('instagramApi');
		const accessToken = String((creds as any).accessToken || '').trim();
		if (!accessToken) throw new Error('instagramApi credential is missing accessToken');

		const BASE = 'https://graph.facebook.com/v23.0';
		for (let i = 0; i < items.length; i++) {
			const action = this.getNodeParameter('action', i) as Action;
			const igId = String(this.getNodeParameter('igId', i)).trim();

			try {
				if (action === 'create') {
					const mediaKind = this.getNodeParameter('mediaKind', i) as MediaKind;
					const fileUrl = String(this.getNodeParameter('fileUrl', i)).trim();
					const caption = String(this.getNodeParameter('caption', i) || '').trim();
					const waitReady = this.getNodeParameter('waitReady', i, true) as boolean;
					const autoPublish = this.getNodeParameter('autoPublish', i, false) as boolean;
					const maxWaitSeconds = this.getNodeParameter('maxWaitSeconds', i, 120) as number;

					const body: Record<string, unknown> = {};
					if (mediaKind === 'REEL') {
						body.media_type = 'REELS';
						body.video_url = fileUrl;
					} else {
						body.image_url = fileUrl;
					}
					if (caption) body.caption = caption;

					const createResp = await this.helpers.httpRequest({
						method: 'POST',
						url: `${BASE}/${igId}/media`,
						body,
						headers: { Authorization: `Bearer ${accessToken}` },
						json: true,
					});
					const containerId = String((createResp as any)?.id ?? '');

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
							const bodyStatus = s as Record<string, string>;
							status =
								bodyStatus?.status_code ||
								bodyStatus?.status ||
								bodyStatus?.video_status ||
								'IN_PROGRESS';

							if (String(status).toUpperCase() === 'FINISHED') break;
							if (String(status).toUpperCase() === 'READY') break;
							await sleep(3000);
						}
					}

					let autoPublishResult: Record<string, unknown> | undefined;
					if (autoPublish) {
						const pub = await this.helpers.httpRequest({
							method: 'POST',
							url: `${BASE}/${igId}/media_publish`,
							body: { creation_id: readyContainerId },
							headers: { Authorization: `Bearer ${accessToken}` },
							json: true,
						});
						autoPublishResult = { mediaId: String((pub as any)?.id ?? '') };
					}

					out.push({
						json: {
							success: true,
							action: 'create',
							mediaKind,
							containerId,
							autoPublished: Boolean(autoPublish),
							...(autoPublishResult ?? {}),
							raw: createResp,
						},
					});
				} else {
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
							mediaId: String((pub as any)?.id ?? ''),
							raw: pub,
						},
					});
				}
			} catch (error: any) {
				const responseBody =
					error?.response?.body ?? error?.cause?.response?.body ?? error?.cause ?? undefined;
				const payload = {
					success: false,
					action,
					error: error?.message,
					response: responseBody,
				};
				if (this.continueOnFail()) {
					out.push({ json: payload });
					continue;
				}
				throw new Error(
					`Instagram ${action} failed: ${
						responseBody ? JSON.stringify(responseBody) : error?.message
					}`,
				);
			}
		}

		return [out];
	}
}



