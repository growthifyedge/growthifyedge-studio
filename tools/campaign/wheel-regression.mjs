import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT = 9333;
const URL = 'http://localhost:4273/';
const SHOT = process.argv[2] || 'cube-final.png';
const profile = mkdtempSync(join(tmpdir(), 'cube-wheel-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--headless=new', '--window-size=1280,800',
  '--no-first-run', '--no-default-browser-check', '--disable-gpu-vsync', 'about:blank'
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 50; i++) { try { await fetch(`http://localhost:${PORT}/json/version`); break; } catch { await sleep(200); } }
const target = await (await fetch(`http://localhost:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => { const res = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (res.result.exceptionDetails) throw new Error(JSON.stringify(res.result.exceptionDetails)); return res.result.result.value; };

await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: URL });
for (let i = 0; i < 100; i++) { if (await evaluate("!!document.querySelector('.campaign-cube') && !!document.querySelector('.cube-control')")) break; await sleep(250); }
// The shell auto-opens the project-inquiry modal ~2.5s after load; wait for it, then dismiss it so it cannot cover the cube.
let modalSeen = false;
for (let i = 0; i < 24; i++) { if (await evaluate("!!document.querySelector('[role=dialog]')")) { modalSeen = true; break; } await sleep(250); }
if (modalSeen) {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await sleep(400);
  if (await evaluate("!!document.querySelector('[role=dialog]')")) {
    const b = await evaluate("(()=>{const r=document.querySelector('[aria-label=\"Close project inquiry form\"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()");
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: b.x, y: b.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: b.x, y: b.y, button: 'left', clickCount: 1 });
    await sleep(400);
  }
}
console.log('modal auto-opened:', modalSeen, '| modal still open:', await evaluate("!!document.querySelector('[role=dialog]')"));
await sleep(500);
const vp = await evaluate('({vw:innerWidth,vh:innerHeight,scrollY:window.scrollY})');
console.log('viewport', vp);
console.log('raf', await evaluate(`(()=>{const t0=performance.now();return Promise.race([new Promise(r=>requestAnimationFrame(()=>r('fired after '+Math.round(performance.now()-t0)+'ms'))),new Promise(r=>setTimeout(()=>r('NOT firing'),1500))]);})()`));

// Recorder: logs every cube angle change; report summarises trajectory since the previous read.
await evaluate(`(()=>{window.__log=[]; const cube=document.querySelector('.campaign-cube'); const push=()=>{const d=parseFloat(cube.style.getPropertyValue('--cube-rotation'))||0; const L=window.__log; if(!L.length||L[L.length-1].deg!==d) L.push({t:Math.round(performance.now()),deg:+d.toFixed(2)});}; new MutationObserver(push).observe(cube,{attributes:true,attributeFilter:['style']});
window.__state=()=>{const scene=document.querySelector('.scroll-campaign-scene'); const up=document.querySelector('.cube-control[aria-label="Previous campaign story"]'); return {face:scene.className.replace('scroll-campaign-scene ','').replace('scene-',''), rotation:+parseFloat(cube.style.getPropertyValue('--cube-rotation')||'0').toFixed(2), settled:cube.classList.contains('campaign-cube-settled'), scrollY:window.scrollY, upDisabled:up.disabled};};
window.__read=()=>{const L=window.__log; const degs=L.map(e=>e.deg); const dirs=new Set(); for(let i=1;i<degs.length;i++){const s=Math.sign(degs[i]-degs[i-1]); if(s) dirs.add(s);} const out={...window.__state(), samples:L.length, from:degs[0], to:degs[degs.length-1], directions:[...dirs].map(d=>d>0?'DOWN':'UP').join('+')||'none', tween_ms:L.length?L[L.length-1].t-L[0].t:0}; window.__log=[]; return out;}; return 'ok';})()`);

const CUBE = { x: Math.round(vp.vw / 2), y: Math.round(vp.vh / 2 + 47) };
console.log('cube center', CUBE);
const wheel = async (dir) => {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: CUBE.x, y: CUBE.y });
  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: CUBE.x, y: CUBE.y, deltaX: 0, deltaY: dir === 'DOWN' ? 100 : -100 });
};
const results = [];
const gesture = async (label, dir, expectFace, settleWait = 800) => {
  await wheel(dir); await sleep(settleWait);
  const r = await evaluate('window.__read()');
  const ok = r.face === expectFace && r.settled && Math.abs(r.rotation - { 'face-one': 0, 'face-two': 90, 'face-three': 180 }[expectFace]) < .01;
  const badDir = r.directions !== 'none' && r.directions !== dir;
  results.push({ step: label, gesture: dir, expected: expectFace, ...r, PASS: ok && !badDir });
};
// Wait (polling) until the transition lock has released, i.e. the Up button is enabled again at face-two.
const waitForLockRelease = async () => { const t0 = Date.now(); while (Date.now() - t0 < 3000) { const s = await evaluate('window.__state()'); if (s.settled && !s.upDisabled) return Date.now() - t0; await sleep(10); } return -1; };

console.log('start', await evaluate('window.__state()'));
// Sequence A
await gesture('A1', 'DOWN', 'face-two');
await gesture('A2', 'DOWN', 'face-three');
await gesture('A3', 'UP', 'face-two');
await gesture('A4', 'UP', 'face-one');
// Sequence B
await gesture('B1', 'DOWN', 'face-two');
await gesture('B2', 'UP', 'face-one');
await gesture('B3', 'DOWN', 'face-two');
await gesture('B4', 'UP', 'face-one');
// Immediate case: Face 3 -> UP -> (as soon as settled) UP
await gesture('C0a', 'DOWN', 'face-two');
await gesture('C0b', 'DOWN', 'face-three');
await wheel('UP');
const releaseMs = await waitForLockRelease();
const c1 = await evaluate('window.__read()');
results.push({ step: 'C1 (UP from face-three, read at lock release)', gesture: 'UP', expected: 'face-two', ...c1, lockReleasedAfterMs: releaseMs, PASS: c1.face === 'face-two' && c1.settled && (c1.directions === 'UP' || c1.directions === 'none') });
await gesture('C2 (UP immediately after settle)', 'UP', 'face-one');

console.table(results.map(({ step, gesture, expected, face, rotation, settled, scrollY, directions, tween_ms, lockReleasedAfterMs, PASS }) => ({ step, gesture, expected, face, rotation, settled, scrollY, directions, tween_ms, lockReleasedAfterMs, PASS })));
console.log('ALL PASS:', results.every((r) => r.PASS));
const shot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(SHOT, Buffer.from(shot.result.data, 'base64'));
console.log('screenshot saved', SHOT);
ws.close(); chrome.kill();
