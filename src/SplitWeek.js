import PropTypes from 'prop-types'
import React from 'react'
import dates from './utils/dates'
import { navigate } from './utils/constants'
import MultiCalendarWeekGrid from './MultiCalendarWeekGrid'

class SplitWeek extends React.Component {
  static propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
  }

  static defaultProps = MultiCalendarWeekGrid.defaultProps

  static range(date, { localizer }) {
    let firstOfWeek = localizer.startOfWeek()
    let start = dates.startOf(date, 'week', firstOfWeek)
    let end = dates.endOf(date, 'week', firstOfWeek)
  
    return dates.range(start, end)
  }

  render() {
    let { date, ...props } = this.props
    let range = SplitWeek.range(date, this.props)

    return (
      <div>
        <p>Split Week view</p>
        <MultiCalendarWeekGrid {...props} range={range} eventOffset={15} />
      </div>
    );
  }
}

SplitWeek.navigate = (date, action) => {
  switch (action) {
    case navigate.PREVIOUS:
      return dates.add(date, -1, 'week')

    case navigate.NEXT:
      return dates.add(date, 1, 'week')

    default:
      return date
  }
}

SplitWeek.title = (date, { localizer }) => {
  let [start, ...rest] = SplitWeek.range(date, { localizer })
  return localizer.format({ start, end: rest.pop() }, 'dayRangeHeaderFormat')
}

export default SplitWeek
