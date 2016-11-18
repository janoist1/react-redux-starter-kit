import React from 'react'
import Helmet from 'react-helmet'
import { resolve } from 'react-resolver'

@resolve('fetchedData', function(props) {
  const { fetchData } = props

  return fetchData().then(action => action.payload)
})
export class Async extends React.Component {
  render() {
    const { fetchedData } = this.props

    return (
      <div>
        <Helmet title='Async' />

        { JSON.stringify(fetchedData) }
      </div>
    )
  }
}

Async.propTypes = {
  fetchData: React.PropTypes.func.isRequired
}

export default Async
