import 'source-map-support/register.js';
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.js'
import { CreateTodo } from '../../businessLogic/todos.js';

export const handler = middy()
  .use(httpErrorHandler())
  .use(cors({
    credentials: true
  }))
  .handler(async (event) => {
    try {
      const parsedBody = JSON.parse(event.body);
      const userId = getUserId(event);
      const newTodo = await CreateTodo(userId, parsedBody);

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