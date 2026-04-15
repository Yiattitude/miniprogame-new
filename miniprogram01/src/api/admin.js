import { request } from '@/utils/request'

export const importExcel = (data) => request({ url: '/admin/import', method: 'POST', data })
export const fetchAdminDashboard = (params) => request({ url: '/admin/dashboard', method: 'GET', data: params })
export const fetchAuditList = (params) => request({ url: '/admin/audit', method: 'GET', data: params })
export const submitAudit = (data) => request({ url: '/admin/audit', method: 'POST', data })
export const exportExcel = (params) => request({ url: '/admin/export', method: 'GET', data: params })
export const fetchAdminUsers = (params) => request({ url: '/admin/users', method: 'GET', data: params })
export const setUserRole = (data) => request({ url: '/admin/users/role', method: 'POST', data })
export const disableUser = (data) => request({ url: '/admin/users/disable', method: 'POST', data })
