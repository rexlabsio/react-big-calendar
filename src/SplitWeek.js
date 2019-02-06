import PropTypes from 'prop-types'
import React from 'react'
import { findDOMNode } from 'react-dom'
import cn from 'classnames'
import memoize from 'memoize-one'
import getPosition from 'dom-helpers/query/position'
import raf from 'dom-helpers/util/requestAnimationFrame'

import dates from './utils/dates'
import Resources from './utils/Resources'
import { views, navigate } from './utils/constants'
import { notify } from './utils/helpers'

import Popup from './Popup'
import Overlay from 'react-overlays/lib/Overlay'
import DateContentRow from './DateContentRow'
import Header from './Header'

import { inRange, sortEvents } from './utils/eventLevels'

let propTypes = {
  events: PropTypes.array.isRequired,
  date: PropTypes.instanceOf(Date),

  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),

  step: PropTypes.number,
  getNow: PropTypes.func.isRequired,

  scrollToTime: PropTypes.instanceOf(Date),
  rtl: PropTypes.bool,
  width: PropTypes.number,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,

  resources: PropTypes.arrayOf(PropTypes.object),
  isOverflowing: PropTypes.bool,
  setScrollbarMargin: PropTypes.bool,
  rowContentRef: PropTypes.any,
  showMultiDayTimes: PropTypes.bool,

  onNavigate: PropTypes.func,
  onSelectSlot: PropTypes.func,
  onSelectEvent: PropTypes.func,
  onDoubleClickEvent: PropTypes.func,
  onShowMore: PropTypes.func,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired,

  popup: PropTypes.bool,

  popupOffset: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
  ]),
}

class SplitWeek extends React.Component {
  static displayName = 'SplitWeek'
  static propTypes = propTypes

  static range = (date, { localizer }) => {
    let firstOfWeek = localizer.startOfWeek()
    let start = dates.startOf(date, 'week', firstOfWeek)
    let end = dates.endOf(date, 'week', firstOfWeek)

    return dates.range(start, end)
  }

  static navigate = (date, action) => {
    switch (action) {
      case navigate.PREVIOUS:
        return dates.add(date, -1, 'week')

      case navigate.NEXT:
        return dates.add(date, 1, 'week')

      default:
        return date
    }
  }

  static title = (date, { localizer }) => {
    let [start, ...rest] = SplitWeek.range(date, { localizer })
    return localizer.format({ start, end: rest.pop() }, 'dayRangeHeaderFormat')
  }

  constructor(...args) {
    super(...args)

    this._bgRows = []
    this._pendingSelection = []
    this.state = {
      rowLimit: 5,
      needLimitMeasure: true,
    }
  }

  componentWillReceiveProps({ date }) {
    this.setState({
      needLimitMeasure: !dates.eq(date, this.props.date),
    })
  }

  componentDidMount() {
    let running

    if (this.state.needLimitMeasure) this.measureRowLimit(this.props)

    window.addEventListener(
      'resize',
      (this._resizeListener = () => {
        if (!running) {
          raf(() => {
            running = false
            this.setState({ needLimitMeasure: true }) //eslint-disable-line
          })
        }
      }),
      false
    )
  }

