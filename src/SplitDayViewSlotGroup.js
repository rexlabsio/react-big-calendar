import cn from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import BackgroundWrapper from './BackgroundWrapper'

export default class SplitDayViewSlotGroup extends Component {
  static propTypes = {
    renderSlot: PropTypes.func,
    group: PropTypes.array.isRequired,
    resource: PropTypes.any,
    components: PropTypes.object,
    getters: PropTypes.object,
  }

  render() {
    const {
      renderSlot,
      resource,
      group,
      getters,
      onCellClick,
      components: { timeSlotWrapper: Wrapper = BackgroundWrapper } = {},
    } = this.props

    return (
      <div className="rbc-timeslot-group">
        {group.map((value, idx) => {
          const slotProps = getters ? getters.slotProp(value) : {}
          return (
            <Wrapper key={idx} value={value} resource={resource}>
              <div
                {...slotProps}
                className={cn('rbc-time-slot', slotProps.className)}
                onClick={e => onCellClick(value, e)}
              >
                {renderSlot && renderSlot(value, idx)}
              </div>
            </Wrapper>
          )
        })}
      </div>
    )
  }
}
