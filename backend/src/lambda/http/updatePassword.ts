import 'source-map-support/register'
import { generateResponse, getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdatePasswordRequest } from '../../requests/UpdatePasswordRequest'
import { updatePasswordItem } from '../../businessLogic/Passwords'

const logger = createLogger('updatePassword')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('updatePassword is called: ',event)  
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);

  const updatedPassword: UpdatePasswordRequest = JSON.parse(event.body)

  try {
    return (await updatePasswordItem(updatedPassword ,userId, todoId)) ?  generateResponse('',200) : generateResponse('internal server error',500)
  } catch(err) {
    logger.error('updatePassword failed:', err)
    return generateResponse('internal server error',500)
  }
}
