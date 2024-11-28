import 'source-map-support/register.js'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getUserId } from '../utils.js'
import { createAttachmentPresignedUrl } from '../../businessLogic/todos.js'

const s3_bucket_name = process.env.ATTACHMENT_S3_BUCKET;
const url_expiration = process.env.SIGNED_URL_EXPIRATION;

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({
    credentials: true
  }))
  .handler(async (event) => {
    try {
      const todoId = event.pathParameters.todoId
      // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
      const userId = getUserId(event);

      const s3Client = new S3Client()
      const command = new PutObjectCommand({
        Bucket:  s3_bucket_name,
        Key: todoId,
      })
      const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: url_expiration
      })

      await createAttachmentPresignedUrl(todoId, userId, uploadUrl)

      return {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        statusCode: 201,
        body: JSON.stringify({
          uploadUrl
        })
      }
    } catch (e) {
      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        statusCode: 500,
        body: JSON.stringify({ Error: e }),
      };
    }
  })