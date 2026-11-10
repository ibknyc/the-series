/* dates and clock times, always local */
export const dkey = d => d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
export const today = () => dkey(new Date());
export const daysAgo = n => dkey(new Date(Date.now()-n*864e5));
export const daysSince = date => Math.round((Date.now()-new Date(date))/864e5);
export const TZ = (()=>{ try{ return Intl.DateTimeFormat().resolvedOptions().timeZone||""; }catch(e){ return ""; } })();
export const hhmm = d => String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
export const hhmmss = d => hhmm(d)+":"+String(d.getSeconds()).padStart(2,"0");
