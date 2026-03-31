import { request } from '@/utils/request'

export const submitHonor = (data) => request({ url: '/honor/submit', method: 'POST', data })
export const fetchHonorRecords = (params) =>
  request({ url: '/honor/records', method: 'GET', data: params })
