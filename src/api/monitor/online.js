import request from '@/utils/request'
const userBaseUrl = import.meta.env.VITE_USER_BASE_API

// 查询在线用户列表
export function list(query) {
  return request({
    url: userBaseUrl + '/online/page',
    method: 'post',
    data: query
  })
}

// 强退用户
export function forceLogout(ids) {
  return request({
    url: userBaseUrl + '/online',
    method: 'delete',
    params: {
      ids
    }
  })
}
