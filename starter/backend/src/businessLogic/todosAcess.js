import { createLogger } from "../utils/logger.mjs";
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

const XRAY_AWS = AWSXRay.captureAWS(AWS);
const todoDocument = new XRAY_AWS.DynamoDB.DocumentClient();
const logger = createLogger("TodoAccess");
const S3_bucket = new XRAY_AWS.S3({ signatureVersion: "v4" })

const todoTable = process.env.TODOS_TABLE
const todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX;
const s3_bucket_name = process.env.ATTACHMENT_S3_BUCKET;
const url_expiration = process.env.SIGNED_URL_EXPIRATION;


export async function createItem(newTodo) {
    logger.info("Call function createItem");
    try {
        await todoDocument.put({
            TableName: todoTable,
            Item: newTodo
        }).promise();
        return newTodo
    } catch (error) {
        logger.info("Error ==>>", error);
        throw Error(error);
    }
}

export async function getAllItems(userId) {
    logger.info("Call function getAllItems");
    try {
        const result = await todoDocument.query({
            TableName: todoTable,
            IndexName: todosCreatedAtIndex,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }).promise();
        return result
    } catch (error) {
        logger.info("Error ==>>", error);
        throw Error(error);
    }
}

export async function updateItem(todoId, updatedTodo, userId) {
    logger.info("Call function updateItem");
    try {
        await todoDocument.update({
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
        }).promise();
    } catch (error) {
        logger.info("Error ==>>", error);
        throw Error(error);
    }
}

export async function deleteTodoItem(todoId, userId) {
    logger.info(`Deleting todo item ${todoId} from ${todoTable}`);
    try {
        await todoDocument.delete({
            TableName: todoTable,
            Key: {
                todoId,
                userId
            }
        }).promise();
        return 'success'
    } catch (error) {
        logger.info("Error ==>>", error);
        throw Error(error);
    }
}

export async function getUploadUrl(todoId, userId) {
    logger.info("Call function getUploadUrl");
    try {
        const uploadUrl = S3_bucket.getSignedUrl("putObject", {
            Bucket: s3_bucket_name,
            Key: todoId,
            Expires: Number(url_expiration),
        });
        await todoDocument.update({
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
        }).promise();
        return uploadUrl
    } catch (error) {
        logger.info("Error ==>>", error);
        throw Error(error);
    }
}
