import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

export class InstagramSendQuickReplies implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Instagram Send Quick Replies',
		name: 'instagramSendQuickReplies',
		icon: 'file:../icons/instagram.svg',
		group: ['transform'],
		version: 1,
		description: 'Send a text prompt with Quick Replies to an Instagram user',
		defaults: {
			name: 'Instagram Send Quick Replies',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
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
				description: 'The Instagram Business/Professional account ID (ig_user_id)',
			},
			{
				displayName: 'Recipient ID (IGSID)',
				name: 'recipientId',
				type: 'string',
				default: '',
				placeholder: 'e.g. 12345678901234567',
				required: true,
				description: 'Instagram-scoped ID for the person receiving the message',
			},
			{
				displayName: 'Prompt Text',
				name: 'promptText',
				type: 'string',
				default: '',
				placeholder: 'Choose an option:',
				required: true,
				description: 'Text that prompts the user to click a quick reply',
			},
			{
				displayName: 'Quick Replies',
				name: 'quickReplies',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				placeholder: 'Add Quick Reply',
				options: [
					{
						name: 'reply',
						displayName: 'Quick Reply',
						values: [
							{
								displayName: 'Title',
								name: 'title',
								type: 'string',
								default: '',
								placeholder: 'Yes',
								required: true,
							},
							{
								displayName: 'Payload',
								name: 'payload',
								type: 'string',
								default: '',
								placeholder: 'YES_PAYLOAD',
								required: true,
							},
						],
					},
				],
				description:
					'Add one or more quick replies. Each becomes a button with a title and a payload (returned in webhooks).',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const creds = await this.getCredentials('instagramApi');
		let accessToken = String((creds as any).accessToken || '').trim();
		accessToken = accessToken.replace(/^Bearer\s+/i, '').trim();

		if (!accessToken) {
			throw new Error('instagramApi credential is missing accessToken');
		}

		for (let i = 0; i < items.length; i++) {
			try {
				const igId = String(this.getNodeParameter('igId', i)).trim();
				const recipientId = String(this.getNodeParameter('recipientId', i)).trim();
				const promptText = String(this.getNodeParameter('promptText', i)).trim();

				const qrCollection = (this.getNodeParameter('quickReplies', i, {}) || {}) as {
					reply?: Array<{ title?: string; payload?: string }>;
				};

				const quickReplies = (qrCollection.reply || [])
					.map((r) => ({
						content_type: 'text',
						title: String(r.title ?? '').trim(),
						payload: String(r.payload ?? '').trim(),
					}))
					.filter((r) => r.title.length > 0 && r.payload.length > 0);

				if (quickReplies.length === 0) {
					throw new Error('Add at least one Quick Reply with both Title and Payload.');
				}

				const payload = {
					recipient: { id: recipientId },
					messaging_type: 'RESPONSE',
					message: {
						text: promptText,
						quick_replies: quickReplies,
					},
				};

				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: `https://graph.instagram.com/v23.0/${igId}/messages?access_token=${accessToken}`,
					body: payload,
					headers: {
						'Content-Type': 'application/json',
					},
					json: true,
				});

				returnData.push({
					json: {
						success: true,
						request: payload,
						response,
					},
				});
			} catch (error: any) {
				const responseBody = error?.response?.body ?? error?.cause?.response?.body ?? error?.cause;
				const errJson = {
					success: false,
					error: error?.message,
					response: responseBody,
				};

				if (this.continueOnFail()) {
					returnData.push({ json: errJson });
					continue;
				}

				throw new Error(
					`Quick Replies send failed: ${responseBody ? JSON.stringify(responseBody) : error?.message}`,
				);
			}
		}

		return [returnData];
	}
}
