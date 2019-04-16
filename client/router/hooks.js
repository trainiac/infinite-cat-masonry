import { isFunction, find, eq } from 'lodash/fp'
import { hasModule, registerModule } from 'store/modulesManager'

const RouteTransitionStatuses = {
  entering: 'entering',
  updating: 'updating',
  updated: 'updated',
  left: 'left',
}

function loadComponents(parts) {
  const promises = parts.map(part => {
    const componentPromises = Object.keys(part.components).map(componentKey => {
      const comp = part.components[componentKey]
      if (isFunction(comp)) {
        return comp().then(mod => mod.default)
      }
      return Promise.resolve(comp)
    })

    return Promise.all(componentPromises).then(components => ({
      part,
      matchedComponents: components.filter(Boolean),
    }))
  })
  return Promise.all(promises)
}

function callBeforeHooks(store, to, from, match, serverContext) {
  const promises = match.matchedComponents.map(matchedComponent => {
    if (matchedComponent.vuexModules) {
      registerVuexModules(store, matchedComponent.vuexModules)
    }

    if (matchedComponent.$beforeRouteEnter) {
      return (
        matchedComponent.$beforeRouteEnter(store, to, from, serverContext) ||
        Promise.resolve()
      )
    }
    return Promise.resolve()
  })
  return Promise.all(promises)
}

export function registerVuexModules(store, vuexModules) {
  Object.keys(vuexModules).forEach(name => {
    const vuexMod = vuexModules[name]
    if (!hasModule(store, name)) {
      registerModule(store, name, vuexMod, {
        preserveState: Boolean(store.state[name]),
      })
    }
  })
}

export function registerRouteVuexModules(store, to) {
  return loadComponents(to.matched).then(matched => {
    matched.forEach((match, index) => {
      match.matchedComponents.forEach(matchedComponent => {
        if (matchedComponent.vuexModules) {
          registerVuexModules(store, matchedComponent.vuexModules)
        }
      })
    })
  })
}

export function beforeRoute(store, to, from, serverContext) {
  return loadComponents(to.matched).then(matched => {
    return matched.reduce((promise, match, index) => {
      return promise.then(() => {
        const isEntering = !find(eq(match.part), from.matched)
        if (isEntering) {
          return callBeforeHooks(store, to, from, match, serverContext)
        }
        return Promise.resolve()
      })
    }, Promise.resolve())
  })
}

const stayedOnRoute = (matched, currentMatch) =>
  Boolean(find(part => part === currentMatch, matched))

export function confirmedRoute(store, to, from) {
  return loadComponents(to.matched).then(matched => {
    const promises = matched.map(match => {
      const confirmedPromises = match.matchedComponents.map(
        matchedComponent => {
          if (matchedComponent.routeConfirmed) {
            return (
              matchedComponent.routeConfirmed(
                store,
                to,
                from,
                stayedOnRoute(from.matched, match.part)
                  ? RouteTransitionStatuses.updating
                  : RouteTransitionStatuses.entering,
                match.part
              ) || Promise.resolve()
            )
          }
          return Promise.resolve()
        }
      )
      return Promise.all(confirmedPromises)
    })
    return Promise.all(promises)
  })
}

export function afterRoute(store, to, from) {
  loadComponents(from.matched).then(matched => {
    matched
      .slice()
      .reverse()
      .forEach(match => {
        match.matchedComponents.forEach(matchedComponent => {
          if (matchedComponent.routeChanged) {
            matchedComponent.routeChanged(
              store,
              to,
              from,
              stayedOnRoute(to.matched, match.part)
                ? RouteTransitionStatuses.updated
                : RouteTransitionStatuses.left,
              match.part
            )
          }
        })
      })
  })
}
