import { InstagramApi } from './credentials/InstagramApi.credentials';
import { InstagramCommentReply } from './nodes/InstagramCommentReply.node';
import { InstagramCreatePublishMedia } from './nodes/InstagramCreatePublishMedia.node';
import { InstagramPublish } from './nodes/InstagramPublish.node';
import { InstagramReels } from './nodes/InstagramReels.node';
import { InstagramSendImage } from './nodes/InstagramSendImage.node';
import { InstagramSendMedia } from './nodes/InstagramSendMedia.node';
import { InstagramSendMessage } from './nodes/InstagramSendMessage.node';
import { InstagramSendQuickReplies } from './nodes/InstagramSendQuickReplies.node';

export const nodes = [
  InstagramCommentReply,
  InstagramCreatePublishMedia,
  InstagramPublish,
  InstagramReels,
  InstagramSendImage,
  InstagramSendMedia,
  InstagramSendMessage,
  InstagramSendQuickReplies,
];

export const credentials = [InstagramApi];

export {
  InstagramApi,
  InstagramCommentReply,
  InstagramCreatePublishMedia,
  InstagramPublish,
  InstagramReels,
  InstagramSendImage,
  InstagramSendMedia,
  InstagramSendMessage,
  InstagramSendQuickReplies,
};
