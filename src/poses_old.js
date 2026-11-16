const EQ = 'var(--eq)';
function L(x1,y1,x2,y2,w){return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${EQ}" stroke-width="${w||4}" stroke-linecap="round"/>`}
function C(x,y,r,fill){return `<circle cx="${x}" cy="${y}" r="${r}" ${fill?`fill="${EQ}"`:`fill="none" stroke="${EQ}" stroke-width="3"`}/>`}
function R(x,y,w,h){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${EQ}"/>`}
const FLOOR = L(4,150,156,150,2);
const SIDE = [['sh','el'],['el','ha'],['sh','hip'],['hip','kn'],['kn','an'],['an','toe']];

function figure(p, bones, color){
  let s='';
  for(const [a,b] of bones){ if(p[a]&&p[b]) s+=`<line x1="${p[a][0]}" y1="${p[a][1]}" x2="${p[b][0]}" y2="${p[b][1]}" stroke="${color}" stroke-width="5" stroke-linecap="round"/>`; }
  if(p.head) s+=`<circle cx="${p.head[0]}" cy="${p.head[1]}" r="9" fill="${color}"/>`;
  return s;
}
function svg(pose, color, bones){
  const eq = typeof pose.eq==='function'?pose.eq(pose.p):(pose.eq||'');
  return `<svg viewBox="0 0 160 160" role="img" aria-hidden="true">${eq}${figure(pose.p,bones||SIDE,color)}</svg>`;
}
const ext = (a,b)=>Object.assign({},a,b);

/* ---------- poses ---------- */
const P = {};

// Dumbbell bench press (side view)
{ const eq=p=>FLOOR+L(20,112,140,112,6)+L(30,112,30,150,4)+L(130,112,130,150,4)+C(p.ha[0],p.ha[1],6,true);
  const base={head:[132,100],sh:[116,104],hip:[62,104],kn:[38,98],an:[32,146],toe:[22,146]};
  P.dbbench={a:{p:ext(base,{el:[92,116],ha:[100,92]}),eq},b:{p:ext(base,{el:[114,78],ha:[116,52]}),eq},view:'Side view, lying on a flat bench'}; }
// One-arm dumbbell row
const ROWB=[['sh','el'],['el','ha'],['sh','hip'],['hip','kn'],['kn','an'],['an','toe'],['sh','sa'],['hip','sk'],['sk','sf']];
{ const eq=p=>FLOOR+L(76,108,150,108,6)+L(84,108,84,150,4)+L(142,108,142,150,4)+C(p.ha[0],p.ha[1],6,true);
  const base={head:[138,64],sh:[124,70],hip:[78,74],kn:[66,112],an:[62,148],toe:[72,148],sa:[130,104],sk:[94,104],sf:[118,104]};
  P.dbrow={a:{p:ext(base,{el:[120,92],ha:[118,118]}),eq},b:{p:ext(base,{el:[100,56],ha:[104,82]}),eq},bones:ROWB,view:'Side view, one knee and one hand on a flat bench'}; }
// Seated overhead triceps extension
{ const base={head:[60,50],sh:[60,66],hip:[60,112],kn:[92,114],an:[92,146],toe:[102,146],el:[66,30]};
  const eq=p=>FLOOR+L(50,84,50,120,6)+L(50,122,86,122,5)+L(66,122,66,150,4)+R(p.ha[0]-4,p.ha[1]-9,8,18);
  P.ohext={a:{p:ext(base,{ha:[42,44]}),eq},b:{p:ext(base,{ha:[68,4]}),eq},view:'Side view, seated with back support'}; }
// 45 degree back extension
{ const eq=()=>FLOOR+L(24,140,38,150,6)+L(62,150,82,96,5)+L(72,102,96,78,9);
  const base={toe:[22,138],an:[34,142],kn:[54,122],hip:[76,98]};
  P.backext={a:{p:ext(base,{sh:[96,132],head:[104,143],el:[90,120],ha:[100,122]}),eq},b:{p:ext(base,{sh:[110,64],head:[120,54],el:[104,78],ha:[112,74]}),eq},view:'Side view, hips on the pad, heels under the rollers'}; }
// Lying leg curl
{ const base={head:[26,84],sh:[40,88],hip:[86,88],kn:[116,88],el:[30,100],ha:[18,104]};
  const eq=p=>FLOOR+L(20,98,132,98,6)+L(34,98,34,150,4)+L(120,98,120,150,4)+C(p.an[0]+(p.pad||0),p.an[1]+6,6,true);
  P.lyingcurl={a:{p:ext(base,{an:[146,92],toe:[152,100]}),eq},b:{p:ext(base,{an:[104,54],toe:[96,48]}),eq},view:'Side view, lying face down'}; }

const TOP=[['ls','rs'],['ls','le'],['le','lh'],['rs','re'],['re','rh']];
// Push-up
{ const eq=()=>FLOOR;
  P.pushup={a:{p:{head:[134,100],sh:[120,108],el:[122,128],ha:[120,148],hip:[74,126],kn:[50,135],an:[28,144],toe:[22,148]},eq},
            b:{p:{head:[134,126],sh:[118,132],el:[102,128],ha:[120,148],hip:[72,139],kn:[50,143],an:[28,146],toe:[22,148]},eq},view:'Side view'}; }
// Incline chest press (handles travel up)
{ const base={head:[54,50],sh:[55,66],hip:[60,110],kn:[92,112],an:[92,146],toe:[102,146]};
  const eq=p=>FLOOR+L(44,52,48,120,6)+L(46,120,84,120,5)+L(64,120,64,150,4)+C(p.ha[0],p.ha[1],5,true);
  P.inclinechest={a:{p:ext(base,{el:[40,82],ha:[62,70]}),eq},b:{p:ext(base,{el:[76,54],ha:[96,38]}),eq},view:'Side view. The handles travel up and forward.'}; }
// Hack squat (back against the pad)
{ const eq=p=>FLOOR+L(30,10,92,148,3)+L(p.pad[0],p.pad[1],p.pad[2],p.pad[3],10)+L(80,150,120,138,6);
  P.hacksquat={a:{p:{head:[66,34],sh:[70,48],el:[84,60],ha:[80,46],hip:[80,92],kn:[90,120],an:[94,144],toe:[106,141],pad:[61,46,71,92]},eq},
               b:{p:{head:[52,60],sh:[56,74],el:[70,86],ha:[66,72],hip:[64,116],kn:[100,110],an:[94,144],toe:[106,141],pad:[47,72,55,116]},eq},view:'Side view, back and shoulders against the pads'}; }
// Bulgarian split squat
const SPLITB=[...SIDE,['hip','bk'],['bk','ba']];
{ const eq=p=>FLOOR+L(10,108,46,108,6)+L(16,108,16,150,4)+L(40,108,40,150,4)+R(p.ha[0]-4,p.ha[1]-8,8,16);
  P.splitsquat={a:{p:{head:[74,30],sh:[72,44],el:[72,68],ha:[72,90],hip:[72,88],kn:[82,116],an:[84,146],toe:[96,146],bk:[56,116],ba:[34,102]},eq},
                b:{p:{head:[72,54],sh:[70,68],el:[70,92],ha:[70,114],hip:[64,112],kn:[98,118],an:[86,146],toe:[98,146],bk:[56,140],ba:[34,102]},eq},bones:SPLITB,view:'Side view, back foot resting on a bench behind you'}; }
// Kneeling cable crunch
{ const eq=p=>FLOOR+L(150,4,150,150,6)+C(142,12,4,false)+L(142,12,p.ha[0],p.ha[1],2);
  P.cablecrunch={a:{p:{head:[80,50],sh:[74,64],el:[90,66],ha:[84,50],hip:[70,108],kn:[70,146],an:[40,146],toe:[34,146]},eq},
                 b:{p:{head:[110,106],sh:[98,98],el:[106,118],ha:[110,104],hip:[66,110],kn:[70,146],an:[40,146],toe:[34,146]},eq},view:'Side view, kneeling facing a high cable with a rope'}; }
// Preacher curl machine
{ const base={head:[68,44],sh:[70,58],hip:[62,104],kn:[94,106],an:[94,146],toe:[104,146],el:[96,78]};
  const eq=p=>FLOOR+L(50,114,86,114,5)+L(66,114,66,150,4)+L(74,68,102,88,9)+L(102,88,108,150,4)+C(p.ha[0],p.ha[1],5,true);
  P.preacher={a:{p:ext(base,{ha:[120,100]}),eq},b:{p:ext(base,{ha:[96,50]}),eq},view:'Side view, upper arms resting on the angled pad'}; }
// Side plank (correct vs sagging)
{ const base={head:[128,104],sh:[118,118],el:[118,146],ha:[136,146],an:[26,146],toe:[20,148]};
  P.sideplank={a:{p:ext(base,{hip:[72,132],kn:[48,140]}),eq:()=>FLOOR},b:{p:ext(base,{hip:[72,145],kn:[48,147]}),eq:()=>FLOOR},labels:['Correct','Avoid this'],bad:true,view:'Viewed from the front, propped on one forearm'}; }
// Face pull (top view)
{ const base={head:[80,92],ls:[58,104],rs:[102,104]};
  const eq=p=>`<rect x="70" y="0" width="20" height="8" rx="3" fill="${EQ}"/>`+L(80,8,(p.lh[0]+p.rh[0])/2,p.lh[1],2)+`<rect x="60" y="100" width="40" height="30" rx="10" fill="none" stroke="${EQ}" stroke-width="2"/>`;
  P.facepull={a:{p:ext(base,{le:[64,78],lh:[76,54],re:[96,78],rh:[84,54]}),eq},b:{p:ext(base,{le:[40,94],lh:[64,80],re:[120,94],rh:[96,80]}),eq},bones:TOP,view:'Viewed from above, cable machine in front of you'}; }
// Rowing machine
{ const eq=p=>FLOOR+L(6,138,150,138,4)+`<rect x="${p.hip[0]-10}" y="128" width="20" height="6" rx="2" fill="${EQ}"/>`+L(104,122,116,140,6)+C(138,118,16,false)+L(p.ha[0],p.ha[1],124,116,2)+L(p.ha[0],p.ha[1]-6,p.ha[0],p.ha[1]+6,5);
  P.rower={a:{p:{head:[94,72],sh:[86,86],el:[100,98],ha:[112,104],hip:[72,126],kn:[90,98],an:[106,128],toe:[114,122]},eq,lab:'Catch'},
           b:{p:{head:[30,74],sh:[36,88],el:[30,110],ha:[52,106],hip:[42,126],kn:[74,118],an:[106,128],toe:[114,122]},eq},labels:['Catch','Finish'],view:'Side view. Legs push first, then lean back, then pull the handle to your lower ribs.'}; }
// Goblet squat
{ const eq=p=>FLOOR+R(p.db[0],p.db[1],9,18);
  P.goblet={a:{p:{head:[80,32],sh:[78,46],el:[86,68],ha:[88,56],hip:[76,92],kn:[78,120],an:[76,148],toe:[88,148],db:[86,44]},eq},
            b:{p:{head:[72,58],sh:[66,72],el:[76,92],ha:[80,80],hip:[54,112],kn:[88,116],an:[76,148],toe:[88,148],db:[78,70]},eq}}; }
// Chest press
{ const base={head:[54,50],sh:[55,66],hip:[60,110],kn:[92,112],an:[92,146],toe:[102,146]};
  const eq=p=>FLOOR+L(44,52,48,120,6)+L(46,120,84,120,5)+L(64,120,64,150,4)+C(p.ha[0],p.ha[1],5,true);
  P.chest={a:{p:ext(base,{el:[40,82],ha:[64,74]}),eq},b:{p:ext(base,{el:[78,70],ha:[102,70]}),eq}}; }
// Shoulder press
{ const base={head:[60,50],sh:[60,66],hip:[60,112],kn:[92,114],an:[92,146],toe:[102,146]};
  const eq=p=>FLOOR+L(50,36,50,120,6)+L(50,122,86,122,5)+L(66,122,66,150,4)+L(p.ha[0]-9,p.ha[1],p.ha[0]+9,p.ha[1],5);
  P.shoulder={a:{p:ext(base,{el:[70,86],ha:[72,62]}),eq},b:{p:ext(base,{el:[66,43],ha:[68,19]}),eq}}; }
// Lateral raise (front view)
const FRONT=[['ls','rs'],['neck','pel'],['lhip','rhip'],['ls','le'],['le','lh'],['rs','re'],['re','rh'],['lhip','lk'],['lk','la'],['rhip','rk'],['rk','ra']];
{ const base={head:[80,28],neck:[80,40],ls:[66,44],rs:[94,44],pel:[80,92],lhip:[72,92],rhip:[88,92],lk:[71,120],rk:[89,120],la:[70,148],ra:[90,148]};
  const eq=p=>FLOOR+C(p.lh[0],p.lh[1],5,true)+C(p.rh[0],p.rh[1],5,true);
  P.lateral={a:{p:ext(base,{le:[62,68],lh:[62,92],re:[98,68],rh:[98,92]}),eq},b:{p:ext(base,{le:[43,48],lh:[21,52],re:[117,48],rh:[139,52]}),eq},bones:FRONT,view:'Viewed from the front'}; }
// Triceps pushdown
{ const base={head:[78,34],sh:[74,48],hip:[70,92],kn:[72,120],an:[70,148],toe:[82,148],el:[74,72]};
  const eq=p=>FLOOR+L(126,4,126,150,6)+C(118,12,4,false)+L(118,12,p.ha[0],p.ha[1],2)+L(p.ha[0]-6,p.ha[1]+2,p.ha[0]+6,p.ha[1]-2,5);
  P.pushdown={a:{p:ext(base,{ha:[94,62]}),eq},b:{p:ext(base,{ha:[80,96]}),eq}}; }
// Plank (correct vs sagging)
{ const base={head:[121,118],sh:[110,124],el:[110,146],ha:[132,146],an:[30,146],toe:[24,150]};
  const eq=()=>FLOOR;
  P.plank={a:{p:ext(base,{hip:[70,135],kn:[50,140]}),eq},b:{p:ext(base,{hip:[70,146],kn:[50,147]}),eq},labels:['Correct','Avoid this'],bad:true}; }
// Reverse V squat (lever machine, facing the pad)
{ const eq=p=>FLOOR+`<rect x="34" y="146" width="56" height="4" fill="${EQ}"/>`
    +L(p.pad[0],p.pad[1],p.pad[2],p.pad[3],12)+C(p.sp[0],p.sp[1],7,true)
    +L(p.pad[2],p.pad[3],96,122,4)+L(96,122,p.pl[0],p.pl[1],5)+C(p.pl[0],p.pl[1],11,true)+L(96,122,96,150,5)+C(96,122,4,false);
  P.revv={a:{p:{head:[76,34],sh:[70,48],el:[76,71],ha:[88,56],hip:[62,92],kn:[64,120],an:[60,146],toe:[72,146],pad:[80,50,74,83],sp:[66,40],pl:[142,114]},eq},
          b:{p:{head:[62,56],sh:[54,70],el:[60,93],ha:[72,78],hip:[42,112],kn:[72,122],an:[60,146],toe:[72,146],pad:[63,71,54,101],sp:[50,62],pl:[138,90]},eq},view:'Side view, chest on the pad. The pad swings on an arm and the plates rise at the back.'}; }
// Leg press
{ const base={head:[32,80],sh:[42,92],hip:[70,122],el:[54,112],ha:[70,124]};
  const eq=p=>FLOOR+L(84,146,156,74,3)+L(26,84,60,132,6)+L(58,132,88,132,5)+L(72,132,72,150,4)+L(p.an[0]-14,p.an[1]-14,p.an[0]+12,p.an[1]+12,6);
  P.legpress={a:{p:ext(base,{kn:[80,88],an:[110,98]}),eq},b:{p:ext(base,{kn:[100,100],an:[126,72]}),eq}}; }
// Romanian deadlift
{ const eq=p=>FLOOR+R(p.ha[0]-9,p.ha[1]-3,18,7);
  P.rdl={a:{p:{head:[82,32],sh:[80,46],el:[87,70],ha:[89,94],hip:[78,92],kn:[80,120],an:[80,148],toe:[92,148]},eq},
         b:{p:{head:[110,64],sh:[98,72],el:[96,96],ha:[92,120],hip:[56,94],kn:[76,122],an:[80,148],toe:[92,148]},eq}}; }
// Seated leg curl
{ const base={head:[52,44],sh:[54,58],hip:[60,102],kn:[94,102],el:[58,82],ha:[72,98]};
  const eq=p=>FLOOR+L(44,38,48,112,6)+L(48,112,100,112,5)+L(74,112,74,150,4)+C(88,91,6,true)+C(p.pad[0],p.pad[1],6,true);
  P.curl={a:{p:ext(base,{an:[126,106],pad:[124,115]}),eq},b:{p:ext(base,{an:[88,134],pad:[80,138]}),eq}}; }
// Leg extension
{ const base={head:[60,46],sh:[60,60],hip:[62,104],kn:[96,104],el:[62,84],ha:[74,104]};
  const eq=p=>FLOOR+L(50,40,52,112,6)+L(52,112,100,112,5)+L(76,112,76,150,4)+C(p.pad[0],p.pad[1],6,true);
  P.legext={a:{p:ext(base,{an:[98,138],pad:[107,134]}),eq},b:{p:ext(base,{an:[130,100],pad:[128,91]}),eq}}; }
// Pallof press (top view)
{ const base={head:[80,114],ls:[58,112],rs:[102,112]};
  const eq=p=>`<rect x="2" y="30" width="10" height="90" rx="3" fill="${EQ}"/>`+C(14,68,4,false)+L(14,68,80,p.hy,2)+`<rect x="56" y="104" width="48" height="26" rx="12" fill="none" stroke="${EQ}" stroke-width="2"/>`+C(80,p.hy,5,true);
  P.pallof={a:{p:ext(base,{hy:86,le:[62,90],lh:[78,86],re:[98,90],rh:[82,86]}),eq},b:{p:ext(base,{hy:46,le:[69,79],lh:[78,46],re:[91,79],rh:[82,46]}),eq},bones:TOP,view:'Viewed from above, cable machine on your left'}; }
// Lat pulldown
{ const eq=p=>FLOOR+L(132,2,132,150,6)+L(50,116,90,116,5)+L(70,116,70,150,4)+C(90,98,6,true)+L(p.ha[0],p.ha[1],68,2,2)+C(p.ha[0],p.ha[1],5,true);
  P.pulldown={a:{p:{head:[60,48],sh:[58,62],hip:[60,108],kn:[94,108],an:[96,144],toe:[106,144],el:[66,40],ha:[72,16]},eq},
              b:{p:{head:[55,48],sh:[56,62],hip:[62,108],kn:[94,108],an:[96,144],toe:[106,144],el:[48,84],ha:[70,74]},eq}}; }
// Seated cable row
{ const base={head:[54,58],sh:[52,72],hip:[50,118],kn:[86,104],an:[118,120]};
  const eq=p=>FLOOR+L(30,126,100,126,5)+L(64,126,64,150,4)+L(124,106,124,138,5)+L(148,60,148,150,6)+C(142,114,4,false)+L(p.ha[0],p.ha[1],142,114,2)+C(p.ha[0],p.ha[1],5,true);
  P.row={a:{p:ext(base,{el:[76,78],ha:[100,82]}),eq},b:{p:ext(base,{el:[30,86],ha:[52,96]}),eq}}; }
// Rear delt fly (top view)
{ const base={head:[80,92],ls:[58,104],rs:[102,104]};
  const eq=p=>`<rect x="64" y="66" width="32" height="10" rx="4" fill="${EQ}"/>`+`<rect x="60" y="100" width="40" height="30" rx="10" fill="none" stroke="${EQ}" stroke-width="2"/>`+C(p.lh[0],p.lh[1],5,true)+C(p.rh[0],p.rh[1],5,true);
  P.fly={a:{p:ext(base,{le:[64,78],lh:[74,54],re:[96,78],rh:[86,54]}),eq},b:{p:ext(base,{le:[32,102],lh:[8,98],re:[128,102],rh:[152,98]}),eq},bones:TOP,view:'Viewed from above, chest against the pad'}; }
// Biceps curl
{ const base={head:[82,32],sh:[80,46],hip:[78,92],kn:[80,120],an:[80,148],toe:[92,148],el:[88,70]};
  const eq=p=>FLOOR+R(p.ha[0]-4,p.ha[1]-8,8,16);
  P.bicep={a:{p:ext(base,{ha:[90,94]}),eq},b:{p:ext(base,{ha:[104,52]}),eq}}; }

P.b21={a:P.bicep.a,b:{p:Object.assign({},P.bicep.a.p,{ha:[112,72]}),eq:P.bicep.a.eq},c:P.bicep.b,labels:['Bottom','Halfway','Top']};
// Plate-loaded row, underhand grip
{ const base={head:[70,52],sh:[64,66],hip:[56,112],kn:[90,114],an:[92,146],toe:[102,146]};
  const eq=p=>FLOOR+L(42,120,82,120,5)+L(62,120,62,150,4)+L(78,56,76,104,8)+L(p.ha[0],p.ha[1],132,128,4)+L(132,128,132,150,5)+L(p.ha[0],p.ha[1]-7,p.ha[0],p.ha[1]+7,5)+C(132,128,4,false);
  P.platerow={a:{p:ext(base,{el:[88,72],ha:[110,78]}),eq},b:{p:ext(base,{el:[44,82],ha:[68,88]}),eq},view:'Side view, chest on the pad'}; }
// Captain's chair knee raise
{ const base={head:[62,32],sh:[60,46],el:[60,70],ha:[84,70],hip:[58,94]};
  const eq=()=>L(4,158,156,158,2)+L(48,26,48,110,6)+L(54,76,94,76,6)+L(44,110,44,158,4)+L(94,76,94,158,4);
  P.knee={a:{p:ext(base,{kn:[60,122],an:[62,148]}),eq},b:{p:ext(base,{kn:[88,86],an:[92,116]}),eq}}; }

