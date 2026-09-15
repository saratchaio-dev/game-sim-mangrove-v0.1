/** End-day cliffhanger snapshot — UI-only; never persisted. */
import { EVENTS } from './game-data.js'
import { forecastFor, contractProgress } from './restoration.js'
import { maliSpeechForTomorrowWait } from './character-speech.js'

/**
 * Plain object describing tomorrow from the current day's perspective.
 * @returns {{ tomorrowLabel: string, contractDaysLeft: number|null, hasContract: boolean, maliTip: string|null }}
 */
export function cliffhangerFor(game) {
  const tomorrow = game.day + 1
  const fromToday = forecastFor(game.day)
  const tomorrowForecast = forecastFor(tomorrow)
  const event = EVENTS.find((e) => e.id === fromToday.eventId)
  const tomorrowLabel = fromToday.eventDay === tomorrow
    ? (event?.title || fromToday.eventId)
    : tomorrowForecast.tide

  const progress = contractProgress(game)
  const hasContract = Boolean(progress)
  const contractDaysLeft = hasContract ? progress.daysLeft : null
  const maliTip = hasContract ? null : maliSpeechForTomorrowWait()

  return { tomorrowLabel, contractDaysLeft, hasContract, maliTip }
}
