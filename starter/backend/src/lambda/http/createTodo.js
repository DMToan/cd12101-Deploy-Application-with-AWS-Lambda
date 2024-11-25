import 'source-map-support/register.js';
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { getUserId } from '../utils.js'

const dynamodbClient = DynamoDBDocument.from(new DynamoDB())

const todoTable = process.env.TODOS_TABLE

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({
    credentials: true
  }))
  .handler(async (event) => {
    try {
      const parsedBody = JSON.parse(event.body);
      const userId = getUserId(event);
      const todoId = uuidv4()
      const newTodo = {
        userId: userId,
        todoId: todoId,
        createdAt: (new Date()).toISOString(),
        done: false,
        attachmentUrl: null,
        name: parsedBody.name,
        dueDate: parsedBody.dueDate
      }
      await dynamodbClient.put({
        TableName: todoTable,
        Item: newTodo
      })

      return {
        statusCode: 201,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          item: newTodo
        }),
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