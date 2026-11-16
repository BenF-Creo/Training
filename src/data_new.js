/* ---------- library build (legacy + v2) ---------- */
const EX={}; OLD_DAYS.forEach(d=>d.ex.forEach(e=>{if(!EX[e.k]) EX[e.k]=e;})); ALT_EX.forEach(e=>{EX[e.k]=e;});
function addVariant(v){
  const base=EX[v.of]; if(!base) return;
  const pose=v.pose||base.pose||base.k;
  EX[v.k]=Object.assign({},base,{view:null,diff:null},v,{pose,view:v.view||(v.pose?null:'Drawing shows the '+base.name.toLowerCase()+'. The movement is the same.')});
}
VAR.forEach(addVariant);

const NEW_EX=[
 // ----- chest
 {k:'bbbench',name:'Barbell bench press',
  setup:['Lie on the bench with your eyes directly under the bar. Feet flat on the floor.','Grip the bar a little wider than shoulder-width. Squeeze your shoulder blades together and down into the bench.','Start with the empty bar (20 kg) to find your groove, then add plates.','Unrack by straightening your arms and bringing the bar over your shoulders.'],
  doit:['Lower the bar under control to your mid-chest, elbows about 45 degrees from your sides.','Touch your chest lightly. No bounce.','Press up and slightly back until the bar is over your shoulders again.','Rack it by pushing back into the uprights, not by reaching.'],
  feel:'Chest, front of shoulders, back of arms.',
  avoid:['Elbows flared straight out to the sides.','Bottom lifting off the bench.','Going heavy with no spotter or safety arms. Set the safeties or ask someone to spot.']},
 {k:'cablechestfly',name:'Cable chest fly',
  setup:['Set both pulleys of a cable crossover to about shoulder height with single handles.','Grab one handle in each hand and step forward into a split stance, so the cables pull your arms back and out.','Slight bend in your elbows. Lock that bend in.'],
  doit:['Sweep your hands forward and together in a wide arc, as if hugging a tree.','Squeeze your chest hard for a second when your hands meet.','Open back out slowly until you feel a stretch across your chest.'],
  feel:'Chest, especially the inner part. A stretch at the start, a squeeze at the end.',
  avoid:['Bending and straightening your elbows (that turns it into a press).','Shoulders rolling forward.','Going so heavy you lean and lunge.']},
 {k:'dips',unit:'bw',name:'Parallel bar dip',
  setup:['Grab the parallel bars and jump or step up so your arms are straight.','Lean your chest slightly forward and cross your ankles behind you.','Too hard for now? Use the assisted dip machine, or swap to push-ups.'],
  doit:['Bend your elbows and lower until your upper arms are about level with the floor.','Push back up until your arms are straight.','Stop the set when you can no longer control the way down.'],
  feel:'Lower chest, back of arms, front of shoulders.',
  avoid:['Dropping fast into the bottom.','Going deeper than your shoulders are comfortable with.','Shrugging your shoulders up to your ears.']},
 // ----- shoulders
 {k:'ohp',name:'Standing barbell overhead press',
  setup:['Set the bar in a rack at upper-chest height. Start with the empty bar.','Grip just outside shoulder-width, step under and rest the bar on the top of your chest.','Step back, feet hip-width. Squeeze your glutes and brace your stomach.'],
  doit:['Press the bar straight up, moving your head back slightly to let it pass.','Finish with the bar over the middle of your feet and your head through between your arms.','Lower under control back to your upper chest.'],
  feel:'Shoulders and back of arms, with your whole trunk working to keep you still.',
  avoid:['Leaning back and turning it into a standing bench press.','Using your legs to bounce the bar up.','Bar drifting out in front of you.']},
 {k:'shrug',name:'Dumbbell shrug',
  setup:['Stand tall holding a heavy dumbbell in each hand at your sides.','Arms straight, shoulders relaxed down.'],
  doit:['Lift your shoulders straight up toward your ears as high as they go.','Hold for a second.','Lower slowly all the way down.'],
  feel:'The muscles between your neck and shoulders (upper traps).',
  avoid:['Rolling your shoulders in circles.','Bending your elbows.','Poking your chin forward.']},
 // ----- triceps
 {k:'skullcrusher',name:'EZ bar skull crusher',
  setup:['Lie on a flat bench holding an EZ bar with a narrow grip, arms straight above your chest.','Tilt your arms very slightly back toward your head.'],
  doit:['Bend only at the elbows and lower the bar toward the top of your forehead.','Stop just short, then straighten your arms again.','Your upper arms stay still the whole time.'],
  feel:'Back of your upper arms.',
  avoid:['Elbows flaring out wide.','Upper arms swinging.','Going heavy before the movement is smooth.']},
 // ----- back
 {k:'pullup',unit:'bw',name:'Pull-up',
  setup:['Grab the bar with palms facing away, hands a little wider than your shoulders.','Hang with arms straight, then pull your shoulders down away from your ears.','Can’t do 5 yet? Swap to the assisted pull-up machine. That is the fastest route to real ones.'],
  doit:['Pull your elbows down toward your ribs until your chin clears the bar.','Lower slowly, about 2 to 3 seconds, until your arms are straight.','Every rep starts from a full hang.'],
  feel:'The wide muscles down the sides of your back, plus biceps and grip.',
  avoid:['Kicking or swinging to get up.','Half reps that never reach a full hang.','Craning your chin up to reach the bar.']},
 {k:'bbrow',name:'Bent-over barbell row',
  setup:['Stand with the bar over the middle of your feet, feet hip-width.','Hinge at the hips with a flat back until your chest is angled about 45 degrees to the floor. Knees soft.','Grip the bar just outside your knees, arms hanging straight.'],
  doit:['Pull the bar to your belly button, driving your elbows back past your sides.','Squeeze your shoulder blades together for a second.','Lower until your arms are straight. Your back angle does not change.'],
  feel:'Middle and upper back, lats, and your lower back holding the position.',
  avoid:['Standing up a little more with every rep.','Rounding your lower back.','Yanking the bar with your arms.']},
 {k:'straightarm',pose:'pushdown',name:'Straight-arm cable pulldown',view:'Drawing shows the pushdown set-up. Here your arms stay straight and swing from the shoulder.',
  setup:['Set a cable pulley to the top with a rope or straight bar.','Stand a big step back, hinge slightly forward, arms straight out in front holding the bar at about eye height.'],
  doit:['Keeping your arms straight, sweep the bar down in an arc to your thighs.','Squeeze your lats for a second.','Let the bar rise slowly back to eye height.'],
  feel:'Lats, down the sides of your back, with no help from your biceps.',
  avoid:['Bending your elbows (that makes it a triceps pushdown).','Rocking your body.']},
 // ----- forearms & grip
 {k:'wristcurl',name:'Dumbbell wrist curl',
  setup:['Sit on a bench holding a light dumbbell, palm up.','Rest your forearm along your thigh with your wrist just past your knee.'],
  doit:['Let the dumbbell roll down toward your fingertips, wrist dropping.','Curl your wrist up as high as it goes.','Do all your reps, then swap arms.'],
  feel:'The inside of your forearm.',
  avoid:['Lifting your forearm off your thigh.','Going heavy. This is a small muscle.']},
 {k:'farmer',r:'m',name:'Farmer’s carry',
  setup:['Pick up a heavy dumbbell or kettlebell in each hand with a flat back, like a deadlift.','Stand tall, shoulders back and down, eyes forward.','Start with about half your bodyweight in total and build from there.'],
  doit:['Walk in a straight line with short, quick steps.','Stay tall. Don’t let the weights pull you sideways or forward.','Walk the distance, turn, and come back if you need to. Put the weights down with a flat back.'],
  feel:'Grip and forearms first, then traps, core and your whole body.',
  avoid:['Leaning or swaying side to side.','Shrugging your shoulders up.','Dropping the weights from height.']},
 {k:'deadhang',unit:'sec',pose:'pullup',name:'Dead hang',view:'Hold the left-hand position. The right-hand drawing is a pull-up, which you are not doing here.',
  setup:['Grab a pull-up bar with palms facing away, hands shoulder-width.','Lift your feet and hang with straight arms.'],
  doit:['Pull your shoulders slightly down away from your ears and hold.','Breathe normally. Hang until your grip is about to go.'],
  feel:'Grip and forearms, plus a stretch through your shoulders and back.',
  avoid:['Swinging.','Hanging completely limp from your shoulder joints.']},
 // ----- quads & glutes
 {k:'backsquat',name:'Barbell back squat',
  setup:['Set the bar in a squat rack at upper-chest height and set the safety arms just below your lowest squat depth.','Duck under and rest the bar across the meaty part of your upper back, not on your neck.','Stand up, take two small steps back. Feet shoulder-width, toes turned out slightly.','Start with the empty bar (20 kg).'],
  doit:['Take a breath and brace your stomach.','Sit down between your heels, knees travelling out over your toes.','Lower until your thighs are at least level with the floor.','Drive up through your whole foot and breathe out near the top.'],
  feel:'Front of thighs and glutes, with your back and core working hard to stay upright.',
  avoid:['Heels lifting.','Knees caving inward.','Chest collapsing forward so the bar rolls toward your neck.','Squatting outside a rack with no safeties.']},
 {k:'walklunge',name:'Dumbbell walking lunge',
  setup:['Hold a dumbbell in each hand at your sides.','Stand tall with a clear lane of about 10 metres in front of you.'],
  doit:['Take a long step forward and lower until your back knee is just above the floor.','Push through your front foot and step straight through into the next lunge.','Count each leg. 10 each means 20 steps.'],
  feel:'Front thigh and glute of the front leg.',
  avoid:['Short steps that jam your front knee forward.','Front heel lifting.','Leaning your chest a long way forward.']},
 {k:'stepup',name:'Dumbbell step-up',
  setup:['Stand facing a box or bench about knee height, a dumbbell in each hand.','Place your whole right foot on the box.'],
  doit:['Push through your right foot to stand up on the box. Avoid pushing off the back foot.','Lower slowly, about 3 seconds, until your left foot touches the floor.','Do all your reps on one leg, then swap.'],
  feel:'Front thigh and glute of the leg on the box.',
  avoid:['Springing off the floor leg.','Dropping down fast.','Knee caving inward.']},
 {k:'hipthrust',name:'Barbell hip thrust',
  setup:['Sit on the floor with your upper back against the long side of a bench.','Roll a loaded barbell over your legs into the crease of your hips. Use a pad.','Feet flat, about hip-width, close enough that your shins are vertical at the top.'],
  doit:['Drive through your heels and lift your hips until your body is flat from shoulders to knees.','Squeeze your glutes hard for a second. Chin tucked, ribs down.','Lower until your bottom is just above the floor.'],
  feel:'Glutes, with hamstrings helping.',
  avoid:['Arching your lower back at the top.','Feet too far out (you will feel it in your hamstrings instead).','Looking up at the ceiling.']},
 {k:'abduction',name:'Hip abduction machine',
  setup:['Sit with your back against the pad, the leg pads on the outside of your knees.','Start with your knees together. Hold the handles.'],
  doit:['Push your knees apart as far as you can.','Hold for a second.','Bring them back together slowly.'],
  feel:'The outside of your hips and the sides of your glutes.',
  avoid:['Rocking your body to move the weight.','Letting the stack slam shut.']},
 {k:'adduction',name:'Hip adduction machine',
  setup:['Sit with your back against the pad, the leg pads on the inside of your knees.','Set the start position as wide as is comfortable. Hold the handles.'],
  doit:['Squeeze your knees together until the pads meet.','Hold for a second.','Open back out slowly to a stretch.'],
  feel:'Inner thighs.',
  avoid:['Starting wider than your hips allow.','Bouncing out of the stretch.']},
 {k:'sled',r:'m',name:'Sled push',
  setup:['Load the sled on the turf. Start with one 20 kg plate each side.','Hold the upright poles at about chest height, arms straight.','Lean in so your body makes a straight line from head to back heel.'],
  doit:['Drive the sled forward with short, powerful steps.','Keep your arms locked and your hips low.','Push the full distance without stopping, then rest.'],
  feel:'Whole legs and lungs. This is the finisher, so it should be hard.',
  avoid:['Standing upright and pushing with your arms.','Long, slow strides.','Rounding your back.']},
 // ----- hamstrings & glutes
 {k:'deadlift',name:'Barbell deadlift',
  setup:['Stand with the bar over the middle of your feet, shins about 3 cm from it. Feet hip-width.','Bend down and grip just outside your legs.','Bring your shins to the bar, lift your chest and flatten your back. Shoulders just in front of the bar.','Start light: the bar with a 10 kg plate each side.'],
  doit:['Take a breath, brace, and push the floor away with your legs.','Keep the bar sliding up your shins and thighs.','Stand tall at the top. Don’t lean back.','Lower by pushing your hips back first, then bending your knees once the bar passes them.'],
  feel:'Glutes, hamstrings and your whole back. Grip too.',
  avoid:['Rounding your lower back. If it rounds, the weight is too heavy.','Bar drifting away from your legs.','Jerking the bar off the floor.','Hips shooting up before the bar moves.']},
 {k:'kbswing',name:'Kettlebell swing',
  setup:['Stand with feet a bit wider than your hips, a kettlebell on the floor about a foot in front of you.','Hinge at the hips with a flat back and grab the handle with both hands.','Start with 12 to 16 kg.'],
  doit:['Hike the bell back between your legs like a rugby pass.','Snap your hips forward hard and stand tall. The bell floats up to chest height by itself.','Let it fall, and hinge back only when your arms reconnect with your body.'],
  feel:'Glutes and hamstrings, and your heart rate climbing fast.',
  avoid:['Squatting it up and down.','Lifting the bell with your arms and shoulders.','Rounding your back at the bottom.','Leaning back at the top.']},
 // ----- calves & shins
 {k:'calfraise',name:'Standing calf raise',
  setup:['Use the standing calf raise machine, or stand on a step holding a dumbbell.','Balls of your feet on the edge, heels hanging off. Legs straight.'],
  doit:['Lower your heels as far as they go and pause for 2 seconds in the stretch.','Push up onto your toes as high as you can and pause for 1 second.','No bouncing. The pauses are the whole point.'],
  feel:'The big muscle at the back of your lower leg.',
  avoid:['Bouncing out of the bottom (your Achilles does the work instead of the muscle).','Half range.','Bending your knees to help.']},
 {k:'seatedcalf',name:'Seated calf raise',
  setup:['Sit at the machine with the balls of your feet on the footplate and the pad snug on your lower thighs.','Lift slightly and release the safety catch.'],
  doit:['Lower your heels to a deep stretch and pause for 2 seconds.','Push up as high as you can and pause for 1 second.','Lock the catch back in before you get out.'],
  feel:'The deeper calf muscle (soleus), lower down and to the sides.',
  avoid:['Bouncing.','Pushing with your hands on the pad.']},
 {k:'legpresscalf',pose:'legpress',name:'Leg press calf raise',view:'Drawing shows the leg press. Here your legs stay straight and only your ankles move.',
  setup:['Sit in the leg press with only the balls of your feet on the bottom edge of the platform.','Straighten your legs. Leave the safety handles locked in if the machine allows it.'],
  doit:['Let your toes come back toward you for a deep stretch. Pause.','Push the platform away with your toes as far as you can. Pause.'],
  feel:'Calves.',
  avoid:['Bending your knees.','Feet so low they could slip off.']},
 {k:'tibialis',unit:'bw',name:'Wall tibialis raise',
  setup:['Stand with your back and hips against a wall.','Walk your feet out about one big step. Legs straight.'],
  doit:['Pull your toes up toward your shins as high as you can, heels on the floor.','Hold for a second.','Lower slowly. Too easy? Move your feet further from the wall.'],
  feel:'The front of your shins. It burns quickly.',
  avoid:['Bending your knees.','Rushing the reps.']},
 // ----- core
 {k:'woodchop',name:'Cable woodchop',
  setup:['Set a cable pulley to the top with a single handle.','Stand side-on to the machine, feet wider than your shoulders.','Hold the handle with both hands up by the shoulder nearest the machine.'],
  doit:['Pull the handle down and across your body to the outside of your far knee, rotating your trunk.','Let your back foot pivot.','Return slowly to the start. Do all reps, then turn around.'],
  feel:'The sides of your waist (obliques).',
  avoid:['Doing it all with your arms.','Rounding your back as you come down.']},
 {k:'reversecrunch',unit:'bw',name:'Reverse crunch',
  setup:['Lie on your back on a mat, hands flat on the floor by your hips.','Lift your legs so your knees are bent at 90 degrees above your hips.'],
  doit:['Curl your hips off the floor, bringing your knees toward your chest.','Hold for a second.','Lower your hips slowly. Don’t let your feet drop to the floor.'],
  feel:'Lower stomach.',
  avoid:['Swinging your legs for momentum.','Pushing hard through your hands.']},
 {k:'abwheel',unit:'bw',name:'Ab wheel rollout',
  setup:['Kneel on a mat holding the ab wheel on the floor under your shoulders.','Tuck your hips slightly and brace your stomach.'],
  doit:['Roll the wheel forward slowly, hips and shoulders moving together.','Go only as far as you can without your lower back sagging.','Pull back to the start using your stomach.'],
  feel:'Your whole stomach, hard.',
  avoid:['Lower back sagging toward the floor.','Hips staying back while only your arms reach.']}
];
NEW_EX.forEach(e=>{ if(!e.rx) e.rx=''; EX[e.k]=e; });

