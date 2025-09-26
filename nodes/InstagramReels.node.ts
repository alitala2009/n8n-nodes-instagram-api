import type { IExecuteFunctions } from 'n8n-workflow';
import type { INodeExecutionData, INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';

export class InstagramReels implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Instagram Create Media',
		name: 'instagramReels',
		icon: 'file:../icons/instagram.svg',
		group: ['transform'],
		version: 1,
		description: 'Create Instagram Reel container',
		defaults: {
			name: 'Instagram Create Media',
		},
		inputs: ['main'] as NodeConnectionType[],
		outputs: ['main'] as NodeConnectionType[],
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('instagramApi');

		for (let i = 0; i < items.length; i++) {
			const videoUrl = this.getNodeParameter('videoUrl', i) as string;
			const caption = this.getNodeParameter('caption', i) as string;

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
			})) as { id?: string };

			const id = String(response.id ?? '');
			returnData.push({ json: { id } });
		}

		return this.prepareOutputData(returnData);
	}
}
