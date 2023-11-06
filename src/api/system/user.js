import request from '@/utils/request'
import md5 from "js-md5"
const userBaseUrl = import.meta.env.VITE_USER_BASE_API

// 查询用户列表
export function listUser(query) {
  return request({
    url: userBaseUrl + '/user/page',
    method: 'post',
    data: query || {}
  })
}

// 查询用户详细
export function getUser(id) {
  return request({
    url: userBaseUrl + '/user',
    method: 'get',
    params: {
      id
    }
  })
}

// 新增用户
export function addUser(data) {
  const newData = {...data}
  newData.password = md5(newData.password)
  return request({
    url: userBaseUrl + '/user',
    method: 'post',
    data: newData
  })
}

// 修改用户
export function updateUser(data) {
  return request({
    url: userBaseUrl + '/user',
    method: 'put',
    data: data
  })
}

// 删除用户
export function delUser(ids) {
  return request({
    url: userBaseUrl + '/user',
    method: 'delete',
    params: {
      ids
    }
  })
}

// 用户密码重置
export function resetUserPwd(userId, password) {
  const data = {
    password: md5(password),
    userId
  }
  return request({
    url: userBaseUrl + '/user/resetPassword',
    method: 'put',
    data: data
  })
}

// 用户状态修改
export function changeUserStatus(id, status) {
  return request({
    url: userBaseUrl + '/user/changeStatus',
    method: 'put',
    params: {
      id,
      status
    }
  })
}

// 修改用户个人信息
export function updateUserInfo(data) {
  return request({
    url: userBaseUrl + '/user',
    method: 'put',
    data: data
  })
}

// 用户密码重置
export function updatePassword(oldPassword, newPassword, userId) {
  const data = {
    oldPassword: md5(oldPassword),
    newPassword: md5(newPassword),
    isNeedCheck: true,
    userId
  }
  return request({
    url: userBaseUrl + '/user/updatePassword',
    method: 'put',
    data: data
  })
}

// 用户头像上传
export function uploadAvatar(avatar) {
  const data = {
    avatar: avatar
  }
  return request({
    url: userBaseUrl + '/user/updateAvatar',
    method: 'put',
    data: data
  })
}

// 查询用户已授权角色列表
export function authRoleList(query) {
  return request({
    url: userBaseUrl + '/user/authRole/authPage',
    method: 'post',
    data: query
  })
}

// 查询用户未授权角色列表
export function unAuthRoleList(query) {
  return request({
    url: userBaseUrl + '/user/authRole/unAuthPage',
    method: 'post',
    data: query
  })
}

// 取消角色授权用户
export function authRoleCancel(data) {
  return request({
    url: userBaseUrl + '/user/authRole/cancel',
    method: 'put',
    data: data
  })
}

// 授权用户选择
export function authRoleConfirm(data) {
  return request({
    url: userBaseUrl + '/user/authRole/confirm',
    method: 'put',
    data: data
  })
}
