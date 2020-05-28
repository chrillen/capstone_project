import { PasswordItem } from '../models/PasswordItem'

export interface PaginationResponseItem {
    Items : PasswordItem[],
    nextKey: string
  }
  