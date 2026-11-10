/* A tiny event bus. Lower layers announce what happened; the screens above them listen.
   That keeps the timer from having to know about the sheets, and the sheets about the home screen.

   state:changed        saved state changed in a way the home screen shows
   player:set-done      a lifted set just ended
   player:machine-done  a cardio machine block was ended by tapping Next
   player:stopped       the timer stopped (finished, or left)
   session:finished     {entry, partial, mins, type, whoop}
   session:left         left without logging */
const subs = {};
export const on = (ev, fn) => { (subs[ev] = subs[ev] || []).push(fn); };
export const emit = (ev, data) => { (subs[ev] || []).forEach(fn => fn(data)); };
