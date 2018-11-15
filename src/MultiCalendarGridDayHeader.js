import PropTypes from 'prop-types'
import cn from 'classnames'
import scrollbarSize from 'dom-helpers/util/scrollbarSize'
import React from 'react'

import DateContentRow from './DateContentRow'
import Header from './Header'
import { notify } from './utils/helpers'

class TimeGridHeader extends React.Component {
  static propTypes = {
    range: PropTypes.array.isRequired,
    events: PropTypes.array.isRequired,
    calendars: PropTypes.array.isRequired,
    resources: PropTypes.object,
    getNow: PropTypes.func.isRequired,
    isOverflowing: PropTypes.bool,

    rtl: PropTypes.bool,
    width: PropTypes.number,

    localizer: PropTypes.object.isRequired,
    accessors: PropTypes.object.isRequired,
    components: PropTypes.object.isRequired,
    getters: PropTypes.object.isRequired,

    selected: PropTypes.object,
    selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
    longPressThreshold: PropTypes.number,

    onSelectSlot: PropTypes.func,
    onSelectEvent: PropTypes.func,
    onCellClick: PropTypes.func,
    onDoubleClickEvent: PropTypes.func,
    onDrillDown: PropTypes.func,
    getDrilldownView: PropTypes.func.isRequired,
    scrollRef: PropTypes.any,
  }

  handleHeaderClick = (date, view, e) => {
    e.preventDefault()
    notify(this.props.onDrillDown, [date, view])
  }

  renderHeaderCells(id, resource) {
    let {
      rtl,
      range,
      events,
      calendars,
      getNow,
      accessors,
      resources,
      selectable,
      components,
      getters,
      localizer,
      components: { header: HeaderComponent = Header },
    } = this.props

    return calendars.map(calendar => {
      const header = HeaderComponent ? (
        <HeaderComponent label={calendar.name} />
      ) : (
        <p>{calendar.name}</p>
      )

      const calendarEvents = events.filter(
        event => event.calendarId === calendar.id
      )
      const groupedEvents = resources.groupEvents(calendarEvents)

      return (
        <div key={calendar.id} className={cn('rbc-header')}>
          {header}
          <DateContentRow
            isAllDay
            rtl={rtl}
            getNow={getNow}
            minRows={2}
            range={range}
            events={groupedEvents.get(id) || []}
            resourceId={resource && id}
            className="rbc-allday-cell rbc-allday-split-cell"
            selectable={selectable}
            selected={this.props.selected}
            components={components}
            accessors={accessors}
            getters={getters}
            localizer={localizer}
            onSelect={this.props.onSelectEvent}
            onDoubleClick={this.props.onDoubleClickEvent}
            onSelectSlot={this.props.onSelectSlot}
            onCellClick={this.props.onCellClick}
            longPressThreshold={this.props.longPressThreshold}
          />
        </div>
      )
    })
  }

  render() {
    let {
      width,
      rtl,
      resources,
      accessors,
      scrollRef,
      isOverflowing,
      components: { timeGutterHeader: TimeGutterHeader },
    } = this.props

    let style = {}
    if (isOverflowing) {
      style[rtl ? 'marginLeft' : 'marginRight'] = `${scrollbarSize()}px`
    }

    return (
      <div
        style={style}
        ref={scrollRef}
        className={cn('rbc-time-header', isOverflowing && 'rbc-overflowing')}
      >
        <div
          className="rbc-label rbc-time-header-gutter"
          style={{ width, minWidth: width, maxWidth: width }}
        >
          {TimeGutterHeader && <TimeGutterHeader />}
        </div>

        {resources.map(([id, resource], idx) => (
          <div className="rbc-time-header-content" key={id || idx}>
            {resource && (
              <div className="rbc-row rbc-row-resource">
                <div key={`resource_${idx}`} className="rbc-header">
                  {accessors.resourceTitle(resource)}
                </div>
              </div>
            )}
            <div className="rbc-row rbc-time-header-cell">
              {this.renderHeaderCells(id, resource)}
            </div>
          </div>
        ))}
      </div>
    )
  }
}

export default TimeGridHeader
