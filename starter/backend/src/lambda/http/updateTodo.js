import 'source-map-support/register.js'
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
    try {
      const todoId = event.pathParameters.todoId
      const updatedTodo = JSON.parse(event.body)
      // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
      const userId = getUserId(event);
      await dynamodbClient.update({
        TableName: todoTable,
        Key: {
            todoId,
            userId
        },
        UpdateExpression: "set #name = :name, #dueDate = :dueDate, #done = :done",
        ExpressionAttributeNames: {
            "#name": "name",
            "#dueDate": "dueDate",
            "#done": "done"
        },
        ExpressionAttributeValues: {
            ":name": updatedTodo.name,
            ":dueDate": updatedTodo.dueDate,
            ":done": updatedTodo.done
        }
    })
      return {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        statusCode: 204,
        body: JSON.stringify({ item: updatedTodo })
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