const NEW_VAR=[
 {k:'pecdeck',of:'cablechestfly',name:'Pec deck machine',diff:'Seated machine version of the fly. Set the seat so the handles are at chest height, back flat on the pad, and bring the handles together in front of you.'},
 {k:'chinup',of:'pullup',name:'Chin-up',diff:'Palms facing you, hands shoulder-width. Slightly easier than a pull-up and works the biceps more.'},
 {k:'smithsquat',of:'backsquat',name:'Smith machine squat',diff:'The bar runs on rails. Put your feet a little further forward than in a free squat, twist the bar to unhook, and set the safety stops.'},
 {k:'singlecalf',of:'calfraise',name:'Single-leg calf raise',diff:'One leg at a time on a step, holding a dumbbell on the working side and a rail with the other hand. Log the reps for one leg.'},
 {k:'hanglegraise',of:'knee',unit:'bw',name:'Hanging leg raise',diff:'Hang from a pull-up bar and raise your legs with knees only slightly bent, up to hip height or higher. Much harder than the knee raise.'},
 {k:'inclinecurl',of:'bicep',name:'Incline dumbbell curl',diff:'Lie back on a bench set to about 60 degrees, arms hanging straight down behind your body. Curl from that stretched position. Use lighter dumbbells than standing.'},
 {k:'reversecurl',of:'bicep',name:'EZ bar reverse curl',diff:'Hold the EZ bar with palms facing down. Same curl, but it works the top of your forearms. Use about half your normal curl weight.'}
];
NEW_VAR.forEach(addVariant);

