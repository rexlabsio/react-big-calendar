import PropTypes from 'prop-types'
import invariant from 'invariant'
import memoize from 'memoize-one'

const localePropType = PropTypes.oneOfType([PropTypes.string, PropTypes.func])

function _format(localizer, formatter, value, format, culture) {
  let result =
    typeof format === 'function'
      ? format(value, culture, localizer)
      : formatter.call(localizer, value, format, culture)

  invariant(
    result == null || typeof result === 'string',
    '`localizer format(..)` must return a string, null, or undefined'
  )

  return result
}

export class DateLocalizer {
  constructor(spec) {
    invariant(
      typeof spec.format === 'function',
      'date localizer `format(..)` must be a function'
    )
    invariant(
      typeof spec.firstOfWeek === 'function',
      'date localizer `firstOfWeek(..)` must be a function'
    )

    this.propType = spec.propType || localePropType

    this.startOfWeek = spec.firstOfWeek
    this.formats = spec.formats
    this.format = (...args) => _format(this, spec.format, ...args)
  }
}

const startOfWeek = memoize((localizer, culture) => () =>
  localizer.startOfWeek(culture)
)
const format = memoize((localizer, culture, formats) => (value, format) =>
  localizer.format(value, formats[format] || format, culture)
)
const getFormats = memoize((formats, formatOverrides) => ({
  ...formats,
  ...formatOverrides,
}))

export function mergeWithDefaults(
  localizer,
  culture,
  formatOverrides,
  messages
) {
  return {
    ...localizer,
    messages,
    startOfWeek: startOfWeek(localizer, culture),
    format: format(
      localizer,
      culture,
      getFormats(localizer.formats, formatOverrides)
    ),
  }
}
