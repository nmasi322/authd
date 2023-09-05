export interface UserDataInput {
  name?: string;
  email?: string;
  password?: string;
}

export interface UserUpdateInput {
  userId: string;
  name?: string;
  email?: string;
}
