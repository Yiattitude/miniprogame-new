import { defineStore } from 'pinia'

const STORAGE_KEY = 'yc_user_state'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    idCard: '',
    isAdmin: false,
    volunteerPoints: 0,
    honorPoints: 0
  }),
  getters: {
    totalPoints: (state) => state.volunteerPoints + state.honorPoints
  },
  actions: {
    initFromStorage() {
      const saved = uni.getStorageSync(STORAGE_KEY)
      if (saved) {
        this.name = saved.name || ''
        this.idCard = saved.idCard || ''
        this.isAdmin = !!saved.isAdmin
        this.volunteerPoints = Number(saved.volunteerPoints || 0)
        this.honorPoints = Number(saved.honorPoints || 0)
      }
    },
    persist() {
      uni.setStorageSync(STORAGE_KEY, {
        name: this.name,
        idCard: this.idCard,
        isAdmin: this.isAdmin,
        volunteerPoints: this.volunteerPoints,
        honorPoints: this.honorPoints
      })
    },
    setAdmin(value) {
      this.isAdmin = !!value
      this.persist()
    },
    setUserInfo(payload) {
      this.name = payload?.name || ''
      this.idCard = payload?.idCard || ''
      this.persist()
    },
    setPoints({ volunteerPoints, honorPoints }) {
      if (typeof volunteerPoints === 'number') this.volunteerPoints = volunteerPoints
      if (typeof honorPoints === 'number') this.honorPoints = honorPoints
      this.persist()
    },
    reset() {
      this.name = ''
      this.idCard = ''
      this.isAdmin = false
      this.volunteerPoints = 0
      this.honorPoints = 0
      this.persist()
    }
  }
})
