import request from '@/utils/request'
const userBaseUrl = import.meta.env.VITE_USER_BASE_API

// 查询登录日志列表
export function list(query) {
  return request({
    url: userBaseUrl + '/log/LOGIN_LOG/page',
    method: 'post',
    data: query
  })
}

// 删除登录日志
export function delLoginLog(ids) {
  return request({
    url: userBaseUrl + '/log/LOGIN_LOG',
    method: 'delete',
    params: {
      ids
    }
  })
}

// 清空登录日志
export function cleanLoginLog() {
  return request({
    url: userBaseUrl + '/log/LOGIN_LOG/clean',
    method: 'delete'
  })
}