/* units */
const UNIT={plank:'sec',knee:'bw'};
[...VAR,...NEW_VAR].forEach(v=>{ UNIT[v.k]=v.unit||UNIT[v.of]||UNIT[EX[v.of]&&EX[v.of].of]; });
NEW_EX.forEach(e=>{ if(e.unit) UNIT[e.k]=e.unit; });
const RLAB={sled:'m',farmer:'m'};
const unitOf=k=>UNIT[k]||'kg';

/* muscle groups and equipment */
const GROUPS=[
 ['chest','Chest','bbbench chest isochest mtschest inclinechest dbbench inclinedb smithbench cablechestfly pecdeck dips pushup'],
 ['shoulders','Shoulders','ohp shoulder isoshoulder mtsshoulder smithshoulder dbshoulder arnold lateral machlateral cablelateral seatedlateral fly cablefly dbreversefly facepull shrug'],
 ['triceps','Triceps','pushdown ropepush barpush singlepush ohext ohcable skullcrusher'],
 ['back','Back','pullup chinup assistpull pulldown isopull mtspull closepull underpull singlepull straightarm bbrow platerow isorowover mtsrow tbar row widerow singlerow machrow dbrow'],
 ['biceps','Biceps','b21 bicep ezcurl inclinecurl cablecurl hammer preacher'],
 ['forearms','Forearms and grip','wristcurl reversecurl farmer deadhang'],
 ['quads','Quads','backsquat smithsquat revv hacksquat pendulum legpress singlelegpress seatedlegpress linlegpress goblet splitsquat walklunge stepup legext singleext sled'],
 ['hams','Glutes, hamstrings and hips','deadlift rdl barbellrdl smithrdl hipthrust kbswing curl singlecurl lyingcurl singlelyingcurl backext abduction adduction'],
 ['calves','Calves and shins','calfraise singlecalf seatedcalf legpresscalf tibialis'],
 ['core','Core','plank sideplank pallof cablecrunch woodchop knee hangknee hanglegraise reversecrunch abwheel']
];
const GRP={}; GROUPS.forEach(([id,,ks])=>ks.split(' ').forEach(k=>{GRP[k]=id;}));
const GNAME=Object.fromEntries(GROUPS.map(g=>[g[0],g[1]]));
const EQTAGS=[
 ['Machine','chest isochest mtschest inclinechest pecdeck shoulder isoshoulder mtsshoulder machlateral fly assistpull isopull mtspull platerow isorowover mtsrow tbar machrow preacher revv hacksquat pendulum legpress singlelegpress seatedlegpress linlegpress legext singleext curl singlecurl lyingcurl singlelyingcurl backext abduction adduction calfraise seatedcalf legpresscalf knee smithbench smithshoulder smithsquat smithrdl sled'],
 ['Cable','cablechestfly cablelateral cablefly facepull pushdown ropepush barpush singlepush ohcable pulldown closepull underpull singlepull straightarm row widerow singlerow cablecurl pallof cablecrunch woodchop'],
 ['Dumbbell','dbbench inclinedb dbshoulder arnold lateral seatedlateral dbreversefly shrug ohext dbrow bicep inclinecurl hammer wristcurl farmer goblet splitsquat walklunge stepup rdl singlecalf kbswing'],
 ['Barbell','bbbench ohp skullcrusher bbrow b21 ezcurl reversecurl backsquat deadlift barbellrdl hipthrust'],
 ['Bodyweight','dips pushup pullup chinup deadhang tibialis plank sideplank hangknee hanglegraise reversecrunch abwheel']
];
const EQP={}; EQTAGS.forEach(([t,ks])=>ks.split(' ').forEach(k=>{EQP[k]=t;}));

