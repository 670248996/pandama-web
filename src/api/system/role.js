import request from '@/utils/request'
const userBaseUrl = import.meta.env.VITE_USER_BASE_API

// 查询角色列表
export function listRole(query) {
  return request({
    url: userBaseUrl + '/role/list',
    method: 'post',
    data: query || {}
  })
}

// 查询角色列分野
export function pageRole(query) {
  return request({
    url: userBaseUrl + '/role/page',
    method: 'post',
    data: query || {}
  })
}

// 查询角色详细
export function getRole(id) {
  return request({
    url: userBaseUrl + '/role',
    method: 'get',
    params: {
      id
    }
  })
}

// 新增角色
export function addRole(data) {
  return request({
    url: userBaseUrl + '/role',
    method: 'post',
    data: data
  })
}

// 修改角色
export function updateRole(data) {
  return request({
    url: userBaseUrl + '/role',
    method: 'put',
    data: data
  })
}

// 角色数据权限
export function dataScope(data) {
  return request({
    url: userBaseUrl + '/role/dataScope',
    method: 'put',
    data: data
  })
}

// 角色状态修改
export function changeRoleStatus(id, status) {
  return request({
    url: userBaseUrl + '/role/changeStatus',
    method: 'put',
    params: {
      id,
      status
    }
  })
}

// 删除角色
export function delRole(ids) {
  return request({
    url: userBaseUrl + '/role',
    method: 'delete',
    params: {
      ids
    }
  })
}

// 查询角色已授权用户列表
export function authUserList(query) {
  return request({
    url: userBaseUrl + '/role/authUser/authPage',
    method: 'post',
    data: query
  })
}

// 查询角色未授权用户列表
export function unAuthUserList(query) {
  return request({
    url: userBaseUrl + '/role/authUser/unAuthPage',
    method: 'post',
    data: query
  })
}

// 取消用户授权角色
export function authUserCancel(data) {
  return request({
    url: userBaseUrl + '/role/authUser/cancel',
    method: 'put',
    data: data
  })
}

// 授权用户选择
export function authUserConfirm(data) {
  return request({
    url: userBaseUrl + '/role/authUser/confirm',
    method: 'put',
    data: data
  })
}

// 根据角色ID查询部门树结构
export function deptTreeSelect(roleId) {
  return request({
    url: userBaseUrl + '/role/deptTree/' + roleId,
    method: 'get'
  })
}
