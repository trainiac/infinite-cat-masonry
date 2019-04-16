function below(width) {
  return window.matchMedia(`(max-width: ${width})`).matches
}

function above(width) {
  return window.matchMedia(`(min-width: ${width})`).matches
}

export default {
  belowMobile() {
    return below('37.5em')
  },
  belowDesktop() {
    return below('61.250em')
  },
  belowTablet() {
    return below('53.126em')
  },
  aboveTablet() {
    return above('53.126em')
  },
  aboveLargeDesktop() {
    return above('80.001em')
  },
  isTablet() {
    return this.aboveTablet() && this.belowDesktop()
  },
}
