import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId, generateResponse } from '../utils'
import { createPasswordItem } from '../../businessLogic/Passwords'
import { createLogger } from '../../utils/logger'
import { CreatePasswordRequest } from '../../requests/CreatePasswordRequest'
import { HttpRequestError } from '../../exceptions/customExceptions'

const logger = createLogger('createPassword')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('CreatePassword is called: ',event)
  const userId = getUserId(event);
  
  if(!userId) {
    return generateResponse('userId is missing' , 400)
  }

  const newPassword: CreatePasswordRequest = JSON.parse(event.body)

  try {
    const newItem = await createPasswordItem(newPassword, userId)
    //So we will display the new password decrypted for the user.
    newItem.password = newPassword.password
    logger.info('createPassword password is done')
    return generateResponse( { item: newItem }, 201)
  } catch(err) {
    logger.error('createPassword failed:', err)
    if(err instanceof HttpRequestError) {
      return generateResponse(err.message,err.status)
    }
    return generateResponse('internal server error',500)
  }
}
