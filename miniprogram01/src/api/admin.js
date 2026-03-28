import { request } from '@/utils/request'

export const importExcel = (data) => request({ url: '/admin/import', method: 'POST', data })
export const fetchAuditList = (params) => request({ url: '/admin/audit', method: 'GET', data: params })
export const exportExcel = (params) => request({ url: '/admin/export', method: 'GET', data: params })
