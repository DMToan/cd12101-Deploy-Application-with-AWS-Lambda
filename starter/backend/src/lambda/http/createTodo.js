import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { getUserId } from '../utils'
import { createTodo } from '../../helpers/todos';

export const handler = middy(
  async (event) => {
    const newTodo = JSON.parse(event.body);
    // TODO: Implement creating a new TODO item
    const userId = getUserId(event);

    const result = await createTodo(newTodo, userId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        item: result
      }),
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
);