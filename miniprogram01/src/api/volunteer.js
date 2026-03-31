import { request } from '@/utils/request'

export const submitVolunteer = (data) => request({ url: '/volunteer/submit', method: 'POST', data })
export const fetchVolunteerRecords = (params) =>
  request({ url: '/volunteer/records', method: 'GET', data: params })
