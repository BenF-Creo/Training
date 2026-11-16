/* ---------- new drawings (v2) ---------- */
const PLATE=(x,y,r)=>C(x,y,r||12,false)+C(x,y,3,true);
// Barbell bench press
{ const eq=p=>FLOOR+L(20,112,140,112,6)+L(30,112,30,150,4)+L(130,112,130,150,4)+PLATE(p.ha[0],p.ha[1],11);
  const base={head:[132,100],sh:[116,104],hip:[62,104],kn:[38,98],an:[32,146],toe:[22,146]};
  P.bbbench={a:{p:ext(base,{el:[114,78],ha:[116,50]}),eq},b:{p:ext(base,{el:[92,116],ha:[104,90]}),eq},labels:['Start','Bottom'],view:'Side view, lying on a flat bench. Lower to mid-chest, then press back up.'}; }
// Barbell back squat
{ const eq=p=>FLOOR+PLATE(p.bar[0],p.bar[1],12);
  P.backsquat={a:{p:{head:[82,28],sh:[78,46],el:[86,60],ha:[76,48],hip:[76,92],kn:[78,120],an:[76,148],toe:[88,148],bar:[71,45]},eq},
               b:{p:{head:[76,56],sh:[68,72],el:[76,86],ha:[66,74],hip:[52,112],kn:[90,116],an:[76,148],toe:[88,148],bar:[61,71]},eq},labels:['Start','Bottom'],view:'Side view, bar resting across your upper back'}; }
// Deadlift
{ const eq=p=>FLOOR+PLATE(p.ha[0],p.ha[1],14);
  P.deadlift={a:{p:{head:[114,72],sh:[102,82],el:[100,108],ha:[98,136],hip:[60,102],kn:[92,122],an:[84,148],toe:[96,148]},eq},
              b:{p:{head:[82,30],sh:[80,46],el:[84,70],ha:[88,94],hip:[78,92],kn:[80,120],an:[80,148],toe:[92,148]},eq},view:'Side view. The bar starts on the floor and stays against your legs.'}; }
// Pull-up
{ const eq=()=>FLOOR+L(56,20,108,20,5)+L(108,20,108,150,3);
  P.pullup={a:{p:{head:[86,50],sh:[80,64],el:[80,42],ha:[80,20],hip:[78,108],kn:[80,132],an:[70,148]},eq},
            b:{p:{head:[88,12],sh:[80,36],el:[94,48],ha:[80,20],hip:[78,82],kn:[80,106],an:[70,124]},eq},labels:['Hang','Chin over bar'],view:'Side view'}; }
// Bent-over barbell row
{ const base={head:[110,64],sh:[98,72],hip:[56,94],kn:[76,122],an:[80,148],toe:[92,148]};
  const eq=p=>FLOOR+PLATE(p.ha[0],p.ha[1],11);
  P.bbrow={a:{p:ext(base,{el:[97,96],ha:[96,118]}),eq},b:{p:ext(base,{el:[70,80],ha:[82,98]}),eq},view:'Side view. Back flat, pull the bar to your belly button.'}; }
// Standing calf raise
{ const eq=p=>FLOOR+`<rect x="84" y="138" width="54" height="12" rx="2" fill="${EQ}"/>`+R(p.ha[0]-4,p.ha[1]-2,8,16);
  P.calfraise={a:{p:{head:[80,28],sh:[78,42],el:[80,66],ha:[82,88],hip:[76,88],kn:[78,116],an:[76,146],toe:[92,138]},eq},
               b:{p:{head:[84,12],sh:[82,26],el:[84,50],ha:[86,72],hip:[80,72],kn:[82,100],an:[80,128],toe:[92,138]},eq},labels:['Heels down','Up on toes'],view:'Side view, balls of your feet on a step, heels hanging off'}; }
