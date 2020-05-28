import * as uuid from 'uuid'

import { PaginationResponseItem } from '../models/PaginationResponseItem'
import { PasswordItem } from '../models/PasswordItem'
import { PasswordRepository } from '../dataLayer/PasswordRepository'
import { CreatePasswordRequest } from '../requests/CreatePasswordRequest'
import { UpdatePasswordRequest } from '../requests/UpdatePasswordRequest'
import { Key } from 'aws-sdk/clients/dynamodb'
import { PasswordUpdate } from '../models/PasswordUpdate'
import { getSignedUrl } from '../lambda/utils'


// Global variables needed.
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const bucketName = process.env.TODO_IMAGES_S3_BUCKET

//create password repository object
const passwordRepository = new PasswordRepository()

/**
 * Get all todo items that belongs to the user.
 * @param userId userid of the user that is logged in.
 * @param limit limit number of items to be received.
 * @param nextKey get nextkey if their is any for pagination.
 *
 * @returns PaginationResponseItem with Items and nextKey
 */
export async function getAllPasswordItems(userId: string,limit :number,nextKey :Key): Promise<PaginationResponseItem> {
  return await passwordRepository.getPasswordItems(userId,limit,nextKey) as PaginationResponseItem
}

/**
 * Creates the todo item
 * @param createPasswordRequest object with the new item data
 * @param userId id of the user item
 *
 * @returns promise with the newItem created.
 */
export async function createPasswordItem(createPasswordRequest: CreatePasswordRequest,userId :string): Promise<PasswordItem> {
  const passwordId = uuid.v4()
  let newItem = createPasswordRequest as PasswordItem
  newItem.passwordId = passwordId
  newItem.createdAt = new Date().toISOString()
  newItem.userId = userId
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
    throw new Error('Password does not exist')
  }
  
  const newUpdate = updatePasswordRequest as PasswordUpdate
  return await (passwordRepository.updatePasswordItem(passwordId,userId,newUpdate) === undefined)
}

  /**
   * Deletes the todo item based on the Id
   * @param passwordId id of the password record
   * @param userId id of the user item
   *
   * @returns boolean if its successfull or not
   */
export async function deletePasswordItem(passwordId :string,userId :string) :Promise<boolean> {
  const validPassword = await passwordRepository.passwordExists(passwordId, userId)
  if(!validPassword) {
    throw new Error('Password does not exist')
  }

  return await (passwordRepository.deletePasswordItem(passwordId,userId) === undefined)
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
    throw new Error('Password does not exist')
  }

  const signedUrl = getSignedUrl(bucketName, passwordId, parseInt(urlExpiration))
  await passwordRepository.updatePasswordItem(passwordId,userId,validPassword, `https://${bucketName}.s3.amazonaws.com/${passwordId}` )
  
  return signedUrl
}