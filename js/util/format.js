/* 45 -> "45s", 90 -> "1:30", 120 -> "2 min" */
export function fmtSecs(s){ s=Math.round(s); if (s>=60 && s%60===0) return (s/60)+" min"; if (s>=60) return Math.floor(s/60)+":"+String(s%60).padStart(2,"0"); return s+"s"; }
/* a running clock: 75 -> "1:15", 9 -> "9" */
export const clock = s => s>=60 ? Math.floor(s/60)+":"+String(s%60).padStart(2,"0") : String(s);
