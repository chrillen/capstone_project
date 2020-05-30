import 'source-map-support/register'
import { generateResponse, getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateUserRequest } from '../../requests/CreateUserRequest'
import { createUserItem } from '../../businessLogic/Users'
import { HttpRequestError } from '../../exceptions/customExceptions'

const logger = createLogger('createUser')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('createUser is called: ',event)  

  const createUser: CreateUserRequest = JSON.parse(event.body)

  try {
    const jwtPayload = await createUserItem(createUser)
    return generateResponse({ token: jwtPayload },200)
} catch(err) {    
    logger.error('createUser failed:', err)    
    if(err instanceof HttpRequestError) {
        return generateResponse(err.message,err.status)
    }
    return generateResponse('internal server error',500)
  }
}