import 'source-map-support/register'
import { generateResponse, getUserId } from '../utils'
import { deletePasswordItem } from '../../businessLogic/Passwords'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { HttpRequestError } from '../../exceptions/customExceptions'

const logger = createLogger('deletePassword')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('deletePassword is called: ',event)
  const passwordId = event.pathParameters.passwordId
  const userId = getUserId(event);

  try {
    return (await deletePasswordItem(passwordId,userId)) ? generateResponse('',204) : generateResponse('internal server error',500)
  } catch(err) {
    logger.error('deletePassword failed:', err)
    if(err instanceof HttpRequestError) {
      return generateResponse(err.message,err.status)
    }
    return generateResponse('internal server error',500)
  }
}
