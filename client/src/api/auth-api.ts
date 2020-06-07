import { apiEndpoint } from '../config'
import axios from 'axios';
import authHeader from './auth-header'
import { handleError } from './api-utils';


/*
* Created an API to mimic the Auth0 Login handling to easier integrate it to the Applicaiton.
*/
export default class Auth {

  API_URL :string;
  history: any;

 constructor(history :any) {
  this.history = history
  this.API_URL = `${apiEndpoint}/users`
 }


  isAuthenticated() {
     return (authHeader() !== '' ) ?  true : false;
 }

  getIdToken() : string {
    return authHeader()
 }

  async login(email: any, password: any) {
    return await axios.post(this.API_URL + '/login', {
      email,
      password
    }).then(function (response) {
      if(response.data.token) {
        localStorage.setItem('email', JSON.stringify(response.data))
      }
    })
    .catch(handleError)
  }

  handleAuthentication() {
    return (authHeader() !== '' ) ?  true : false;
  }

   logout() {
    localStorage.removeItem("email");
    this.history.replace('/');
  }

   async register(email: any, password: any) {
    return await axios.post(this.API_URL, {
      email,
      password
    }).then(function (response) {
      if(response.data.token) {
        localStorage.setItem('email', JSON.stringify(response.data))
      }
    })
    .catch(handleError)
  }

   getCurrentUser() {
    return authHeader()
  }
}

