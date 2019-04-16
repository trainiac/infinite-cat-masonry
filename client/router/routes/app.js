export default [
  {
    path: '/home',
    name: 'home',
    component: () =>
      import(/* webpackChunkName: "route-home-page" */ 'components/HomePage'),
  },
]
