import request from '@/utils/request'
const userBaseUrl = import.meta.env.VITE_USER_BASE_API

// 查询菜单列表
export function listMenu(query) {
  return request({
    url: userBaseUrl + '/menu/list',
    method: 'post',
    data: query || {}
  })
}

// 查询菜单详细
export function getMenu(id) {
  return request({
    url: userBaseUrl + '/menu',
    method: 'get',
    params: {
      id
    }
  })
}

// 查询菜单下拉树结构
export function treeMenu() {
  return request({
    url: userBaseUrl + '/menu/tree',
    method: 'post',
    data: {}
  })
}

// 根据角色ID查询菜单下拉树结构
export function roleMenuTreeselect(roleId) {
  return request({
    url: userBaseUrl + '/menu/treeSelectByRoleId',
    method: 'get',
    params: {
      roleId
    }
  })
}

// 新增菜单
export function addMenu(data) {
  return request({
    url: userBaseUrl + '/menu',
    method: 'post',
    data: data
  })
}

// 修改菜单
export function updateMenu(data) {
  return request({
    url: userBaseUrl + '/menu',
    method: 'put',
    data: data
  })
}

// 删除菜单
export function delMenu(ids) {
  return request({
    url: userBaseUrl + '/menu',
    method: 'delete',
    params: {
      ids
    }
  })
}