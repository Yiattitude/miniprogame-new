import { request } from '@/utils/request'

export const login = (data) => request({ url: '/auth/login', method: 'POST', data })
export const submitRealname = (data) => request({ url: '/user/realname', method: 'POST', data })
export const fetchUserProfile = () => request({ url: '/user/profile', method: 'GET' })
