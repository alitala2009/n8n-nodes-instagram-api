import type {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class InstagramApi implements ICredentialType {
	name = 'instagramApi';
	displayName = 'Instagram API';
	icon = 'file:../icons/instagram.svg' as const;
	properties: INodeProperties[] = [
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