  componentDidUpdate() {
    if (this.state.needLimitMeasure) this.measureRowLimit(this.props)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resizeListener, false)
  }

  getContainer = () => {
    return findDOMNode(this)
  }

  getResources = memoize((resources, accessors) =>
    Resources(resources, accessors)
  )

  render() {
    let {
      date,
      events,
      className,
      resources,
      accessors,
      showMultiDayTimes,
    } = this.props

    const range = SplitWeek.range(date, this.props)

    const start = range[0]
    const end = range[range.length - 1]

    const allDayEvents = []
    const rangeEvents = []

    const computedResources = this.getResources(resources, accessors)

    events.forEach(event => {
      if (inRange(event, start, end, accessors)) {
        const eStart = accessors.start(event)
        const eEnd = accessors.end(event)

        if (
          accessors.allDay(event) ||
          (dates.isJustDate(eStart) && dates.isJustDate(eEnd)) ||
          (!showMultiDayTimes && !dates.eq(eStart, eEnd, 'day'))
        ) {
          allDayEvents.push(event)
        } else {
          rangeEvents.push(event)
        }
      }
    })

    allDayEvents.sort((a, b) => sortEvents(a, b, accessors))

    const groupedEvents = computedResources.groupEvents([
      ...allDayEvents,
      ...rangeEvents,
    ])

    return (
      <div className={cn('rbc-month-view', 'rbc-split-week-view', className)}>
        <div className="rbc-row rbc-month-header rbc-split-week-header">
          <div className="rbc-split-week-header-gutter" />
          {this.renderHeaderCells(range)}
        </div>
        <div className="rbc-split-week-content">
          {computedResources.map(([id, resource], i) =>
            this.renderWeek(groupedEvents.get(id) || [], i, id, resource)
          )}
        </div>
        {this.props.popup && this.renderOverlay()}
      </div>
    )
  }

  renderWeek = (events, resourceIndex, resourceId, resource) => {
    const { needLimitMeasure, rowLimit } = this.state
    let {
      components,
      selectable,
      getNow,
      selected,
      date,
      localizer,
      longPressThreshold,
      accessors,
      getters,
      isOverflowing,
      setScrollbarMargin,
      rowContentRef,
    } = this.props

    const { gutterCellContent: GutterCellContent = 'div' } = components

    const range = SplitWeek.range(date, this.props)

    const sortedEvents = events
      .slice()
      .sort((a, b) => sortEvents(a, b, accessors))

    return (
      <div className="rbc-split-week-row">
        <div className="rbc-split-week-gutter">
          <GutterCellContent resource={resource} />
        </div>
        <DateContentRow
          splitWeekView
          key={resourceIndex}
          ref={resourceIndex === 0 ? 'slotRow' : undefined}
          rowContentRef={rowContentRef}
          isOverflowing={isOverflowing}
          setScrollbarMargin={setScrollbarMargin}
          container={this.getContainer}
          className="rbc-month-row rbc-split-week-content-row"
          getNow={getNow}
          date={date}
          range={range}
          events={sortedEvents}
          maxRows={rowLimit}
          selected={selected}
          selectable={selectable}
          components={components}
          accessors={accessors}
          getters={getters}
          localizer={localizer}
          renderForMeasure={needLimitMeasure}
          onShowMore={this.handleShowMore}
          onSelect={this.handleSelectEvent}
          onDoubleClick={this.handleDoubleClickEvent}
          onSelectSlot={e => {
            this.handleSelectSlot(e, { resource: resourceId })
          }}
          longPressThreshold={longPressThreshold}
          rtl={this.props.rtl}
        />
      </div>
    )
  }

  handleHeaderClick = (date, view, e) => {
    e.preventDefault()
    notify(this.props.onDrillDown, [date, view])
  }

  renderHeaderCells(range) {
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
        <HeaderComponent date={date} label={label} localizer={localizer} />
      )

      return (
        <div
          key={`header_cell_${i}`}
          style={style}
          className={cn(
            'rbc-header',
            'rbc-split-week-header-cell',
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

  renderOverlay() {
    let overlay = (this.state && this.state.overlay) || {}
    let { accessors, localizer, components, getters, selected } = this.props

    return (
      <Overlay
        rootClose
        placement="bottom"
        container={this}
        show={!!overlay.position}
        onHide={() => this.setState({ overlay: null })}
      >
        <Popup
          accessors={accessors}
          getters={getters}
          selected={selected}
          components={components}
          localizer={localizer}
          position={overlay.position}
          events={overlay.events}
          slotStart={overlay.date}
          slotEnd={overlay.end}
          onSelect={this.handleSelectEvent}
          onDoubleClick={this.handleDoubleClickEvent}
        />
      </Overlay>
    )
  }

  measureRowLimit() {
    this.setState({
      needLimitMeasure: false,
      rowLimit: this.refs.slotRow.getRowLimit(),
    })
  }

  handleSelectSlot = (range, slotInfo) => {
    this._pendingSelection = this._pendingSelection.concat(range)

    clearTimeout(this._selectTimer)
    this._selectTimer = setTimeout(() => this.selectDates(slotInfo))
  }

  handleHeadingClick = (date, view, e) => {
    e.preventDefault()
    this.clearSelection()
    notify(this.props.onDrillDown, [date, view])
  }

  handleSelectEvent = (...args) => {
    this.clearSelection()
    notify(this.props.onSelectEvent, args)
  }

  handleDoubleClickEvent = (...args) => {
    this.clearSelection()
    notify(this.props.onDoubleClickEvent, args)
  }

  handleShowMore = (events, date, cell, slot) => {
    const { popup, onDrillDown, onShowMore, getDrilldownView } = this.props
    // cancel any pending selections so only the event click goes through.
    this.clearSelection()

    if (popup) {
      let position = getPosition(cell, findDOMNode(this))

      this.setState({
        overlay: { date, events, position },
      })
    } else {
      notify(onDrillDown, [date, getDrilldownView(date) || views.DAY])
    }

    notify(onShowMore, [events, date, slot])
  }

  selectDates(slotInfo) {
    let slots = this._pendingSelection.slice()

    this._pendingSelection = []

    slots.sort((a, b) => +a - +b)

    notify(this.props.onSelectSlot, {
      slots,
      resourceId: slotInfo.resource,
      start: slots[0],
      end: slots[slots.length - 1],
      action: slotInfo.action,
    })
  }

  clearSelection() {
    clearTimeout(this._selectTimer)
    this._pendingSelection = []
  }
}

export default SplitWeek
