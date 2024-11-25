import 'source-map-support/register.js';
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { getUserId } from '../utils.js'

const dynamodbClient = DynamoDBDocument.from(new DynamoDB())

const todoTable = process.env.TODOS_TABLE

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({
    credentials: true
  }))
  .handler(async (event) => {
    const todoId = event.pathParameters.todoId;
    // TODO: Remove a TODO item by id
    const userId = getUserId(event);
    try {
      await dynamodbClient.delete({
        TableName: todoTable,
        Key: {
            todoId,
            userId
        }
    })
      
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({})
      }
    } catch (e) {
      return {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        statusCode: 500,
        body: JSON.stringify({ Error: e }),
      };
    }
  })
