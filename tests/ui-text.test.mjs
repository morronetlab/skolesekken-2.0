import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../public/style.css',import.meta.url),'utf8');

test('unnecessary group info messages were removed without hiding real alerts',()=>{
 for(const fragment of ['kun gruppens egne tider', '3. klasse er tilpasset rød gruppe.', 'Oppdateres automatisk fra Fagerholt skoles publiserte ukeplan.']){
   assert.equal(html.includes(fragment)||js.includes(fragment),false,fragment);
 }
 assert.match(js,/result.status === 'unpublished'/);
 assert.match(js,/grade !== '3' \|\| data.group\?\.key === 'rød'/);
 assert.match(js,/status === 'cached'/);
 assert.match(html,/id="warnings"/);
});

test('Morgenklar production UI includes family, children, week dates, weather, packs and no demo seed',()=>{
 assert.match(html,/data-mode="both"/);
 for(const id of ['family-view','family-cards','detail-view','bag-section','day-program','homework-section','theme-section','notices-details','weather-number','weekdays','week-number']){
   assert.ok(html.includes(`id="${id}"`),id);
 }
 assert.match(html, /type="module" src="\/app.js"/);
 assert.doesNotMatch(html,/id="data"|id="seed"|Designprototype/);
 assert.match(js,/await Promise\.all\(\[loadGrade\('3', fresh\), loadGrade\('7', fresh\), loadWeather\(fresh\)\]\)/);
 assert.match(js,/skolesekken\.pack\.v6/);
 assert.match(js,/afterSchoolForDay/);
 assert.match(js,/isExpiredSchoolDay/);
 assert.match(js,/hasCalendarDateChanged/);
 assert.match(css,/max-width:700px/);
});
