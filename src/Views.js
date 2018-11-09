import { views } from './utils/constants'
import Month from './Month'
import Day from './Day'
import Week from './Week'
import WorkWeek from './WorkWeek'
import Agenda from './Agenda'
import SplitDay from './SplitDay'
import SplitWeek from './SplitWeek'

const VIEWS = {
  [views.MONTH]: Month,
  [views.WEEK]: Week,
  [views.WORK_WEEK]: WorkWeek,
  [views.DAY]: Day,
  [views.AGENDA]: Agenda,
  [views.SPLIT_DAY]: SplitDay,
  [views.SPLIT_WEEK]: SplitWeek
}

export default VIEWS
