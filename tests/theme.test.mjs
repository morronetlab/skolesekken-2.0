import test from 'node:test';
import assert from 'node:assert/strict';
import {extractTheme,analyzePdfPages} from '../lib/plan-core.mjs';
import {themePresentation,themeProgressKey} from '../public/theme.mjs';
const mk=(lines)=>[{width:595,height:840,items:lines.map((s,i)=>({text:s,x:40,y:20+i*23,width:450}))}];

test('extracts explicit weekly theme, ignores other subjects and dates',()=>{
 assert.equal(extractTheme(mk(['Ukeplan uke 44', 'Tema: Vennskap', 'Mandag 08.30-14.00'])), 'Vennskap');
 assert.equal(extractTheme(mk(['Ukas tema:', 'Vennskap og inkludering', 'Onsdag'])), 'Vennskap og inkludering');
 assert.equal(extractTheme(mk(['Ukens fokus: Respekt', 'Torsdag'])), 'Respekt');
 assert.equal(extractTheme(mk(['Periode: Solidaritet', 'Sosialt mål: Jeg bryr meg'])), 'Solidaritet · Jeg bryr meg');
 assert.equal(extractTheme(mk(['Tema: Matematikk', 'Sosialt mål: Alle har en stemme'])), 'Matematikk · Alle har en stemme');
});
test('does not manufacture themes or treat a social target as the theme itself',()=>{
 assert.equal(extractTheme(mk(['Ukens lekser: Norsk','Mandag: Svømming','Matematikk: Vi øver på klokka'])), '');
 assert.equal(extractTheme(mk(['Sosialt mål: Jeg bryr meg','Lekser: Norsk'])), '');
 assert.equal(extractTheme(mk(['Tema: Les mer her SVG','Ukeplan uke 45'])), '');
 assert.equal(extractTheme(mk(['Tema: 08:30–10:00 svømming'])), '');
});
test('weekTheme passes through to correct grade plan, not earlier week',()=>{
 const p=analyzePdfPages(mk(['Ukas tema: Solidaritet','Mandag','Tirsdag','Onsdag','Torsdag','Fredag']), '7','https://www.minskole.no/plan.pdf',44,2026);
 assert.equal(p.week,44);
 assert.equal(p.weekTheme,'Solidaritet');
});
test('theme UI challenge suggestions are independent from school PDF text',()=>{
 assert.equal(themePresentation('Solidaritet · Jeg bryr meg').emoji,'💛');
 assert.match(themePresentation('Solidaritet · Alle har en stemme').quest,/lytt/i);
 assert.equal(themePresentation(''),null);
 const unknown=themePresentation('Matematikkens mysterier');
 assert.equal(unknown.theme,'Matematikkens mysterier');
 assert.match(unknown.quest,/Hva betyr «Matematikkens mysterier»/);
});
test('check-offs are isolated by grade, week, year and actual theme',()=>{
 const a=themeProgressKey(2026,44,'3','Solidaritet');
 assert.notEqual(a,themeProgressKey(2026,45,'3','Solidaritet'));
 assert.notEqual(a,themeProgressKey(2026,44,'7','Solidaritet'));
 assert.notEqual(a,themeProgressKey(2026,44,'3','Vennskap'));
 assert.notEqual(a,themeProgressKey(2027,44,'3','Solidaritet'));
});
test('3.0 theme UI shows only a theme found in the fetched PDF',async()=>{
 const {readFileSync}=await import('node:fs');
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(html,/id="theme-section"/);
 assert.match(js,/themePresentation\(raw\)/);
 assert.match(js,/classList\.add\('theme-hidden'\)/);
 assert.match(js,/themeProgressKey\(start.year, start.week, grade, presentation.theme\)/);
 assert.match(js,/Frivillig forslag fra Skolesekken/);
});
