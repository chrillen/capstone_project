import 'source-map-support/register'
import { generateResponse, getUserId } from '../utils'
import { deletePasswordItem } from '../../businessLogic/Passwords'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const logger = createLogger('deletePassword')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('deletePassword is called: ',event)
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);

  try {
    return (await deletePasswordItem(userId, todoId)) ? generateResponse('',204) : generateResponse('internal server error',500)
  } catch(err) {
    logger.error('deletePassword failed:', err)
    return generateResponse('internal server error',500)
  }
}
