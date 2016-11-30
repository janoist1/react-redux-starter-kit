import { injectReducer } from '../../store/reducers'

export default (store) => ({
  path: 'async',
  /*  Async getComponent is only invoked when route matches   */
  getComponent (nextState, cb) {
    /*  Webpack - use 'require.ensure' to create a split point
        and embed an async module loader (jsonp) when bundling   */
    require.ensure([], (require) => {
      /*  Webpack - use require callback to define
          dependencies for bundling   */
      const Async = require('./containers/AsyncContainer').default
      const reducer = require('./modules/async').default

      /*  Add the reducer to the store on key 'counter'  */
      injectReducer(store, { key: 'async', reducer })

      /*  Return getComponent   */
      cb(null, Async)

    /* Webpack named bundle   */
    }, 'async')
  }
})