// Seated calf raise
{ const base={head:[60,50],sh:[60,64],hip:[60,108],el:[72,84],ha:[88,94],toe:[108,140]};
  const eq=p=>FLOOR+L(40,114,76,114,5)+L(58,114,58,150,4)+`<rect x="100" y="140" width="24" height="10" rx="2" fill="${EQ}"/>`+L(p.kn[0]-10,p.kn[1]-8,p.kn[0]+12,p.kn[1]-8,8)+L(p.kn[0]+12,p.kn[1]-8,140,p.kn[1]-14,3)+C(140,p.kn[1]-14,8,true);
  P.seatedcalf={a:{p:ext(base,{kn:[96,110],an:[94,148]}),eq},b:{p:ext(base,{kn:[98,100],an:[98,132]}),eq},labels:['Heels down','Up on toes'],view:'Side view, pad resting on your knees'}; }
// Walking lunge
{ const eq=p=>FLOOR+R(p.ha[0]-4,p.ha[1]-6,8,16);
  P.walklunge={a:{p:{head:[82,30],sh:[80,44],el:[80,68],ha:[80,90],hip:[78,90],kn:[80,118],an:[80,146],toe:[92,146],bk:[78,118],ba:[74,146]},eq},
               b:{p:{head:[80,54],sh:[78,68],el:[78,90],ha:[78,110],hip:[74,110],kn:[102,116],an:[102,146],toe:[114,146],bk:[58,140],ba:[34,144]},eq},bones:SPLITB,labels:['Stand','Lunge'],view:'Side view. Step forward, lower, then step through into the next lunge.'}; }
// Kettlebell swing
{ const eq=p=>FLOOR+C(p.ha[0],p.ha[1]+6,8,true);
  P.kbswing={a:{p:{head:[106,68],sh:[94,76],el:[82,94],ha:[66,108],hip:[56,94],kn:[78,120],an:[80,148],toe:[92,148]},eq},
             b:{p:{head:[82,30],sh:[80,46],el:[102,50],ha:[124,50],hip:[80,92],kn:[80,120],an:[80,148],toe:[92,148]},eq},labels:['Hinge','Snap up'],view:'Side view. The power comes from your hips, not your arms.'}; }
// Farmer's carry
{ const eq=p=>FLOOR+`<rect x="${p.ha[0]-11}" y="${p.ha[1]-2}" width="22" height="10" rx="3" fill="${EQ}"/>`;
  P.farmer={a:{p:{head:[82,30],sh:[80,44],el:[80,68],ha:[80,90],hip:[78,90],kn:[80,118],an:[80,146],toe:[92,146],bk:[78,118],ba:[76,146]},eq},
            b:{p:{head:[82,30],sh:[80,44],el:[80,68],ha:[80,90],hip:[78,90],kn:[94,116],an:[98,146],toe:[110,146],bk:[66,118],ba:[50,142]},eq},bones:SPLITB,labels:['Stand tall','Walk'],view:'Side view, a heavy weight in each hand'}; }
// Sled push
{ const eq=()=>FLOOR+`<rect x="104" y="134" width="48" height="14" rx="3" fill="${EQ}"/>`+L(122,134,122,86,5)+L(140,134,140,112,5);
  P.sled={a:{p:{head:[100,82],sh:[90,92],el:[104,92],ha:[120,92],hip:[60,110],kn:[78,126],an:[64,146],toe:[76,148],bk:[42,124],ba:[24,142]},eq},
          b:{p:{head:[100,82],sh:[90,92],el:[104,92],ha:[120,92],hip:[60,110],kn:[62,134],an:[40,144],toe:[52,148],bk:[86,124],ba:[76,146]},eq},bones:SPLITB,labels:['Drive','Step'],view:'Side view. Arms locked, body leaning in, short powerful steps.'}; }
// Tibialis raise
{ const base={head:[54,34],sh:[52,48],el:[56,70],ha:[58,92],hip:[54,94],kn:[66,120],an:[78,146]};
  const eq=()=>FLOOR+L(40,8,40,150,6);
  P.tibialis={a:{p:ext(base,{toe:[92,148]}),eq},b:{p:ext(base,{toe:[90,130]}),eq},labels:['Toes down','Toes up'],view:'Side view. Back and hips against a wall, feet a step out in front.'}; }
// Wrist curl
{ const WB=[...SIDE,['ha','fi']];
  const base={head:[60,50],sh:[62,64],hip:[60,108],kn:[94,108],an:[94,146],toe:[104,146],el:[72,100],ha:[98,102]};
  const eq=p=>FLOOR+L(40,114,76,114,5)+L(58,114,58,150,4)+R(p.fi[0]-4,p.fi[1]-8,8,16);
  P.wristcurl={a:{p:ext(base,{fi:[110,112]}),eq},b:{p:ext(base,{fi:[108,90]}),eq},bones:WB,labels:['Wrist down','Wrist up'],view:'Side view, forearm resting on your thigh, palm up'}; }
