/**
 * Fields in a request to update a single PasswordManager item.
 */
export interface UpdatePasswordRequest {
  title: string
  userName: string
  password: string
  url?: string
}