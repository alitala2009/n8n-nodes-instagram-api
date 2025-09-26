import type { IExecuteFunctions } from 'n8n-workflow';
import type { INodeExecutionData, INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';

export class InstagramCommentReply implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Instagram Comment Reply',
		name: 'instagramCommentReply',
		icon: 'file:../icons/instagram.svg',
		group: ['transform'],
		version: 1,
		description: 'Reply to an Instagram comment',
		defaults: {
			name: 'Instagram Comment Reply',
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('instagramApi');

		for (let i = 0; i < items.length; i++) {
			const commentId = this.getNodeParameter('commentId', i) as string;
			const message = this.getNodeParameter('message', i) as string;

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
