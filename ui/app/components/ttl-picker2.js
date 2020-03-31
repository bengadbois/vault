/**
 * @module TtlPicker2
 * TtlPicker2 components are used to enable and select TTL
 *
 * @example
 * ```js
 * <TtlPicker2 @requiredParam={requiredParam} @optionalParam={optionalParam} @param1={{param1}}/>
 * ```
 * @param {function} onChange - This function will be passed a TTL object, which includes enabled{bool}, seconds{number}, timeString{string}.
 * @param {string} [label='Time to live (TTL)'] - Label is the main label that lives next to the toggle.
 * @param {string} [helperTextDisabled='Allow tokens to be used indefinitely'] - This helper text is shown under the label when the toggle is switched off
 * @param {string} [helperTextEnabled='Disable the use of the token after'] - This helper text is shown under the label when the toggle is switched on
 * @param {number} [time=30] - This is the time (in the default units) which will be adjustable by the user of the form
 * @param {string} [unit='s'] - This is the unit key which will show by default on the form. Can be one of `s` (seconds), `m` (minutes), `h` (hours), `d` (days)
 */

import Ember from 'ember';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

const secondsMap = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
};
const convertToSeconds = (time, unit) => {
  return time * secondsMap[unit];
};
const convertFromSeconds = (seconds, unit) => {
  return seconds / secondsMap[unit];
};

export default Component.extend({
  enableTTL: false,
  label: 'Time to live (TTL)',
  helperTextDisabled: 'Allow tokens to be used indefinitely',
  helperTextEnabled: 'Disable the use of the token after',
  time: 30,
  unit: 'm',
  unitOptions: computed(function() {
    return [
      { label: 'seconds', value: 's' },
      { label: 'minutes', value: 'm' },
      { label: 'hours', value: 'h' },
      { label: 'days', value: 'd' },
    ];
  }),

  onChange: ttl => {
    console.log({ ttl });
  },

  TTL: computed('enableTTL', 'seconds', function() {
    let { time, unit, enableTTL, seconds } = this.getProperties('time', 'unit', 'enableTTL', 'seconds');
    return {
      enabled: enableTTL,
      seconds,
      timeString: time + unit,
    };
  }),

  updateTime: task(function*(newTime) {
    this.set('time', newTime);
    this.onChange(this.TTL);
    this.set('recalculateSeconds', true);
    yield timeout(5000);
    this.set('recalculateSeconds', false);
  }).restartable(),

  recalculateTime(newUnit) {
    const newTime = convertFromSeconds(this.seconds, newUnit);
    this.setProperties({
      time: newTime,
      unit: newUnit,
    });
  },

  seconds: computed('time', 'unit', function() {
    return convertToSeconds(this.time, this.unit);
  }),
  helperText: computed('enableTTL', 'helperTextUnset', 'helperTextSet', function() {
    return this.enableTTL ? this.helperTextEnabled : this.helperTextDisabled;
  }),
  errorMessage: null,
  recalculateSeconds: false,
  actions: {
    updateUnit(newUnit) {
      if (this.recalculateSeconds) {
        this.set('unit', newUnit);
      } else {
        this.recalculateTime(newUnit);
      }
      this.onChange(this.TTL);
    },
    toggleEnabled() {
      this.toggleProperty('enableTTL');
      this.onChange(this.TTL);
    },
  },
});
