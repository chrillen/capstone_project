import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId, generateResponse, parseLimitParameter, parseNextKeyParameter } from '../utils'
import { getAllPasswordItems } from '../../businessLogic/Passwords'
import { createLogger } from '../../utils/logger'
import { HttpRequestError } from '../../exceptions/customExceptions'

const logger = createLogger('getPasswords')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('getPasswords is called: ',event)
  const userId = getUserId(event);
  const limit = parseLimitParameter(event) || 20
  const nextKey = parseNextKeyParameter(event)


  logger.info('getPasswords is done:', globalThis.password)


  if(!userId) {
    return generateResponse('userId is missing' , 400)
  }

  try {
    const result = await getAllPasswordItems(userId, limit, nextKey)
    logger.info('getPasswords is done:', result)
    return generateResponse( { items: result.Items, nextKey: result.nextKey} , 200)
  } catch(err) {    
    logger.error('getPasswords failed:', err)
    if(err instanceof HttpRequestError) {
      return generateResponse(err.message,err.status)
    }
    return generateResponse('internal server error',500)
  }
}

