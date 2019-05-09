import { views } from './utils/constants'
import Month from './Month'
import Day from './Day'
import Week from './Week'
import WorkWeek from './WorkWeek'
import SplitWeek from './SplitWeek'
import SplitWorkWeek from './SplitWorkWeek'
import Agenda from './Agenda'

const VIEWS = {
  [views.MONTH]: Month,
  [views.WEEK]: Week,
  [views.WORK_WEEK]: WorkWeek,
  [views.SPLIT_WEEK]: SplitWeek,
  [views.SPLIT_WORK_WEEK]: SplitWorkWeek,
  [views.DAY]: Day,
  [views.AGENDA]: Agenda,
}

export default VIEWS
