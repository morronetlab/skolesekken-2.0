import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {themePresentation, themeProgressKey} from '../public/theme.mjs';
import {afterSchoolForDay} from '../public/after-school.mjs';
import {fetchJsonWithTimeout as loadJson} from '../public/network.mjs';
import {norwayCalendar, isExpiredSchoolDay, hasCalendarDateChanged, hourlyRefreshDue, REFRESH_INTERVAL_MS} from '../public/calendar.mjs';

// Smoke-test the actual frontend script with a small DOM adapter and mocked APIs.
// Full responsive layout still needs verification in a real browser after deploy.
test('3.0 app starts, fetches two grades and displays live API data rather than seed data', async () => {
  class MockElement {
    constructor(dataset = {}) {
      this.dataset = dataset; this.innerHTML = ''; this.textContent = ''; this.href = '';
      this.style = {}; this.open = false; this.disabled = false; this.attrs = {};
      this.handlers = {};
      this.classList = {toggle() {},add() {},remove() {}};
    }
    setAttribute(name, value) { this.attrs[name] = value; }
    addEventListener(name, fn) { this.handlers[name] = fn; }
    querySelectorAll() { return []; }
  }
  const nodes = new Map();
  const get = id => nodes.get(id) || (nodes.set(id, new MockElement()),nodes.get(id));
  const buttons = ['both','3','7'].map(mode=>new MockElement({mode}));
  const logo = new MockElement();
  const document = {
    body: {dataset: {}}, visibilityState:'visible',
    getElementById:get,
    querySelectorAll: selector => selector === '[data-mode]' ? buttons : [],
    querySelector: selector => selector === '.logo' ? logo : null,
    addEventListener(){}
  };
  const local = new Map();
  const localStorage = {getItem: k => local.get(k)??null, setItem:(k,v)=>local.set(k,v)};
  const yearWeek = norwayCalendar();
  const fixture = grade=>({
    grade,year:yearWeek.year,week:yearWeek.week,status:'ok',
    group:grade==='3'?{key:'rød'}:undefined,
    days:{[ ['Mandag','Tirsdag','Onsdag','Torsdag','Fredag'][yearWeek.day] ]:{end:'14:00', events:[{title:'Testaktivitet fra API',icon:'book',time:'09:00'}],bring:[{label:'Drikkeflaske'}]}},
    everyday:[],homework:[{subject:'Norsk',detail:'Les til fredag'},{subject:'Engelsk',detail:'Read together'}],
    notices:[],weekTheme:'Vennskap'
  });
  const calls=[];
  const fetch = async url => {
    calls.push(url);
    const data = url.startsWith('/api/weather') ? {days:{}} : fixture(url.includes('grade=7')?'7':'3');
    return {ok:true, json:async()=>data};
  };
  const raw=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
  const body=raw.replace(/^import [^\n]*\n/gm, '');
  const fn=new Function('themePresentation','themeProgressKey','afterSchoolForDay','norwayCalendar',
    'isExpiredSchoolDay','hasCalendarDateChanged','hourlyRefreshDue','REFRESH_INTERVAL_MS','fetchJsonWithTimeout',
    'document','window','localStorage','history','location','fetch','setInterval',body);
  const win={addEventListener(){}};
  fn(themePresentation,themeProgressKey,afterSchoolForDay,norwayCalendar,isExpiredSchoolDay,
    hasCalendarDateChanged,hourlyRefreshDue,REFRESH_INTERVAL_MS,
    (url,opts)=>loadJson(url,{...opts,fetchImpl:fetch}),document,win,localStorage,
    {replaceState(){}},{search:'',pathname:'/',reload(){}},fetch,()=>0);
  await new Promise(resolve=>setTimeout(resolve,5));
  assert.ok(calls.some(s=>s.includes('grade=3')));
  assert.ok(calls.some(s=>s.includes('grade=7')));
  assert.ok(calls.some(s=>s.startsWith('/api/weather')));
  assert.match(get('family-cards').innerHTML,/Testaktivitet fra API/);
  assert.doesNotMatch(get('family-cards').innerHTML,/Solidaritet · Jeg bryr meg/);
  buttons[2].handlers.click();
  assert.match(get('day-program').innerHTML,/Testaktivitet fra API/);
  assert.match(get('homework-section').innerHTML,/Engelsk/);
  assert.match(get('theme-section').innerHTML,/Vennskap/);
});
