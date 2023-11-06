import request from '@/utils/request'
const authBaseUrl = import.meta.env.VITE_AUTH_BASE_API;
const userBaseUrl = import.meta.env.VITE_USER_BASE_API;

// 登录方法
export function login(username, password) {
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password',  password)
  formData.append('grant_type', "password")
  formData.append('client_id', "clientId1")
  formData.append('client_secret', "clientSecret1")
  return request({
    url: authBaseUrl + '/oauth/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      isToken: false
    },
    method: 'post',
    data: formData
  })
}

// 注册方法
export function register(data) {
  return request({
    url: userBaseUrl + '/register',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: userBaseUrl + '/user/getUserInfo',
    method: 'get'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: userBaseUrl + '/authCode',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  })
}