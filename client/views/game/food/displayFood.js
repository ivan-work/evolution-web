export default (food) => {
  if (food > 0) {
    return ` +${food}`
  } else if (food < 0) {
    return ` ${food}`
  }
  return null
}