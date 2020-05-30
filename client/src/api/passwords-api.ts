import { apiEndpoint } from '../config'
import { Password } from '../types/Password';
import { CreatePasswordRequest } from '../types/CreatePasswordRequest';
import Axios from 'axios'
import { UpdatePasswordRequest } from '../types/UpdatePasswordRequest';

export async function getPasswords(idToken: string): Promise<Password[]> {
  console.log('Fetching passwords')

  const response = await Axios.get(`${apiEndpoint}/passwords`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Passwords:', response.data)
  return response.data.items
}

export async function createPassword(
  idToken: string,
  newPassword: CreatePasswordRequest
): Promise<Password> {
  const response = await Axios.post(`${apiEndpoint}/passwords`,  JSON.stringify(newPassword), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchPassword(
  idToken: string,
  passwordId: string,
  updatedPassword: UpdatePasswordRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/passwords/${passwordId}`, JSON.stringify(updatedPassword), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deletePassword(
  idToken: string,
  passwordId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/passwords/${passwordId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  passwordId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/passwords/${passwordId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