/* best alternatives for the new exercises (older ones use SWAPS) */
const ALTS={
 bbbench:'dbbench smithbench chest isochest mtschest', cablechestfly:'pecdeck inclinechest pushup', dips:'pushup pushdown', inclinedb:'inclinechest dbbench bbbench',
 dbshoulder:'ohp shoulder isoshoulder mtsshoulder arnold smithshoulder', ohp:'dbshoulder shoulder isoshoulder smithshoulder', ohcable:'ohext skullcrusher ropepush',
 pullup:'assistpull chinup pulldown isopull mtspull', bbrow:'platerow tbar dbrow row', facepull:'fly cablefly dbreversefly', hammer:'bicep ezcurl cablecurl inclinecurl preacher',
 farmer:'deadhang shrug', backsquat:'smithsquat hacksquat revv legpress goblet', walklunge:'splitsquat stepup singlelegpress', deadlift:'barbellrdl rdl hipthrust backext',
 kbswing:'hipthrust rdl backext', calfraise:'singlecalf legpresscalf seatedcalf', seatedcalf:'calfraise legpresscalf singlecalf', tibialis:'calfraise',
 wristcurl:'reversecurl farmer deadhang', reversecurl:'hammer wristcurl', abduction:'hipthrust', adduction:'splitsquat', woodchop:'pallof sideplank cablecrunch',
 reversecrunch:'knee hangknee hanglegraise abwheel', deadhang:'farmer', sled:'walklunge farmer kbswing', cablecrunch:'abwheel knee plank reversecrunch', hipthrust:'kbswing backext rdl'
};
function altsFor(k){
  const out=[]; const add=x=>{ if(x&&x!==k&&EX[x]&&!out.includes(x)) out.push(x); };
  if(SWAPS[k]) [...SWAPS[k].same,...SWAPS[k].similar].forEach(add);
  (ALTS[k]||'').split(' ').forEach(add);
  Object.values(EX).forEach(e=>{ if(e.of===k) add(e.k); });
  return out;
}

