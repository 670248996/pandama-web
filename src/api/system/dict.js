import request from '@/utils/request'

const userBaseUrl = import.meta.env.VITE_USER_BASE_API

// 查询字典数据列表
export function listDict(data) {
  return request({
    url: userBaseUrl + '/dict/list',
    method: 'post',
    data: data
  })
}

// 获取所有字典数据列表
export function getAllDict() {
  return request({
    url: userBaseUrl + '/dict/list',
    method: 'post',
    data: {}
  })
}

// 根据主键id获取字典数据
export function getDict(id) {
  return request({
    url: userBaseUrl + '/dict',
    method: 'get',
    params: {
      id
    }
  })
}

// 新增字典数据
export function addDict(data) {
  return request({
    url: userBaseUrl + '/dict',
    method: 'post',
    data: data
  })
}

// 修改字典数据
export function updateDict(data) {
  return request({
    url: userBaseUrl + '/dict',
    method: 'put',
    data: data
  })
}

// 删除字典数据
export function delDict(ids) {
  return request({
    url: userBaseUrl + '/dict',
    method: 'delete',
    params: {
      ids
    }
  })
}

// 修改字典数据启用状态
export function changeDictStatus(id, status) {
  return request({
    url: userBaseUrl + '/dict/changeStatus',
    method: 'put',
    params: {
      id,
      status
    }
  })
}
