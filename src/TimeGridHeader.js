import PropTypes from 'prop-types'
import cn from 'classnames'
import scrollbarSize from 'dom-helpers/util/scrollbarSize'
import React from 'react'

import dates from './utils/dates'
import DateContentRow from './DateContentRow'
import Header from './Header'
import { notify } from './utils/helpers'

const empty = []

class TimeGridHeader extends React.Component {
  static propTypes = {
    range: PropTypes.array.isRequired,
    events: PropTypes.array.isRequired,
    resources: PropTypes.object,
    getNow: PropTypes.func.isRequired,
    isOverflowing: PropTypes.bool,
    dummyPadding: PropTypes.number,
    setScrollbarMargin: PropTypes.bool,

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
    onDoubleClickEvent: PropTypes.func,
    onDrillDown: PropTypes.func,
    getDrilldownView: PropTypes.func.isRequired,
    scrollRef: PropTypes.any,
    rowContentRef: PropTypes.any,
  }

  static defaultProps = {
    setScrollbarMargin: true,
  }

  handleHeaderClick = (date, view, e) => {
    e.preventDefault()
    notify(this.props.onDrillDown, [date, view])
  }

  renderHeaderCells(range, resource, id, idx) {
    let {
      localizer,
      getDrilldownView,
      getNow,
      getters: { dayProp },
      components: { header: HeaderComponent = Header },
    } = this.props

    const today = getNow()

    return range.map((date, i) => {
      let drilldownView = getDrilldownView(date)
      let label = localizer.format(date, 'dayFormat')

      const { className, style } = dayProp(date)

      let header = (
        <HeaderComponent
          index={idx}
          resource={resource}
          date={date}
          label={label}
          localizer={localizer}
        />
      )

      return (
        <div
          key={`resource_header_cell_${id || idx || i}`}
          style={style}
          className={cn(
            'rbc-header',
            className,
            dates.eq(date, today, 'day') && 'rbc-today'
          )}
        >
          {drilldownView ? (
            <a
              href="#"
              onClick={e => this.handleHeaderClick(date, drilldownView, e)}
            >
              {header}
            </a>
          ) : (
            <span>{header}</span>
          )}
        </div>
      )
    })
  }
  renderRow = resource => {
    let {
      events,
      rtl,
      selectable,
      getNow,
      range,
      getters,
      localizer,
      accessors,
      components,
      dummyPadding,
      rowContentRef,
      isOverflowing,
      setScrollbarMargin,
    } = this.props

    const resourceId = accessors.resourceId(resource)
    let eventsToDisplay = resource
      ? events.filter(event => accessors.resource(event) === resourceId)
      : events

    return (
      <DateContentRow
        isAllDay
        rtl={rtl}
        getNow={getNow}
        dummyPadding={dummyPadding}
        isOverflowing={isOverflowing}
        setScrollbarMargin={setScrollbarMargin}
        rowContentRef={rowContentRef}
        minRows={2}
        range={range}
        events={eventsToDisplay}
        resourceId={resourceId}
        className="rbc-allday-cell"
        selectable={selectable}
        selected={this.props.selected}
        components={components}
        accessors={accessors}
        getters={getters}
        localizer={localizer}
        onSelect={this.props.onSelectEvent}
        onDoubleClick={this.props.onDoubleClickEvent}
        onSelectSlot={this.props.onSelectSlot}
        longPressThreshold={this.props.longPressThreshold}
      />
    )
  }

  render() {
    let {
      width,
      rtl,
      resources,
      range,
      events,
      getNow,
      accessors,
      selectable,
      components,
      getters,
      scrollRef,
      localizer,
      isOverflowing,
      dummyPadding,
      setScrollbarMargin,
      rowContentRef,
      components: { timeGutterHeader: TimeGutterHeader },
    } = this.props

    let style = {}
    let headerStyle = {}
    if (isOverflowing) {
      style[rtl ? 'marginLeft' : 'marginRight'] = setScrollbarMargin
        ? `${scrollbarSize()}px`
        : '0px'
      headerStyle[rtl ? 'marginLeft' : 'marginRight'] = !setScrollbarMargin
        ? `${scrollbarSize()}px`
        : '0px'
    }

    const groupedEvents = resources.groupEvents(events)

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
          <div
            className="rbc-time-header-content"
            key={`resource_header_content_${id || idx}`}
          >
            {resource && (
              <div className="rbc-row rbc-row-resource">
                <div className="rbc-header">
                  {accessors.resourceTitle(resource)}
                </div>
              </div>
            )}
            <div
              style={headerStyle}
              className={`rbc-row rbc-time-header-cell${
                range.length <= 1 ? ' rbc-time-header-cell-single-day' : ''
              }`}
            >
              {this.renderHeaderCells(range, resource, id, idx)}
            </div>
            <DateContentRow
              isAllDay
              rtl={rtl}
              getNow={getNow}
              dummyPadding={dummyPadding}
              rowContentRef={rowContentRef}
              isOverflowing={isOverflowing}
              setScrollbarMargin={setScrollbarMargin}
              minRows={2}
              range={range}
              events={groupedEvents.get(id) || empty}
              resourceId={resource && id}
              className="rbc-allday-cell"
              selectable={selectable}
              selected={this.props.selected}
              components={components}
              accessors={accessors}
              getters={getters}
              localizer={localizer}
              onSelect={this.props.onSelectEvent}
              onDoubleClick={this.props.onDoubleClickEvent}
              onSelectSlot={this.props.onSelectSlot}
              longPressThreshold={this.props.longPressThreshold}
            />
          </div>
        ))}
      </div>
    )
  }
}

export default TimeGridHeader
