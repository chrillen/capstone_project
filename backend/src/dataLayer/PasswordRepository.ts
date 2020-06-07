import * as AWS  from 'aws-sdk'
import { UpdatePasswordRequest } from "../requests/UpdatePasswordRequest";
import { CreatePasswordRequest } from "../requests/CreatePasswordRequest";
import { PasswordItem } from "../models/PasswordItem";
import { PasswordUpdate } from "../models/PasswordUpdate";
import { Key, DocumentClient } from 'aws-sdk/clients/dynamodb';
import { encodeNextKey } from '../lambda/utils';
import { createLogger } from '../utils/logger'


const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('dataLayer.Password')


function createDynamoDBClient() {
  return new XAWS.DynamoDB.DocumentClient()
}

export class PasswordRepository {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly passwordTable = process.env.PASSWORDS_TABLE,
    private readonly passwordIndex = process.env.PASSWORDS_ID_INDEX){
  }

/**
 * Get all todo items that belongs to the user.
 * @param userId userid of the user that is logged in.
 * @param limit limit number of items to be received.
 * @param nextKey get nextkey if their is any for pagination.
 *
 * @returns all passwordManager items that user has added and nextKey for pagination handling.
 */
 async  getPasswordItems(userId: string,limit :number,nextKey :Key) : Promise<any> {
  const result = await this.docClient.query({
    TableName: this.passwordTable,
    IndexName: this.passwordIndex,
    Limit: limit,
    ExclusiveStartKey: nextKey,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ProjectionExpression:'passwordId,createdAt,title,dueDate,userName,password,#url,attachmentUrl',  
    ExpressionAttributeNames: {
      '#url': 'url'
    },
    ScanIndexForward: false
  }).promise()
  return  {  Items: result.Items as PasswordItem[], nextKey:  encodeNextKey(result.LastEvaluatedKey) }
}

/**
 * valides if the todo item exists
 * @param passwordId id of the password item
 * @param userId userid of the user that is logged in.
 *
 * @returns passwordItem if it exists otherwise its undefined
 */
 async  passwordExists(passwordId: string,userId: string) : Promise<PasswordItem> {
    const result = await this.docClient
      .get({
        TableName: this.passwordTable,
        Key: {
         userId, passwordId 
        }
      })
      .promise()
      return result.Item as PasswordItem ?? undefined
  }

/**
 * Creates the todo item
 * @param newPassword object with the new item data
 *
 * @returns promise with the newItem created.
 */
 async createPasswordItem(newPassword: PasswordItem) :Promise<PasswordItem> {
    await this.docClient.put({
      TableName: this.passwordTable,
      Item: newPassword
    }).promise()
    newPassword.userId = undefined
    return newPassword
  }
  
  /**
   * Updates the todo item based on the Id
   * @param passwordId id of the todo item
   * @param userId id of the user item
   * @param updatedPassword updatedPassword item with the changes.
   * @param attachmentUrl? Update attachmentUrl of item its optional.
   *
   * @returns Updated todo item.
   */
   async  updatePasswordItem(userId: string, passwordId: string, 
    updatedPassword: PasswordUpdate, attachmentUrl?: string) : Promise<PasswordUpdate> {
      logger.info("before update:",updatedPassword)
      const result = await this.docClient.update({
        TableName: this.passwordTable,
        Key: { userId, passwordId },
        UpdateExpression: "set title=:title, userName=:userName, password=:password,#url=:url, attachmentUrl=:attachmentUrl",
        ExpressionAttributeValues: {
          ":title": updatedPassword.title,
          ":userName": updatedPassword.userName,
          ":password": updatedPassword.password,
          ":url": updatedPassword.url || '',
          ":attachmentUrl": attachmentUrl || ''
      },
      ExpressionAttributeNames: {
        '#url': 'url'
      },
      ReturnValues: "UPDATED_NEW"
    })
    .promise()
    logger.info("after update:",result)
    return result.$response.data as PasswordUpdate ?? undefined
  }
  
  /**
   * Deletes the todo item based on the Id
   * @param passwordId id of the password record
   * @param userId id of the user item
   *
   * @returns nothing
   */
   async  deletePasswordItem(passwordId :string,userId :string) : Promise<PasswordItem> {
    const result = await this.docClient.delete({
    TableName: this.passwordTable,
    Key: {
      userId, passwordId
     }
    }).promise()

    logger.info("delete:",result)
    return result.$response.data as PasswordItem ?? undefined
  }
}