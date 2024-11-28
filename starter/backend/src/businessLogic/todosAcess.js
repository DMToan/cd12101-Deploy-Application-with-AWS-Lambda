
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

import { createLogger } from "../utils/logger.mjs";

const logger = createLogger("TodoAccess");

const dynamodbClient = DynamoDBDocument.from(new DynamoDB())

const todoTable = process.env.TODOS_TABLE
const todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX;

export async function createItem(newTodo) {
    logger.info("Call function createItem");
    try {
        await dynamodbClient.put({
            TableName: todoTable,
            Item: newTodo
        })
        return newTodo
    } catch (error) {
        logger.info("Error ==>>", error);
        throw Error(error);
    }
}

export async function getAllItems(userId) {
    logger.info("Call function getAllItems");
    try {
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
        return result
    } catch (error) {
        logger.info("Error ==>>", error);
        throw Error(error);
    }
}

export async function updateItem(todoId, updatedTodo, userId) {
    logger.info("Call function updateItem");
    try {
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
    } catch (error) {
        logger.info("Error ==>>", error);
        throw Error(error);
    }
}

export async function deleteTodoItem(todoId, userId) {
    logger.info(`Deleting todo item ${todoId} from ${todoTable}`);
    try {
        await dynamodbClient.delete({
            TableName: todoTable,
            Key: {
                todoId,
                userId
            }
        })
        return 'success'
    } catch (error) {
        logger.info("Error ==>>", error);
        throw Error(error);
    }
}

export async function getUploadUrl(todoId, userId, uploadUrl) {
    logger.info("Call function getUploadUrl");
    try {
        await dynamodbClient.update({
            TableName: todoTable,
            Key: {
                userId,
                todoId,
            },
            UpdateExpression: "set attachmentUrl = :URL",
            ExpressionAttributeValues: {
                ":URL": uploadUrl.split("?")[0],
            },
            ReturnValues: "UPDATED_NEW",
        })
        return uploadUrl
    } catch (error) {
        logger.info("Error ==>>", error);
        throw Error(error);
    }
}
