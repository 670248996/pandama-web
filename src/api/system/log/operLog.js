import request from '@/utils/request'
const userBaseUrl = import.meta.env.VITE_USER_BASE_API

// 查询操作日志列表
export function list(query) {
  return request({
    url: userBaseUrl + '/log/OPERATE_LOG/page',
    method: 'post',
    data: query
  })
}

// 删除操作日志
export function delOperLog(ids) {
  return request({
    url: userBaseUrl + '/log/OPERATE_LOG',
    method: 'delete',
    params: {
      ids
    }
  })
}

// 清空操作日志
export function cleanOperLog() {
  return request({
    url: userBaseUrl + '/log/OPERATE_LOG/clean',
    method: 'delete'
  })
}
