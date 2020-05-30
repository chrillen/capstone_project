import { decode, sign, verify } from 'jsonwebtoken'
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from './JwtPayload'



/**
 * Parse token from header
 * @param authHeader
 * @returns token as string
 */
export function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns decoded token
 */
export function verifyToken(jwtToken: string,secret: string): boolean {
   try {
     const decoded =  verify(jwtToken, secret) as JwtPayload
     return true
   } catch(error) {
     return false
   }
  }


/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns decoded token
 */
export function parseToken(jwtToken: string): JwtPayload {
  return decode(jwtToken) as JwtPayload
}


/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

export async function generatePassword(plainTextPassword: string): Promise<string> {
  const rounds = 10;
  const salt = await bcrypt.genSalt(rounds);
  const hash = await bcrypt.hash(plainTextPassword , salt);
  return hash;
}

export async function comparePasswords(plainTextPassword: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plainTextPassword, hash);
}

export function generateJWT(email: string,secret :string): string {
  return sign( { sub: email }, secret);
}
