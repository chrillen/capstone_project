
interface email {
  token: string
}

export default function authHeader() {
    const data = localStorage.getItem('email') || ''
    let email: email = { token: ''};
    if(data)
    {
      email = JSON.parse(data) as email
    } else {
      return ''
    }
    if (email && email.token) {
      return  email.token;
    } else {
      return ''
    }
  }