// Hip abduction / adduction (front view, seated)
{ const base={head:[80,30],neck:[80,42],ls:[66,46],rs:[94,46],pel:[80,94],lhip:[72,94],rhip:[88,94],le:[60,68],lh:[62,92],re:[100,68],rh:[98,92]};
  const tog={lk:[74,120],rk:[86,120],la:[74,148],ra:[86,148]}, apart={lk:[46,120],rk:[114,120],la:[46,148],ra:[114,148]};
  const seat=FLOOR+L(56,100,104,100,6);
  const out=p=>seat+L(p.lk[0]-9,p.lk[1]-12,p.lk[0]-9,p.lk[1]+10,7)+L(p.rk[0]+9,p.rk[1]-12,p.rk[0]+9,p.rk[1]+10,7);
  const inn=p=>seat+L(p.lk[0]+9,p.lk[1]-12,p.lk[0]+9,p.lk[1]+10,7)+L(p.rk[0]-9,p.rk[1]-12,p.rk[0]-9,p.rk[1]+10,7);
  P.abduction={a:{p:ext(base,tog),eq:out},b:{p:ext(base,apart),eq:out},bones:FRONT,labels:['Knees together','Push out'],view:'Viewed from the front, pads on the outside of your knees'};
  P.adduction={a:{p:ext(base,apart),eq:inn},b:{p:ext(base,{lk:[72,120],rk:[88,120],la:[72,148],ra:[88,148]}),eq:inn},bones:FRONT,labels:['Knees apart','Squeeze in'],view:'Viewed from the front, pads on the inside of your knees'}; }
// Cable woodchop (front view)
{ const base={head:[80,28],neck:[80,40],ls:[66,44],rs:[94,44],pel:[80,92],lhip:[72,92],rhip:[88,92],lk:[68,120],rk:[92,120],la:[64,148],ra:[96,148]};
  const eq=p=>FLOOR+L(8,4,8,150,6)+C(16,12,4,false)+L(16,12,p.lh[0],p.lh[1],2)+C(p.lh[0],p.lh[1],5,true);
  P.woodchop={a:{p:ext(base,{le:[52,34],lh:[40,22],re:[68,30],rh:[40,22]}),eq},b:{p:ext(base,{le:[90,72],lh:[116,98],re:[108,70],rh:[116,98]}),eq},bones:FRONT,labels:['High','Across and down'],view:'Viewed from the front, cable set high on one side'}; }
// Reverse crunch
{ const base={head:[36,134],sh:[50,140],el:[64,143],ha:[82,143]};
  const eq=()=>L(0,147,160,147,3);
  P.reversecrunch={a:{p:ext(base,{hip:[96,140],kn:[98,108],an:[128,110]}),eq},b:{p:ext(base,{hip:[90,126],kn:[68,102],an:[96,92]}),eq},labels:['Start','Hips curled up'],view:'Lying on your back, side view'}; }
// Parallel bar dip
{ const eq=()=>FLOOR+L(52,86,108,86,5)+L(60,86,60,150,3)+L(100,86,100,150,3);
  P.dips={a:{p:{head:[84,28],sh:[80,44],el:[80,64],ha:[80,86],hip:[78,90],kn:[82,116],an:[66,132]},eq},
          b:{p:{head:[92,50],sh:[86,64],el:[64,62],ha:[80,86],hip:[78,108],kn:[84,132],an:[66,144]},eq},labels:['Top','Bottom'],view:'Side view, a hand on each bar'}; }
