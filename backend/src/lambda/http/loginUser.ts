import 'source-map-support/register'
import { generateResponse, getUserId,  } from '../utils'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateUserRequest } from '../../requests/CreateUserRequest'
import { loginUser } from '../../businessLogic/Users'
import { HttpRequestError } from '../../exceptions/customExceptions'

const logger = createLogger('loginUser')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('loginUser is called: ',event)  

  const userLogin: CreateUserRequest = JSON.parse(event.body)

  try {
    const jwtPayload = await loginUser(userLogin)
    return generateResponse({ token: jwtPayload },200)
} catch(err) {
    logger.error('loginUser failed:', err)
    if(err instanceof HttpRequestError) {
        return generateResponse(err.message,err.status)
    }
    return generateResponse('internal server error',500)
  }
}