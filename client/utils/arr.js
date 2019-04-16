export const times = (func, number) => {
  let index = -1
  const arr = []
  while (++index < number) {
    arr.push(func(index))
  }
  return arr
}
