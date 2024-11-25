import 'source-map-support/register.js'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { v4 as uuidv4 } from 'uuid'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getUserId } from '../utils.js'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'


const dynamodbClient = DynamoDBDocument.from(new DynamoDB())

const todoTable = process.env.TODOS_TABLE
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

      await dynamodbClient.update({
        TableName: todoTable,
        Key: {
          userId,
          todoId,
        },
        UpdateExpression: "set attachmentUrl = :URL",
        ExpressionAttributeValues: {
          ":URL": uploadUrl.split("?")[0],
        },
        ReturnValues: "UPDATED_NEW",
      })
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