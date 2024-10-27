import AWS from 'aws-sdk';
import AWSXRay from 'aws-xray-sdk';

const XAWS = AWSXRay.captureAWS(AWS);

export class AttachmentUtils {
    constructor() {
        this.s3 = new XAWS.S3({ signatureVersion: "v4" });
        this.bucketName = process.env.ATTACHMENT_S3_BUCKET;
        this.expires = parseInt(process.env.SIGNED_URL_EXPIRATION, 10);
    }

    async createAttachmentPresignedUrl(attachmentId) {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: attachmentId,
            Expires: this.expires
        });
    }

    async deleteAttachmentPresignedUrl(blogId) {
        await this.s3.deleteObject({
            Bucket: this.bucketName,
            Key: blogId
        }).promise();
    }
}
