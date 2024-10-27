import { TodosAccess } from './todosAcess';
import { createLogger } from '../utils/logger';
import * as uuid from 'uuid';

const logger = createLogger("CRUD todo item");
const todoAccess = new TodosAccess();
// TODO: Implement businessLogic
export const createTodo = async (request, userId) => {
    logger.info("create new todo item");
    if (request) {
      const todoId = uuid.v4()
      return await todoAccess.createTodo({
        userId: userId,
        todoId: todoId,
        createdAt: (new Date()).toISOString(),
        done: false,
        attachmentUrl: null,
        ...request
      });
    } else {
      logger.error("Failed to add new item.");
    }
}

export const updateTodo = async (userId, todoId, request) => {
  await todoAccess.updateTodo(userId, todoId, request);
}

export const getTodosWithUserID = async (userId) => {
  return await todoAccess.getTodos(userId);
}

export const deleteTodo = async (userId, todoId) => {
  await todoAccess.deleteTodo(userId, todoId);
}

export const createAttachmentImageURL = async (userId, todoId) => {
  const attachmentId = uuid.v4();

  return await todoAccess.createAttachmentImageURL(userId, todoId, attachmentId);
}
