export function throttle(func, duration) {
  let last
  let timeoutId
  return function throttled(...args) {
    const now = Date.now()
    if (last && now < last + duration) {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        last = now
        func(...args)
      }, duration)
    } else {
      last = now
      func(...args)
    }
  }
}

export function debounce(func, duration) {
  let timeoutId = 0
  return function debounced(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      timeoutId = 0
      func(...args)
    }, duration)
  }
}
