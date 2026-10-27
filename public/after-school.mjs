/** Family-provided after-school timetable, independent of the school's published PDFs. */
export const DANCE_RIDES_2026=Object.freeze({
  37:'Nora', 38:'Julie', 39:'Smilla',
  41:'Maya', 42:'Nora', 43:'Julie', 44:'Smilla', 45:'Maya',
  46:'Nora', 47:'Julie', 48:'Smilla', 49:'Maya'
});
/** dayIndex: Monday=0 .. Friday=4. ISO week is supplied by the UI. */
export function afterSchoolForDay({grade,year,week,dayIndex}) {
  if (String(grade)!=='7' || !Number.isInteger(week) || week<1 || week>53 || !Number.isInteger(dayIndex) || dayIndex<0 || dayIndex>4) return null;
  if(dayIndex===0 || dayIndex===3) {
    const driver=year===2026?DANCE_RIDES_2026[week]||null:null;
    return {
      type:'dance', title:'Hip-hop dans', emoji:'💃',
      weekday:dayIndex===0?'Mandag':'Torsdag', driver,
      driverLabel:driver?`Hjem til ${driver}`:'Kjøreplan ikke oppgitt',
      detail:driver?`Jentene skal hjem til ${driver} for kjøring.`:`Det er ikke oppgitt hvem jentene skal hjem til for kjøring i uke ${week}.`,
      week, year, unknownDriver:!driver
    };
  }
  if(dayIndex===2) {
    const driver=week%2===0?'Maya':'Julie';
    return {
      type:'tennis',title:'Tennis',emoji:'🎾',weekday:'Onsdag',driver,
      driverLabel:`${driver} kjører`,
      detail:week%2===0?'Maya kjører i partallsuker.':'Julie kjører i oddetallsuker.',
      week,year,unknownDriver:false
    };
  }
  return null;
}