/* ---------- the programme ---------- */
const WORKOUTS=[
 {id:'mon',n:1,name:'Push',focus:'Chest, shoulders, triceps',blurb:'One heavy press, then three supersets and a finisher.',slots:[
  {g:'A',k:'bbbench',sets:4,reps:'6–8',rest:150,note:'Your main lift. Two warm-up sets first: the empty bar, then about half your working weight.'},
  {g:'B1',k:'inclinedb',sets:3,reps:'8–10',rest:0},
  {g:'B2',k:'cablechestfly',sets:3,reps:'12–15',rest:75},
  {g:'C1',k:'dbshoulder',sets:3,reps:'8–10',rest:0},
  {g:'C2',k:'lateral',sets:3,reps:'12–15',rest:75},
  {g:'D1',k:'pushdown',sets:3,reps:'10–12',rest:0},
  {g:'D2',k:'ohcable',sets:3,reps:'10–12',rest:60},
  {g:'E',k:'dips',sets:2,reps:'as many as you can',rest:90,note:'Finisher. Stop one rep before your form breaks.'},
  {g:'F',k:'cablecrunch',sets:3,reps:'12–15',rest:60}]},
 {id:'wed',n:2,name:'Legs',focus:'Quads, hamstrings, glutes, calves',blurb:'Squat heavy, then build the rest of the leg around it. Ends with a sled.',slots:[
  {g:'A',k:'backsquat',sets:4,reps:'6–8',rest:150,note:'Your main lift. Two warm-up sets first: the empty bar, then about half your working weight.'},
  {g:'B',k:'revv',sets:3,reps:'10–12',rest:120},
  {g:'C',k:'rdl',sets:3,reps:'8–10',rest:90},
  {g:'D1',k:'curl',sets:3,reps:'10–12',rest:0},
  {g:'D2',k:'legext',sets:3,reps:'12–15',rest:75},
  {g:'E1',k:'calfraise',sets:3,reps:'12–15',rest:0,note:'Pause 2 seconds at the bottom and 1 at the top of every rep.'},
  {g:'E2',k:'knee',sets:3,reps:'10–15',rest:60},
  {g:'F',k:'sled',sets:4,reps:'20 m',rest:75,note:'Finisher. If the turf is busy, swap to walking lunges.'}]},
 {id:'thu',n:3,name:'Pull',focus:'Back, rear shoulders, biceps, grip',blurb:'Pull-ups and a heavy row first, then detail work and a loaded carry.',slots:[
  {g:'A',k:'pullup',sets:4,reps:'5–8',rest:150,note:'Your main lift. If you can’t get 5 clean reps, swap to the assisted pull-up machine.'},
  {g:'B',k:'platerow',sets:4,reps:'8–10',rest:90},
  {g:'C1',k:'row',sets:3,reps:'10–12',rest:0},
  {g:'C2',k:'facepull',sets:3,reps:'12–15',rest:75},
  {g:'D',k:'b21',sets:2,reps:'21',rest:90},
  {g:'E1',k:'hammer',sets:3,reps:'10–12',rest:0},
  {g:'E2',k:'fly',sets:3,reps:'12–15',rest:60},
  {g:'F1',k:'farmer',sets:3,reps:'30 m',rest:0,note:'Finisher. As heavy as you can hold for the full distance.'},
  {g:'F2',k:'pallof',sets:3,reps:'10 each side',rest:60}]},
 {id:'fb',n:4,name:'Full body',focus:'Whole body, with conditioning',blurb:'A heavy deadlift, two upper and lower pairings, and a three-move circuit.',slots:[
  {g:'A',k:'deadlift',sets:4,reps:'5',rest:180,note:'Your main lift. Build up over two or three lighter sets first. Every rep starts from a dead stop on the floor.'},
  {g:'B1',k:'walklunge',sets:3,reps:'10 each leg',rest:0},
  {g:'B2',k:'dbbench',sets:3,reps:'8–10',rest:90},
  {g:'C1',k:'pulldown',sets:3,reps:'10–12',rest:0},
  {g:'C2',k:'ohp',sets:3,reps:'8–10',rest:90},
  {g:'D1',k:'kbswing',sets:3,reps:'15',rest:0,note:'Circuit: swing, calf raise, plank, then rest. Three rounds.'},
  {g:'D2',k:'seatedcalf',sets:3,reps:'15–20',rest:0},
  {g:'D3',k:'plank',sets:3,reps:'30–45 sec',rest:60}]},
 {id:'det',n:5,extra:true,name:'Details',focus:'Calves, shins, forearms, rear delts, hips, lower abs',blurb:'The stubborn areas that the big lifts miss. All supersets, so it moves quickly.',slots:[
  {g:'A1',k:'calfraise',sets:4,reps:'10–12',rest:0,note:'Heavy. Pause 2 seconds at the bottom and 1 at the top of every rep.'},
  {g:'A2',k:'tibialis',sets:4,reps:'15–20',rest:60},
  {g:'B1',k:'seatedcalf',sets:3,reps:'15–20',rest:0},
  {g:'B2',k:'fly',sets:3,reps:'15',rest:60},
  {g:'C1',k:'wristcurl',sets:3,reps:'15 each arm',rest:0},
  {g:'C2',k:'reversecurl',sets:3,reps:'12',rest:60},
  {g:'D1',k:'abduction',sets:3,reps:'15',rest:0},
  {g:'D2',k:'adduction',sets:3,reps:'15',rest:60},
  {g:'E1',k:'woodchop',sets:3,reps:'12 each side',rest:0},
  {g:'E2',k:'reversecrunch',sets:3,reps:'12–15',rest:60},
  {g:'F',k:'deadhang',sets:2,reps:'as long as you can',rest:90,note:'Finisher for your grip.'}]}
];
const W=Object.fromEntries(WORKOUTS.map(w=>[w.id,w]));
WORKOUTS.forEach(w=>{ w.long=(w.extra?'':'Workout '+w.n+' · ')+w.name; });
W.cardio={id:'cardio',name:'Cardio',long:'Cardio session',slots:[],extra:true};
const ORDER=WORKOUTS.filter(w=>!w.extra).map(w=>w.id);
