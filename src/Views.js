import { views } from './utils/constants'
import Month from './Month'
import Day from './Day'
import Week from './Week'
import Split from './Split'
import WorkWeek from './WorkWeek'
import Agenda from './Agenda'

const VIEWS = {
  [views.MONTH]: Month,
  [views.WEEK]: Week,
  [views.WORK_WEEK]: WorkWeek,
  [views.DAY]: Day,
  [views.AGENDA]: Agenda,
  [views.SPLIT]: Split,
}

export default VIEWS
