import type { IExecuteFunctions } from 'n8n-workflow';
import type {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

export class InstagramSendMessage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Instagram Send Message',
		name: 'instagramSendMessage',
		icon: 'file:../icons/instagram.svg',
		group: ['transform'],
		version: 1,
		description: 'Send a text message to an Instagram user',
		defaults: {
			name: 'Instagram Send Message',
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
				displayName: 'Message Text',
				name: 'messageText',
				type: 'string',
				default: '',
				placeholder: 'Hello from n8n ??',
				required: true,
				description: 'The message text or link to send',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('instagramApi');
		const accessToken = credentials.accessToken as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const igId = this.getNodeParameter('igId', i) as string;
				const recipientId = this.getNodeParameter('recipientId', i) as string;
				const messageText = this.getNodeParameter('messageText', i) as string;

				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: `https://graph.instagram.com/v23.0/${igId}/messages`,
					body: {
						recipient: { id: recipientId },
						message: { text: messageText },
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
			} catch (error: any) {
				returnData.push({
					json: {
						success: false,
						error: error.message,
						response: error?.response?.body ?? error?.cause?.response?.body ?? error?.cause,
					},
				});
			}
		}

		return [returnData];
	}
}
