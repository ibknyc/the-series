export function csv(rows, cols){
  const esc=v=>{ v = v===undefined||v===null ? "" : String(v); return /[",\n\r]/.test(v) ? `"${v.replace(/"/g,'""')}"` : v; };
  return [cols.join(","), ...rows.map(r=>cols.map(c=>esc(r[c])).join(","))].join("\r\n")+"\r\n";
}
