import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosWithUserID as getTodosWithUserID } from '../../helpers/todos'
import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event) => {
    // Write your code here
    const userId = getUserId(event);
    const todos = await getTodosWithUserID(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)