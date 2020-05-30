/**
 * Fields in a request to create a single PasswordManager item.
 */
export interface CreatePasswordRequest {
  title: string
  userName: string
  password: string
  url?: string
}
