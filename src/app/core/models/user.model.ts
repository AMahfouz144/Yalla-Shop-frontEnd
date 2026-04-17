export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'customer' | 'seller' | 'admin';
  phone?: string;
  address?: IAddress;
  avatar?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'seller';
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}
