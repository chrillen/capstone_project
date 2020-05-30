import * as AWS  from 'aws-sdk'

import { UserItem } from '../models/UserItem'
import { Key, DocumentClient } from 'aws-sdk/clients/dynamodb';
import { encodeNextKey } from '../lambda/utils';
import { createLogger } from '../utils/logger'


const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('businessLogic.User')


function createDynamoDBClient() {
  return new XAWS.DynamoDB.DocumentClient()
}

export class UserRepository {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly userTable = process.env.USERS_TABLE){
      }

/**
 * valides if the todo item exists
 * @param email of the user
 *
 * @returns UserItem if it exists otherwise its undefined
 */
async userExists(email: string) : Promise<UserItem> {
    const result = await this.docClient
      .get({
        TableName: this.userTable,
        Key: {
         email 
        }
      })
      .promise()
      return result.Item as UserItem ?? undefined
  }

/**
 * Creates the todo item
 * @param newUser object with the new item data
 *
 * @returns promise with the newItem created.
 */
 async createUserItem(newUser: UserItem) :Promise<UserItem> {
    await this.docClient.put({
      TableName: this.userTable,
      Item: newUser
    }).promise()
    return newUser
  }

}