// Cable chest fly (top view)
{ const base={head:[80,92],ls:[58,104],rs:[102,104]};
  const eq=p=>L(4,126,p.lh[0],p.lh[1],2)+L(156,126,p.rh[0],p.rh[1],2)+C(4,126,4,true)+C(156,126,4,true)+`<rect x="60" y="100" width="40" height="30" rx="10" fill="none" stroke="${EQ}" stroke-width="2"/>`+C(p.lh[0],p.lh[1],5,true)+C(p.rh[0],p.rh[1],5,true);
  P.cablechestfly={a:{p:ext(base,{le:[34,98],lh:[14,88],re:[126,98],rh:[146,88]}),eq},b:{p:ext(base,{le:[60,78],lh:[76,56],re:[100,78],rh:[84,56]}),eq},bones:TOP,labels:['Arms wide','Hands together'],view:'Viewed from above, standing between two cable pulleys'}; }
// Ab wheel rollout
{ const base={kn:[56,146],an:[28,146]};
  const eq=p=>FLOOR+C(p.ha[0],p.ha[1]+2,8,false);
  P.abwheel={a:{p:ext(base,{hip:[60,110],sh:[90,98],head:[102,90],el:[92,120],ha:[96,138]}),eq},b:{p:ext(base,{hip:[78,128],sh:[114,126],head:[126,120],el:[130,134],ha:[144,138]}),eq},labels:['Start','Rolled out'],view:'Side view, kneeling'}; }
// Hip thrust
{ const eq=p=>FLOOR+`<rect x="16" y="102" width="30" height="48" rx="3" fill="${EQ}"/>`+PLATE(p.hip[0]+4,p.hip[1]-8,12);
  P.hipthrust={a:{p:{head:[36,90],sh:[48,102],el:[62,116],ha:[78,124],hip:[76,132],kn:[108,114],an:[112,146],toe:[124,146]},eq},
               b:{p:{head:[34,92],sh:[48,102],el:[64,98],ha:[82,94],hip:[80,102],kn:[110,104],an:[112,146],toe:[124,146]},eq},labels:['Hips down','Hips up'],view:'Side view, upper back on a bench, bar across your hips'}; }
// Dumbbell shrug
{ const base={hip:[78,92],kn:[80,120],an:[80,148],toe:[92,148]};
  const eq=p=>FLOOR+R(p.ha[0]-4,p.ha[1]-2,8,16);
  P.shrug={a:{p:ext(base,{head:[82,30],sh:[80,48],el:[82,70],ha:[84,92]}),eq},b:{p:ext(base,{head:[82,30],sh:[80,41],el:[82,63],ha:[84,85]}),eq},labels:['Shoulders down','Shrug up'],view:'Side view. Only your shoulders move, straight up toward your ears.'}; }
// Skull crusher
{ const eq=p=>FLOOR+L(20,112,140,112,6)+L(30,112,30,150,4)+L(130,112,130,150,4)+R(p.ha[0]-4,p.ha[1]-8,8,16);
  const base={head:[130,100],sh:[114,104],hip:[62,104],kn:[38,98],an:[32,146],toe:[22,146],el:[118,72]};
  P.skullcrusher={a:{p:ext(base,{ha:[120,44]}),eq},b:{p:ext(base,{ha:[146,82]}),eq},labels:['Arms straight','Lowered'],view:'Side view, lying on a bench. Only your forearms move.'}; }
// Box step-up
{ const eq=p=>FLOOR+`<rect x="88" y="126" width="54" height="24" rx="2" fill="${EQ}"/>`+R(p.ha[0]-4,p.ha[1]-4,8,14);
  P.stepup={a:{p:{head:[80,28],sh:[78,42],el:[78,64],ha:[78,84],hip:[76,88],kn:[100,104],an:[100,124],toe:[112,124],bk:[76,118],ba:[72,148]},eq},
            b:{p:{head:[102,10],sh:[100,24],el:[100,46],ha:[100,66],hip:[98,70],kn:[100,98],an:[100,124],toe:[112,124],bk:[92,98],ba:[88,122]},eq},bones:SPLITB,labels:['Foot on box','Stand up'],view:'Side view'}; }
// Standing barbell overhead press
{ const base={hip:[78,92],kn:[80,120],an:[80,148],toe:[92,148],head:[80,34],sh:[80,50]};
  const eq=p=>FLOOR+PLATE(p.ha[0],p.ha[1],10);
  P.ohp={a:{p:ext(base,{el:[92,68],ha:[92,48]}),eq},b:{p:ext(base,{el:[84,30],ha:[84,11]}),eq},labels:['At shoulders','Overhead'],view:'Side view, standing'}; }
