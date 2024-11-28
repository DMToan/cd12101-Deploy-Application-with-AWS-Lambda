import { v4 as uuidv4 } from 'uuid'
import {
    createItem,
    getAllItems,
    updateItem,
    deleteTodoItem,
    getUploadUrl,
} from './todosAcess.js'
import { createLogger } from "../utils/logger.mjs";

const logger = createLogger("TodoAccess");

export async function CreateTodo(userId, parsedBody){
    logger.info("Call function Create todos");
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

    return await createItem(newTodo)
}

export async function getTodosForUser(userId) {
    logger.info("Call function getTodosForUser");
    return await getAllItems(userId)
}

export async function UpdateTodo(todoId, updatedTodo, userId) {
    logger.info("Call function UpdateTodo");
    return await updateItem(todoId, updatedTodo, userId)
}

export async function DeleteTodo(todoId, userId) {
    logger.info("Call function DeleteTodo");
    return await deleteTodoItem(todoId, userId)
}

export async function createAttachmentPresignedUrl(todoId, userId) {
    logger.info("Call function createAttachmentPresignedUrl");
    return await getUploadUrl(todoId, userId)
}
