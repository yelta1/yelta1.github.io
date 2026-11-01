(function(){
  // starfield
  const c=document.getElementById('stars'),x=c.getContext('2d');
  let stars=[];
  function size(){c.width=innerWidth*devicePixelRatio;c.height=innerHeight*devicePixelRatio;
    stars=Array.from({length:90},()=>({x:Math.random()*c.width,y:Math.random()*c.height,r:(Math.random()*1.2+.3)*devicePixelRatio,p:Math.random()*6}));}
  size();addEventListener('resize',size);
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function draw(t){x.clearRect(0,0,c.width,c.height);
    for(const s of stars){const a=still?.6:.35+.35*Math.sin(t/900+s.p);x.fillStyle='rgba(247,236,216,'+a+')';x.beginPath();x.arc(s.x,s.y,s.r,0,7);x.fill();}
    if(!still)requestAnimationFrame(draw);}
  requestAnimationFrame(draw);

  const env=document.getElementById('env'),letter=document.getElementById('letter');
  document.getElementById('openBtn').addEventListener('click',()=>{
    env.hidden=true;letter.hidden=false;letter.classList.add('reveal');scrollTo({top:0,behavior:'smooth'});hearts(10);
  });

  // the "no" button runs away
  const no=document.getElementById('noBtn'),box=document.getElementById('choices');
  const lines=['Нет','Точно?','Подумай ещё','Не-а','Попкорн же!','Ну Након…'];let n=0;
  function run(e){ if(e)e.preventDefault();
    const w=box.clientWidth-no.offsetWidth,h=box.clientHeight-no.offsetHeight;
    no.style.transform='none';no.style.left=Math.max(0,Math.random()*w)+'px';no.style.top=Math.max(0,Math.random()*h)+'px';
    no.textContent=lines[++n%lines.length];}
  no.addEventListener('mouseenter',run);no.addEventListener('touchstart',run,{passive:false});no.addEventListener('click',run);

  document.getElementById('yesBtn').addEventListener('click',()=>{
    document.getElementById('ask').hidden=true;document.getElementById('yes').hidden=false;hearts(40);
  });

  function hearts(k){ if(still)return;const L=document.getElementById('hearts');
    for(let i=0;i<k;i++){const h=document.createElement('span');h.className='heart';h.textContent='❤';
      h.style.left=Math.random()*100+'vw';h.style.fontSize=(14+Math.random()*20)+'px';
      h.style.animationDuration=(3+Math.random()*3)+'s';h.style.animationDelay=(Math.random()*1.5)+'s';
      L.appendChild(h);setTimeout(()=>h.remove(),8000);} }
})();
