import test from 'node:test';
import assert from 'node:assert/strict';
import {afterSchoolForDay,DANCE_RIDES_2026} from '../lib/after-school.mjs';
const get=(week,dayIndex,year=2026,grade='7')=>afterSchoolForDay({grade,year,week,dayIndex});
test('dance runs every Monday and Thursday for seventh grade, not third',()=>{
 for(const i of [0,3]){assert.equal(get(44,i)?.type,'dance');assert.equal(get(44,i)?.driver,'Smilla');}
 for(const i of [1,2,4])assert.notEqual(get(44,i)?.type,'dance');
 for(const i of [0,2,3])assert.equal(get(44,i,2026,'3'),null);
});
test('dance driver mapping is exactly the user schedule for 2026',()=>{
 const expected={Nora:[37,42,46],Smilla:[39,44,48],Julie:[38,43,47],Maya:[41,45,49]};
 for(const [name,weeks] of Object.entries(expected))for(const week of weeks){
   assert.equal(get(week,0).driver,name);
   assert.equal(get(week,3).driverLabel,`Hjem til ${name}`);
 }
 assert.equal(Object.keys(DANCE_RIDES_2026).length,12);
});
test('dance shows no invented driver for week 40, 50+, or a different year',()=>{
 for (const week of [40,50,51,52,53]){
   const act=get(week,0); assert.equal(act.unknownDriver,true);assert.match(act.driverLabel,/ikke oppgitt/);
 }
 assert.equal(get(44,0,2027).driver,null);
});
test('tennis on Wednesdays alternates Maya in even and Julie in odd weeks',()=>{
 for (const week of [38,44,46,50,52]){const act=get(week,2);assert.equal(act.type,'tennis');assert.equal(act.driver,'Maya');assert.match(act.detail,/partallsuker/);}
 for (const week of [37,39,43,45,49,51]){const act=get(week,2);assert.equal(act.driver,'Julie');assert.match(act.detail,/oddetallsuker/);}
 assert.equal(get(44,2,2027).driver,'Maya');
});
test('after school hides on Tuesday and Friday; invalid input has no events',()=>{
 for(const i of [1,4])assert.equal(get(44,i),null);
 assert.equal(get(0,1),null);assert.equal(get(55,1),null);
 assert.equal(get(44,8),null);
});

// Regression for the corrected swap: previous week 43 was Julie; current week 44 is Smilla.
test('corrected Julie and Smilla week swap shows correct pickup on both dance days',()=>{
 for(const [week,person] of [[38,'Julie'],[39,'Smilla'],[43,'Julie'],[44,'Smilla'],[47,'Julie'],[48,'Smilla']]){
  for(const dayIndex of [0,3]){
   const a=get(week,dayIndex);
   assert.equal(a.driver,person);
   assert.equal(a.driverLabel,`Hjem til ${person}`);
   assert.match(a.detail,new RegExp(person));
  }
 }
 assert.equal(get(44,2).driver,'Maya'); // Wednesday tennis unchanged
});

// Regression: no dance on Tuesday; Monday and Thursday both have correct weekday labels.
test('week 44 shows dance on Monday and Thursday, tennis Wednesday, and no activity Tuesday',()=>{
 assert.equal(get(44,0).weekday,'Mandag');
 assert.equal(get(44,0).driverLabel,'Hjem til Smilla');
 assert.equal(get(44,1),null);
 assert.equal(get(44,2).title,'Tennis');
 assert.equal(get(44,2).driver,'Maya');
 assert.equal(get(44,3).weekday,'Torsdag');
 assert.equal(get(44,3).driverLabel,'Hjem til Smilla');
 assert.equal(get(44,4),null);
});
