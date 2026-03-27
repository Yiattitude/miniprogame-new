export const setTabBarIndex = (index) => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  if (!page || !page.getTabBar) return
  const tabBar = page.getTabBar()
  if (!tabBar || !tabBar.setData) return
  tabBar.setData({ selected: index })
}
