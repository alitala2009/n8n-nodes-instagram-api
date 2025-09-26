import type { IExecuteFunctions } from 'n8n-workflow';
import type {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

export class InstagramSendMedia implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Instagram Send Media',
		name: 'instagramSendMedia',
		icon: 'file:../icons/instagram.svg',
		group: ['transform'],
		version: 1,
		description: 'Send audio or video messages to an Instagram user',
		defaults: {
			name: 'Instagram Send Media',
		},
		inputs: ['main'] as NodeConnectionType[],
		outputs: ['main'] as NodeConnectionType[],
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const recipientId = this.getNodeParameter('recipientId', i) as string;
				const mediaType = this.getNodeParameter('mediaType', i) as string;
				const mediaUrl = this.getNodeParameter('mediaUrl', i) as string;
				const igId = this.getNodeParameter('igId', i) as string;
				const accessToken = this.getNodeParameter('accessToken', i) as string;

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
			} catch (error: any) {
				const body = error?.response?.body ?? error?.cause?.response?.body ?? error?.cause;
				throw new Error(`Request failed: ${body ? JSON.stringify(body) : error.message}`);
			}
		}

		return [returnData];
	}
}
