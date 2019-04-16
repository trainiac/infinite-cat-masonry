import Vue from 'vue'
import { merge, get } from 'lodash/fp'

export function vueSet(state, key, value) {
  if (state[key]) {
    state[key] = value
  } else {
    Vue.$set(state, key, value)
  }
}

export function vueReset(state, newState) {
  for (const key in newState) {
    Vue.set(state, key, newState[key])
  }
}

export function vueUpdate(state, key, update) {
  const current = state[key]
  if (!(key in state)) {
    Vue.set(state, key, update)
  } else {
    state[key] = {
      ...current,
      ...update,
    }
  }
}

export function vueMerge(state, key, update) {
  const current = state[key]
  if (!(key in state)) {
    Vue.set(state, key, update)
  } else {
    const merged = merge(current, update)
    state[key] = merged
  }
}

export function vueGetEl(component) {
  return component.$el || component.elm || component
}

export function vueGetName(component) {
  return (
    get('$options.name', component) || get('$options._componentTag', component)
  )
}
