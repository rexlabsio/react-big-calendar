import PropTypes from 'prop-types'
import React from 'react'
import dates from './utils/dates'
import { navigate } from './utils/constants'
import MultiCalendarGrid from './MultiCalendarGrid'

class Split extends React.Component {
  static propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
  }

  static defaultProps = MultiCalendarGrid.defaultProps

  render() {
    let { date, ...props } = this.props
    let range = Split.range(date, this.props)

    return <MultiCalendarGrid {...props} range={range} eventOffset={15} />
  }
}

Split.navigate = (date, action) => {
  switch (action) {
    case navigate.PREVIOUS:
      return dates.add(date, -1, 'day')

    case navigate.NEXT:
      return dates.add(date, 1, 'day')

    default:
      return date
  }
}

Split.range = (date, { localizer }) => {
  return [dates.startOf(date, 'day')]
}

Split.title = (date, { localizer }) => localizer.format(date, 'dayHeaderFormat')

export default Split
