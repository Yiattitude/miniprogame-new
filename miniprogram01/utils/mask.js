export const maskIdCard = (value) => {
  if (!value) return ''
  if (value.length < 8) return value
  return `${value.slice(0, 3)}***********${value.slice(-4)}`
}
