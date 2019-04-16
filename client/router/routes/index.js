// TODO add home route and add back not found
import RouterViewPlaceholder from 'components/RouterViewPlaceholder'
import appRoutes from './app'

const routes = [...appRoutes].concat([
  {
    path: '*',
    component: RouterViewPlaceholder,
    meta: {
      notFound: true,
    },
  },
])

export default routes
