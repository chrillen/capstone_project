import { verify } from 'jsonwebtoken'
import { UserItem } from '../models/UserItem'
import { UserRepository } from '../dataLayer/UserRepository'
import { CreateUserRequest } from '../requests/CreateUserRequest'
import { createLogger } from '../utils/logger'
import { generatePassword, comparePasswords, generateJWT, parseToken, verifyToken, getToken } from '../auth/utils'
import { JwtPayload } from '../auth/JwtPayload'
import { HttpRequestError } from '../exceptions/customExceptions'
import { saveSecret, getSecret } from '../lambda/utils'
import * as uuid from 'uuid'


const logger = createLogger('businessLogic.User')
//create user repository object
const userRepository = new UserRepository()
//should be moved to ssm
const JWT_KEY = process.env.JWT_SECRET_KEY

/**
 * Will initiate the a random secret if its not setup yet and save it in SSM
 *
 * @returns promise with the new jwtsecret
 */
async function GetJwtSecretInit() : Promise<string> {
    let jwtSecret = ''
    try {
      jwtSecret = await getSecret(JWT_KEY)
    } catch(err) {
     jwtSecret = uuid.v4()
     await saveSecret(JWT_KEY , jwtSecret)    
   } 
   return jwtSecret
}

/**
 * Verify the users jwt token
 * @param token to verify
 *
 * @returns promise with boolean if token is valid or not.
 */
export async function verifyUser(token: string): Promise<JwtPayload> {
    const parsedToke = getToken(token)
    const secret = await GetJwtSecretInit()
    return verify(parsedToke, secret) as JwtPayload
}

/**
 * Logins the user
 * @param CreateUserRequest object with the new item data
 *
 * @returns promise with the LoginItem.
 */
export async function loginUser(createUserRequest: CreateUserRequest): Promise<string> {
    // find the user
    const user = await userRepository.userExists(createUserRequest.email)
    // check that user doesnt exists
    if(!user) {
       throw new HttpRequestError(401,'Unathorized')
    }

    // check that the password matches
    const authValid = await comparePasswords(createUserRequest.password, user.password_hash)

    if(!authValid) {
        throw new HttpRequestError(401,'Unathorized')
    }
    const secret = await GetJwtSecretInit()
    // Generate JWT
    return generateJWT(user.email,secret);
}

/**
 * Creates the user item
 * @param createPasswordRequest object with the new item data
 * @param userId id of the user item
 *
 * @returns promise with the newItem created.
 */
export async function createUserItem(createUserRequest: CreateUserRequest): Promise<string> {
    // find the user
     const user = await userRepository.userExists(createUserRequest.email)
     // check that user doesnt exists
     if(user) {
        throw new HttpRequestError(422,'allready exist user with that email')
     }
    
    const newItem :UserItem = {
        email: createUserRequest.email,
        password_hash: await generatePassword(createUserRequest.password)
    }
     const secret = await GetJwtSecretInit()
     const jwt = generateJWT(newItem.email,secret);
     await userRepository.createUserItem(newItem)
     await saveSecret(newItem.email,createUserRequest.password)
     return jwt
  }