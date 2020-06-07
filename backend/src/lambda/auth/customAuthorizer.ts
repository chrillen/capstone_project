import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import { verifyUser } from '../../businessLogic/Users'
import { JwtPayload } from '../../auth/JwtPayload'
import { createLogger } from '../../utils/logger'

const logger = createLogger('auth')


export const handler = async (
    event: CustomAuthorizerEvent
  ): Promise<CustomAuthorizerResult> => {
    try {
       const decodedToken: JwtPayload = await verifyUser(event.authorizationToken)
    return {
      principalId: decodedToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.info('User was not authorized', e.message)
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

