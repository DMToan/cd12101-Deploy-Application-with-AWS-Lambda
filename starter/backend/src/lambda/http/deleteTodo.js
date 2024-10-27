import 'source-map-support/register';
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../helpers/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event) => {
    const todoId = event.pathParameters.todoId;
    // TODO: Remove a TODO item by id
    const userId = getUserId(event);

    await deleteTodo(userId, todoId)
    
    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )