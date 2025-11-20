import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {


  getAllUsers() {
    return ['Irina']
  }
}
