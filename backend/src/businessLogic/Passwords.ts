import * as uuid from 'uuid'
import { PaginationItem } from '../models/PaginationItem'
import { PasswordItem } from '../models/PasswordItem'
import { PasswordRepository } from '../dataLayer/PasswordRepository'
import { CreatePasswordRequest } from '../requests/CreatePasswordRequest'
import { UpdatePasswordRequest } from '../requests/UpdatePasswordRequest'
import { Key } from 'aws-sdk/clients/dynamodb'
import { PasswordUpdate } from '../models/PasswordUpdate'
import { getSignedUrl } from '../lambda/utils'
import { createLogger } from '../utils/logger'
import { getSecret, encryptData, decryptData } from '../lambda/utils'
import { HttpRequestError } from '../exceptions/customExceptions'


// Global variables needed.
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const bucketName = process.env.PASSWORDS_ATTACHMENTS_S3_BUCKET

const logger = createLogger('businessLogic.Password')
//create password repository object
const passwordRepository = new PasswordRepository()
/**
 * Get all password items that belongs to the user.
 * @param userId userid of the user that is logged in.
 * @param limit limit number of items to be received.
 * @param nextKey get nextkey if their is any for pagination.
 *
 * @returns PaginationResponseItem with Items and nextKey
 */
export async function getAllPasswordItems(userId: string,limit :number,nextKey :Key): Promise<PaginationItem> {
  //Hämta nyckeln
   const key = await getSecret(userId)
  // decryptera alla PW
  const passwordItems = await passwordRepository.getPasswordItems(userId,limit,nextKey) as PaginationItem
  passwordItems.Items.map((item) => {
    if(item.password) {
        item.password = decryptData(key,item.password)
    }
  });
  return passwordItems
}

/**
 * Creates the password item
 * @param createPasswordRequest object with the new item data
 * @param userId id of the user item
 *
 * @returns promise with the newItem created.
 */
export async function createPasswordItem(createPasswordRequest: CreatePasswordRequest,userId :string): Promise<PasswordItem> {
  const passwordId = uuid.v4()
  const key = await getSecret(userId)
  let newItem = createPasswordRequest as PasswordItem
  newItem.passwordId = passwordId
  newItem.createdAt = new Date().toISOString()
  newItem.userId = userId
  newItem.password = encryptData(key,createPasswordRequest.password)
  return await passwordRepository.createPasswordItem(newItem);
}

  /**
   * Updates the todo item based on the Id
   * @param passwordId id of the todo item
   * @param userId id of the user item
   * @param updatePasswordRequest updatedPassword item with the changes.
   *
   * @returns boolean if its successfull or not
   */
export async function updatePasswordItem(updatePasswordRequest: UpdatePasswordRequest,userId: string,passwordId: string) :Promise<boolean> {
  const validPassword = await passwordRepository.passwordExists(passwordId, userId)
  if(!validPassword) {
    throw new HttpRequestError(400,'Password does not exist')
  }

  const key = await getSecret(userId)
  const newUpdate = updatePasswordRequest as PasswordUpdate
  newUpdate.password = encryptData(key,updatePasswordRequest.password)
  const result = await passwordRepository.updatePasswordItem(userId,passwordId,newUpdate)
  return (result === undefined) ? false : true
}

  /**
   * Deletes the password item based on the Id
   * @param passwordId id of the password record
   * @param userId id of the user item
   *
   * @returns boolean if its successfull or not
   */
export async function deletePasswordItem(passwordId :string,userId :string) :Promise<boolean> {
  const validPassword = await passwordRepository.passwordExists(passwordId, userId)  
  if(!validPassword) {
    throw new HttpRequestError(400,'Password does not exist')
  }

  const result = await passwordRepository.deletePasswordItem(passwordId,userId)
  return (result == undefined) ? false : true
}

  /**
   * generateAttachmentUrl and updates the item with the url to s3.
   * @param passwordId id of the password record
   * @param userId id of the user item
   *
   * @returns signedUrl so client can upload directly to s3.
   */
export async function generateAttachmentUrl(userId: string,passwordId: string) :Promise<string> {
  const validPassword = await passwordRepository.passwordExists(passwordId, userId)
  if(!validPassword) {
    throw new HttpRequestError(400,'Password does not exist')
  }

  const signedUrl = getSignedUrl(bucketName, passwordId, parseInt(urlExpiration))
  await passwordRepository.updatePasswordItem(userId,passwordId,validPassword, `https://${bucketName}.s3.amazonaws.com/${passwordId}` )
  
  return signedUrl
}