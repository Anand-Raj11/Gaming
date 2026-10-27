'use strict';
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d');
const overlay=document.querySelector('#overlay'),play=document.querySelector('#play');
const keys={left:false,right:false,jump:false};
let stage=0,lives=3,score=0,state='title',camera=0,checkpoint=60,last=0,acc=0,audio,sound=false,jumpHeld=false;
let player,platforms,coins,enemies,flag,finish;
const themes=[['#c5e0d4','#eff1cf','#76aa8c','#386d56'],['#d9d8e4','#f5e4c8','#a0a6b1','#596c80'],['#f2d9be','#fff0c5','#b5ad83','#717f59']];
function tone(freq=600){if(!sound)return;audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=freq;g.gain.setValueAtTime(.07,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.15);o.start();o.stop(audio.currentTime+.15)}
function load(){checkpoint=60;camera=0;player={x:60,y:350,w:28,h:36,vx:0,vy:0,ground:false};
const gap=100+stage*18;platforms=[];for(let i=0;i<9;i++){let x=i*(300+gap);platforms.push({x,y:450,w:300,h:100});if(i>0)platforms.push({x:x+70,y:345-(i%2)*30,w:112,h:20});}
finish=8*(300+gap)+220;flag=4*(300+gap)+40;coins=[];enemies=[];for(let i=0;i<9;i++){const x=i*(300+gap);for(let j=0;j<3;j++)coins.push({x:x+100+j*50,y:i?270-(i%2)*30:390,taken:false});if(i>0)enemies.push({x:x+160,y:422,w:32,h:28,dir:1,min:x+30,max:x+260,dead:false});}updateHUD();}
function updateHUD(){document.querySelector('#level').textContent=`0${stage+1} / 03`;document.querySelector('#coins').textContent=`✦ ${score}`;document.querySelector('#lives').textContent='♥ '.repeat(lives);}
function show(title,message,label){overlay.classList.remove('hidden');overlay.querySelector('.tag').textContent='THE ADVENTURE CONTINUES';overlay.querySelector('h1').textContent=title;overlay.querySelector('p').textContent=message;play.textContent=label;document.querySelector('#pause').style.display='none';}
function begin(){if(state==='paused'){state='playing';}else{if(state==='over'||state==='won'){stage=0;lives=3;score=0;}load();state='playing';}overlay.classList.add('hidden');document.querySelector('#pause').style.display='block';canvas.focus();tone(440);}
play.onclick=begin;
function pause(){if(state==='playing'){state='paused';show('Take a breather.','Your adventure will be right here.','Keep wandering →');}else if(state==='paused')begin();}
document.querySelector('#pause').onclick=pause;
document.querySelector('#sound').onclick=()=>{sound=!sound;document.querySelector('#sound').textContent=sound?'Sound on':'Sound off';tone();};
function input(e,down){const map={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',' ':'jump',ArrowUp:'jump',w:'jump',W:'jump'};if(map[e.key]){e.preventDefault();keys[map[e.key]]=down;}if(down&&!e.repeat&&(e.key==='p'||e.key==='P'||e.key==='Escape'))pause();}
addEventListener('keydown',e=>input(e,true));addEventListener('keyup',e=>input(e,false));addEventListener('blur',()=>{Object.keys(keys).forEach(k=>keys[k]=false);if(state==='playing')pause();});
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys[b.dataset.key]=true;};b.onpointerup=b.onpointercancel=()=>keys[b.dataset.key]=false;});
function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function die(){tone(130);lives--;updateHUD();if(!lives){state='over';show('A fresh start?','Every great wanderer takes a tumble. Your next adventure awaits.','Try again →');}else{player.x=checkpoint;player.y=350;player.vy=0;player.vx=0;camera=Math.max(0,player.x-300);}}
function step(){if(state!=='playing')return;const p=player,oldY=p.y;p.vx=((keys.right?1:0)-(keys.left?1:0))*4.5;
if(keys.jump&&!jumpHeld&&p.ground){p.vy=-12.8;p.ground=false;tone(400);}jumpHeld=keys.jump;if(!keys.jump&&p.vy< -5)p.vy=-5;p.vy=Math.min(p.vy+.5,14);p.x=Math.max(0,p.x+p.vx);p.y+=p.vy;p.ground=false;
for(const b of platforms){if(p.x+p.w>b.x&&p.x<b.x+b.w&&oldY+p.h<=b.y&&p.y+p.h>=b.y&&p.vy>=0){p.y=b.y-p.h;p.vy=0;p.ground=true;}}
for(const c of coins){if(!c.taken&&Math.hypot(p.x+14-c.x,p.y+18-c.y)<30){c.taken=true;score++;tone(800);updateHUD();}}
for(const e of enemies){if(e.dead)continue;e.x+=e.dir*(1.1+stage*.35);if(e.x>e.max||e.x<e.min)e.dir*=-1;if(hit(p,e)){if(p.vy>0&&oldY+p.h<e.y+12){e.dead=true;p.vy=-9;score+=5;tone(250);updateHUD();}else{die();return;}}}
if(p.x>flag&&checkpoint===60){checkpoint=flag;tone(1000);}if(p.y>650){die();return;}if(p.x>finish){tone(1000);if(stage===2){state='won';show('Wild at heart.','You made it through all three worlds! Final score: '+score+' coins.','Wander again →');}else{stage++;state='between';show('Onward, wanderer.','Checkpoint reached! A new landscape is waiting.','Next world →');}}camera=Math.max(0,Math.min(finish-700,p.x-300));}
function rounded(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function draw(){const t=themes[stage];const sky=ctx.createLinearGradient(0,0,0,540);sky.addColorStop(0,t[0]);sky.addColorStop(1,t[1]);ctx.fillStyle=sky;ctx.fillRect(0,0,960,540);
ctx.fillStyle='#fff8d9';ctx.beginPath();ctx.arc(760-camera*.03,118,48,0,Math.PI*2);ctx.fill();
for(let layer=0;layer<3;layer++){ctx.fillStyle=[t[2]+'40',t[2]+'65',t[2]+'90'][layer];for(let i=-1;i<10;i++){let x=i*230-(camera*(.12+layer*.12)%230);ctx.beginPath();ctx.ellipse(x,470,180,160+layer*20,0,Math.PI,0);ctx.fill();}}
ctx.save();ctx.translate(-camera,0);
for(const b of platforms){rounded(b.x,b.y,b.w,b.h,8,t[3]);rounded(b.x,b.y,b.w,12,6,'#8ab369');for(let i=15;i<b.w;i+=35){ctx.fillStyle='#ffffff13';ctx.fillRect(b.x+i,b.y+25,4,5);}if(b.h>20)for(let i=20;i<b.w;i+=95){ctx.fillStyle='#f2e7b5';ctx.beginPath();ctx.arc(b.x+i,b.y-5,3,0,7);ctx.fill();}}
for(const c of coins)if(!c.taken){ctx.fillStyle='#bc8b38';ctx.beginPath();ctx.ellipse(c.x,c.y+Math.sin(performance.now()/250+c.x)*3,9,12,0,0,7);ctx.fill();ctx.fillStyle='#ffe29a';ctx.beginPath();ctx.ellipse(c.x-1,c.y+Math.sin(performance.now()/250+c.x)*3-1,6,9,0,0,7);ctx.fill();}
for(const e of enemies)if(!e.dead){rounded(e.x+8,e.y+12,16,16,5,'#f3e5c0');ctx.fillStyle='#c77559';ctx.beginPath();ctx.ellipse(e.x+16,e.y+10,20,14,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#fff0d0';ctx.fillRect(e.x+7,e.y+4,5,3);ctx.fillStyle='#354838';ctx.fillRect(e.x+10,e.y+18,3,4);ctx.fillRect(e.x+20,e.y+18,3,4);}
function banner(x,active){ctx.fillStyle='#6a7956';ctx.fillRect(x,355,5,95);ctx.fillStyle=active?'#e3af58':'#f3eaca';ctx.beginPath();ctx.moveTo(x+5,355);ctx.lineTo(x+48,370);ctx.lineTo(x+5,387);ctx.fill();}banner(flag,checkpoint!==60);banner(finish,true);
const p=player;if(p){rounded(p.x+4,p.y+27,9,10,3,'#3c5343');rounded(p.x+17,p.y+27,9,10,3,'#3c5343');rounded(p.x,p.y+10,28,22,8,'#d98f5b');rounded(p.x+3,p.y,23,20,8,'#f6dfb4');rounded(p.x-3,p.y-4,34,9,5,'#416e50');rounded(p.x+3,p.y-11,22,12,6,'#416e50');ctx.fillStyle='#344e40';ctx.fillRect(p.x+(p.vx<0?6:18),p.y+7,3,4);rounded(p.x-5,p.y+16,9,14,4,'#68885a');}
ctx.restore();}
function loop(now){acc+=Math.min((now-last)/1000,.1);last=now;while(acc>=1/60){step();acc-=1/60;}draw();requestAnimationFrame(loop);}load();requestAnimationFrame(loop);
