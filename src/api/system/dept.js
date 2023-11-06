import request from '@/utils/request'
const userBaseUrl = import.meta.env.VITE_USER_BASE_API

// 获取部门编号
export function getNo() {
  return request({
    url: userBaseUrl + '/dept/getNo',
    method: 'get'
  })
}

// 查询部门列表
export function listDept(query) {
  return request({
    url: userBaseUrl + '/dept/list',
    method: 'post',
    data: query || {}
  })
}

// 查询部门详细
export function getDept(id) {
  return request({
    url: userBaseUrl + '/dept',
    method: 'get',
    params: {
      id
    }
  })
}

// 新增部门
export function addDept(data) {
  return request({
    url: userBaseUrl + '/dept',
    method: 'post',
    data: data
  })
}

// 修改部门
export function updateDept(data) {
  return request({
    url: userBaseUrl + '/dept',
    method: 'put',
    data: data
  })
}

// 删除部门
export function delDept(ids) {
  return request({
    url: userBaseUrl + '/dept',
    method: 'delete',
    params: {
      ids
    }

  })
}

// 查询部门下拉树结构
export function deptTree(data) {
  return request({
    url: userBaseUrl + '/dept/tree',
    method: 'post',
    data: data || {}
  })
}