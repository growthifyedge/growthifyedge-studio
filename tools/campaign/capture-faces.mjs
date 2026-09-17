import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const PORT = 9334, URL = 'http://localhost:4273/';
const OUT = process.argv[2] || '.';
const profile = mkdtempSync(join(tmpdir(), 'cube-cap-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [`--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--headless=new', `--window-size=${process.env.CAP_W || 1440},${process.env.CAP_H || 900}`, '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 50; i++) { try { await fetch(`http://localhost:${PORT}/json/version`); break; } catch { await sleep(200); } }
const target = await (await fetch(`http://localhost:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => { const res = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (res.result.exceptionDetails) throw new Error(JSON.stringify(res.result.exceptionDetails.exception?.description)); return res.result.result.value; };
await send('Page.enable'); await send('Runtime.enable'); await send('Page.navigate', { url: URL });
for (let i = 0; i < 160; i++) { if (await ev("!!document.querySelector('.campaign-cube') && !!document.querySelector('.cube-control')")) break; await sleep(250); }
for (let i = 0; i < 24; i++) { if (await ev("!!document.querySelector('[role=dialog]')")) break; await sleep(250); }
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
await sleep(600);
console.log('modal open:', await ev("!!document.querySelector('[role=dialog]')"));
const shot = async (name, clip) => { const s = await send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip: { ...clip, scale: 1 } } : {}) }); writeFileSync(join(OUT, name), Buffer.from(s.result.data, 'base64')); };
const click = async (sel) => { const b = await ev(`(()=>{const r=document.querySelector('${sel}').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`); for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: b.x, y: b.y, button: 'left', clickCount: 1 }); };
const inspect = `(()=>{
  const cs=(el,props)=>{const c=getComputedStyle(el);return Object.fromEntries(props.map(p=>[p,c.getPropertyValue(p)]))};
  const front=document.querySelector('.cube-face-front');
  const rect=(el)=>{const r=el.getBoundingClientRect();return {x:+r.x.toFixed(0),y:+r.y.toFixed(0),w:+r.width.toFixed(0),h:+r.height.toFixed(0)}};
  const face=rect(front), art=rect(front.querySelector('.face-art')), copy=rect(front.querySelector('.face-copy')), h1=rect(front.querySelector('h1')), cta=rect(front.querySelector('.face-cta'));
  const artChildren=[...front.querySelector('.face-art').children].map(e=>({tag:e.tagName.toLowerCase(),cls:String(e.getAttribute('class')||''), ...rect(e)}));
  const artBox=artChildren.reduce((a,c)=>({x1:Math.min(a.x1,c.x),y1:Math.min(a.y1,c.y),x2:Math.max(a.x2,c.x+c.w),y2:Math.max(a.y2,c.y+c.h)}),{x1:1e9,y1:1e9,x2:0,y2:0});
  const aura=document.querySelector('.cube-aura');
  const pseudo=(el,p,props)=>{const c=getComputedStyle(el,p);return Object.fromEntries(props.map(k=>[k,c.getPropertyValue(k)]))};
  return {
    viewport:{w:innerWidth,h:innerHeight},
    layout:{docScrollWidth:document.documentElement.scrollWidth, navBottom:Math.round((document.querySelector('header, nav, ge-public-navbar')||document.body).getBoundingClientRect().bottom), controlsRight:Math.round(document.querySelector('.scroll-campaign-controls').getBoundingClientRect().right), cubeSize:getComputedStyle(document.querySelector('.campaign-cube-shell')).getPropertyValue('--cube-size')},
    face:{...face, vars:{surface:front.style.getPropertyValue('--face-surface'),content:front.style.getPropertyValue('--face-content'),darkness:front.style.getPropertyValue('--face-darkness')}, ...cs(front,['border','box-shadow','background-color'])},
    rimAfter:pseudo(front,'::after',['opacity']),
    darkenBefore:pseudo(front,'::before',['opacity']),
    faceLight:cs(front.querySelector('.face-light'),['background-image']),
    art:{...art, pctOfFaceHeight:+(art.h/face.h*100).toFixed(1), pctOfFaceWidth:+(art.w/face.w*100).toFixed(1), topGap:art.y-face.y, ...cs(front.querySelector('.face-art'),['opacity','filter'])},
    artInkBox:{w:artBox.x2-artBox.x1,h:artBox.y2-artBox.y1,pctOfFaceWidth:+((artBox.x2-artBox.x1)/face.w*100).toFixed(1),pctOfFaceHeight:+((artBox.y2-artBox.y1)/face.h*100).toFixed(1)},
    artChildren,
    copy:{...copy, ...cs(front.querySelector('.face-copy'),['opacity','filter'])},
    h1:{...h1, ...cs(front.querySelector('h1'),['font-size','color','line-height'])},
    h1Span:cs(front.querySelector('h1 span'),['color','background-image']),
    eyebrow:cs(front.querySelector('.face-copy > p:first-child'),['color','font-size']),
    desc:cs(front.querySelector('.face-description'),['color','font-size']),
    cta:{...cta, ...cs(front.querySelector('.face-cta'),['background-image','box-shadow','font-size','min-height','border-radius'])},
    gapArtToEyebrow: copy.y-(art.y+art.h),
    ctaBottomGap: (face.y+face.h)-(cta.y+cta.h),
    aura:{...rect(aura), ...cs(aura,['opacity','filter','mix-blend-mode','z-index'])},
    shellBefore:pseudo(document.querySelector('.campaign-cube-shell'),'::before',['opacity','filter']),
    stageBefore:pseudo(document.querySelector('.scroll-campaign-stage'),'::before',['opacity','filter','width']),
    atmosphere:cs(document.querySelector('.scroll-campaign-atmosphere'),['background-image'])['background-image'].slice(0,260),
    stageBg:cs(document.querySelector('.scroll-campaign-stage'),['background-color'])
  };})()`;
const results = {};
const faceClip = async () => { const r = await ev("(()=>{const r=document.querySelector('.cube-face-front').getBoundingClientRect();return {x:r.x-140,y:Math.max(0,r.y-60)+window.scrollY,width:r.width+280,height:Math.min(innerHeight,r.height+120)}})()"); return r; };
await shot('face1.png'); results.face1 = await ev(inspect); await shot('face1-crop.png', await faceClip());
await click('.cube-control[aria-label="Next campaign story"]'); await sleep(1000); await shot('face2.png'); results.face2 = await ev(inspect); await shot('face2-crop.png', await faceClip());
await click('.cube-control[aria-label="Next campaign story"]'); await sleep(1000); await shot('face3.png'); results.face3 = await ev(inspect); await shot('face3-crop.png', await faceClip());
writeFileSync(join(OUT, 'inspect.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 1));
ws.close(); spawn('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' });
