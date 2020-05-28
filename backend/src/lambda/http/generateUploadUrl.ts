import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { generateResponse, getUserId } from '../utils'
import { generateAttachmentUrl } from '../../businessLogic/Passwords'
import { createLogger } from '../../utils/logger'

const logger = createLogger('GenerateUploadUrl')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('GenerateUploadUrl is called: ',event)
  const passwordId = event.pathParameters.passwordId
  const userId = getUserId(event);

  try {
    const signedUrl = await generateAttachmentUrl(userId,passwordId)
    logger.info('GenerateUploadUrl is done')
    return generateResponse( { uploadUrl: signedUrl } ,200);
  } catch(err) {
    logger.error('GenerateUploadUrl failed:', err)
    return generateResponse('internal server error',500)
  }
}

