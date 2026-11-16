const CPLANS=[
 {id:'walk',name:'Incline walk',machine:'Treadmill walk',blurb:'The best default. Burns fat without eating into your recovery for the weights. Do it any day, even the day after legs.',
  phases:[{n:'Warm-up',s:300,l:1,t:'Treadmill 5 km/h, incline 2%. Easy pace.'},
          {n:'Incline walk',s:1500,l:2,t:'5 to 5.5 km/h, incline 8 to 12%, hands off the rails.'},
          {n:'Cool-down',s:300,l:1,t:'4.5 km/h, incline 0%. Let your breathing settle.'}]},
 {id:'bike',name:'Bike intervals',machine:'Exercise bike',blurb:'Short and hard. Once a week at most, and not the day before Workout 2 (legs).',
  phases:[{n:'Warm-up',s:300,l:1,t:'Easy pace, low resistance (around level 3 to 5).'},
          ...Array.from({length:8},(_,i)=>[{n:'Hard '+(i+1)+' of 8',s:30,l:3,t:'Raise resistance 3 to 4 levels and pedal fast.'},{n:'Recover '+(i+1)+' of 8',s:90,l:1,t:'Drop the resistance back and spin easy.'}]).flat(),
          {n:'Cool-down',s:180,l:1,t:'Very easy pedalling until your breathing settles.'}]},
 {id:'mix',name:'Machine mix',machine:'Mixed',blurb:'Three machines, ten minutes each. Good when you get bored on one machine, or one is taken.',
  phases:[{n:'Bike',s:600,l:2,t:'Steady pace, moderate resistance.'},
          {n:'Switch',s:60,l:1,t:'Walk to the cross-trainer.'},
          {n:'Cross-trainer',s:540,l:2,t:'Steady pace. Push and pull the handles.'},
          {n:'Switch',s:60,l:1,t:'Walk to the rowing machine. Check the drawing on the plan.'},
          {n:'Rower',s:540,l:2,t:'Smooth strokes: legs, lean back, then arms. Around 22 to 26 strokes a minute.'},
          {n:'Cool-down',s:120,l:1,t:'Slow, easy strokes.'}]}
];
