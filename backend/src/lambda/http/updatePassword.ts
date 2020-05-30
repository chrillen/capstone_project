import 'source-map-support/register'
import { generateResponse, getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdatePasswordRequest } from '../../requests/UpdatePasswordRequest'
import { updatePasswordItem } from '../../businessLogic/Passwords'
import { HttpRequestError } from '../../exceptions/customExceptions'

const logger = createLogger('updatePassword')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('updatePassword is called: ',event)  
  const passwordId = event.pathParameters.passwordId
  const userId = getUserId(event);

  const updatedPassword: UpdatePasswordRequest = JSON.parse(event.body)

  try {
    return (await updatePasswordItem(updatedPassword ,userId, passwordId)) ?  generateResponse('',200) : generateResponse('internal server error',500)
  } catch(err) {
    logger.error('updatePassword failed:', err)
    if(err instanceof HttpRequestError) {
      return generateResponse(err.message,err.status)
    }
    return generateResponse('internal server error',500)
  }
}
