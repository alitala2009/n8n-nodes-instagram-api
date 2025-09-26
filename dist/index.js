"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramSendQuickReplies = exports.InstagramSendMessage = exports.InstagramSendMedia = exports.InstagramSendImage = exports.InstagramReels = exports.InstagramPublish = exports.InstagramCreatePublishMedia = exports.InstagramCommentReply = exports.InstagramApi = exports.credentials = exports.nodes = void 0;
const InstagramApi_credentials_1 = require("./credentials/InstagramApi.credentials");
Object.defineProperty(exports, "InstagramApi", { enumerable: true, get: function () { return InstagramApi_credentials_1.InstagramApi; } });
const InstagramCommentReply_node_1 = require("./nodes/InstagramCommentReply.node");
Object.defineProperty(exports, "InstagramCommentReply", { enumerable: true, get: function () { return InstagramCommentReply_node_1.InstagramCommentReply; } });
const InstagramCreatePublishMedia_node_1 = require("./nodes/InstagramCreatePublishMedia.node");
Object.defineProperty(exports, "InstagramCreatePublishMedia", { enumerable: true, get: function () { return InstagramCreatePublishMedia_node_1.InstagramCreatePublishMedia; } });
const InstagramPublish_node_1 = require("./nodes/InstagramPublish.node");
Object.defineProperty(exports, "InstagramPublish", { enumerable: true, get: function () { return InstagramPublish_node_1.InstagramPublish; } });
const InstagramReels_node_1 = require("./nodes/InstagramReels.node");
Object.defineProperty(exports, "InstagramReels", { enumerable: true, get: function () { return InstagramReels_node_1.InstagramReels; } });
const InstagramSendImage_node_1 = require("./nodes/InstagramSendImage.node");
Object.defineProperty(exports, "InstagramSendImage", { enumerable: true, get: function () { return InstagramSendImage_node_1.InstagramSendImage; } });
const InstagramSendMedia_node_1 = require("./nodes/InstagramSendMedia.node");
Object.defineProperty(exports, "InstagramSendMedia", { enumerable: true, get: function () { return InstagramSendMedia_node_1.InstagramSendMedia; } });
const InstagramSendMessage_node_1 = require("./nodes/InstagramSendMessage.node");
Object.defineProperty(exports, "InstagramSendMessage", { enumerable: true, get: function () { return InstagramSendMessage_node_1.InstagramSendMessage; } });
const InstagramSendQuickReplies_node_1 = require("./nodes/InstagramSendQuickReplies.node");
Object.defineProperty(exports, "InstagramSendQuickReplies", { enumerable: true, get: function () { return InstagramSendQuickReplies_node_1.InstagramSendQuickReplies; } });
exports.nodes = [
    InstagramCommentReply_node_1.InstagramCommentReply,
    InstagramCreatePublishMedia_node_1.InstagramCreatePublishMedia,
    InstagramPublish_node_1.InstagramPublish,
    InstagramReels_node_1.InstagramReels,
    InstagramSendImage_node_1.InstagramSendImage,
    InstagramSendMedia_node_1.InstagramSendMedia,
    InstagramSendMessage_node_1.InstagramSendMessage,
    InstagramSendQuickReplies_node_1.InstagramSendQuickReplies,
];
exports.credentials = [InstagramApi_credentials_1.InstagramApi];
