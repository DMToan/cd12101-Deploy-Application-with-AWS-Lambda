import 'source-map-support/register.js'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { getUserId } from '../utils.js';

const dynamodbClient = DynamoDBDocument.from(new DynamoDB())

const todoTable = process.env.TODOS_TABLE
const todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX;
// TODO: Get all TODO items for a current user
export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({
    credentials: true
  }))
  .handler(async (event) => {
    // Write your code here
    try{
      const userId = getUserId(event);
      const result = await dynamodbClient.query({
        TableName: todoTable,
        IndexName: todosCreatedAtIndex,
        KeyConditionExpression: "#userId = :userId",
        ExpressionAttributeNames: {
            "#userId": "userId"
        },
        ExpressionAttributeValues: {
            ":userId": userId
        }
      })

      const todos = result.Items
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          items: todos
        })
      }
    } catch (e) {
      return {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        statusCode: 500,
        body: JSON.stringify({ error: e }),
      };
    }
  })