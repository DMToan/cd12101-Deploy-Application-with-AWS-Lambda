import AWS from 'aws-sdk';
import { createLogger } from '../utils/logger';
import { AttachmentUtils } from "./attachmentUtils";
import AWSXRay from 'aws-xray-sdk';

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('TodosAccess');

export class TodosAccess {
    constructor() {
        this.todoTable = process.env.TODOS_TABLE;
        this.bucketName = process.env.ATTACHMENT_S3_BUCKET;
        this.todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX;
        this.todoDocument = new XAWS.DynamoDB.DocumentClient();
    }

    async createTodo(todo) {
        logger.info("----- Create new todo -----");
        await this.todoDocument.put({
            TableName: this.todoTable,
            Item: todo
        }).promise();
        logger.info(`Item ${todo.name} has been added`);
        return todo;
    }

    async getTodos(userId) {
        if (userId) {
            logger.info("Get all todo items");

            const todos = await this.todoDocument.query({
                TableName: this.todoTable,
                IndexName: this.todosCreatedAtIndex,
                KeyConditionExpression: "#userId = :userId",
                ExpressionAttributeNames: {
                    "#userId": "userId"
                },
                ExpressionAttributeValues: {
                    ":userId": userId
                }
            }).promise();

            logger.info(`Todo items: ${todos.Items}`);
            return todos.Items;
        } else {
            logger.error("Unauthorized!");
        }
    }

    async updateTodo(userId, todoId, todo) {
        if (userId) {
            logger.info(`Update item with id: ${todoId}`);

            await this.todoDocument.update({
                TableName: this.todoTable,
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
                    ":name": todo.name,
                    ":dueDate": todo.dueDate,
                    ":done": todo.done
                }
            }).promise();

            logger.info("Updated successfully", todo);
        } else {
            logger.error("Unauthorized");
        }
    }

    async deleteTodo(userId, todoId) {
        if (userId) {
            logger.info(`Ready to delete todo ${todoId}`);

            await this.todoDocument.delete({
                TableName: this.todoTable,
                Key: {
                    todoId,
                    userId
                }
            }).promise();

            logger.info("Delete: OK!");
        } else {
            logger.error("Unauthorized");
        }
    }

    async createAttachmentImageURL(userId, todoId, attachmentId) {
        const attachmentUtil = new AttachmentUtils();
        const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`;

        if (userId) {
            await this.todoDocument.update({
                TableName: this.todoTable,
                Key: {
                    todoId,
                    userId
                },
                UpdateExpression: "set #attachmentUrl = :attachmentUrl",
                ExpressionAttributeNames: {
                    "#attachmentUrl": "attachmentUrl"
                },
                ExpressionAttributeValues: {
                    ":attachmentUrl": attachmentUrl
                }
            }).promise();

            const attachmentImageURL = await attachmentUtil.createAttachmentPresignedUrl(attachmentId);
            logger.info(`Attachment URL is: ${attachmentImageURL}`);
            return attachmentImageURL;
        } else {
            logger.error("Unauthorized!");
        }
    }
}