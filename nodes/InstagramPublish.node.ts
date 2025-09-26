import type { IExecuteFunctions } from 'n8n-workflow';
import type { INodeExecutionData, INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';

export class InstagramPublish implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Instagram Publish Media',
		name: 'instagramPublish',
		icon: 'file:../icons/instagram.svg',
		group: ['transform'],
		version: 1,
		description: 'Publish Instagram Reel from a container',
		defaults: {
			name: 'Instagram Publish Media',
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
				displayName: 'Container ID',
				name: 'containerId',
				type: 'string',
				default: '',
				placeholder: 'Returned container ID from Create Media',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('instagramApi');

		for (let i = 0; i < items.length; i++) {
			const containerIdInput = this.getNodeParameter('containerId', i) as unknown;
			let containerId = String(containerIdInput ?? '').trim();
			if (typeof containerIdInput === 'number' && (items[i].json as any).containerIdRaw) {
				containerId = String((items[i].json as any).containerIdRaw).trim();
			}

			const response = (await this.helpers.httpRequest({
				method: 'POST',
				url: 'https://graph.instagram.com/v23.0/me/media_publish',
				body: {
					creation_id: containerId,
				},
				headers: {
					Authorization: `Bearer ${credentials.accessToken}`,
				},
				json: true,
			})) as { id?: string };

			returnData.push({
				json: {
					success: true,
					mediaId: response.id,
				},
			});
		}

		return this.prepareOutputData(returnData);
	}
}
