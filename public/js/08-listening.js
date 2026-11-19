/* ================= LISTENING (Starters) ================= */
// 15 original "listen and do" exercises in the style of Cambridge Starters listening.
const CLR = {red:'#e63946', blue:'#3a86ff', green:'#2a9d4b', yellow:'#ffd60a', orange:'#fb8500', pink:'#ff7eb6', purple:'#8e44ad', brown:'#8d5524', black:'#2b2b2b', grey:'#9aa0a6'};
const LTYPES = {
  move:   {icon:'✋', name:'Listen and move',   how:'Listen and move the things to the right place. Drag them, or tap a thing and then tap a place.'},
  lines:  {icon:'✏️', name:'Listen and draw lines', how:'Listen and draw lines. Tap a name, then tap the right person.'},
  tick:   {icon:'✅', name:'Listen and tick',    how:'Listen and tick the right picture.'},
  colour: {icon:'🎨', name:'Listen and colour',  how:'Listen and colour. Tap a colour, then tap the picture.'},
  write: {icon:'✍️', name:'Listen and write', how:'Read the question. Listen and write a name or a number.'},
  plines: {icon:'📍', name:'Draw lines: where is it?', how:'Listen and draw lines. Tap a thing, then tap the place where it is in the picture.'},
  cdraw: {icon:'✏️', name:'Listen, colour and draw', how:'Listen and colour and draw. To colour: tap a colour, then tap the thing. To draw: tap a thing in the tray, then tap the dotted circle where it goes.'},
  scolour: {icon:'🖍️', name:'Colour: where is it?', how:'Listen and colour. Find the right thing in the picture — look where it is! Tap a colour, then tap the thing.'},
  number: {icon:'🔢', name:'Listen and number',  how:'Listen and match the picture with what you hear. Tap a number, then tap the picture.'},
};
const LEX = [
  {type:'move', title:'In the living room', icon:'🛋️', bg:'room',
   items:[{k:'window',x:50,y:22,w:13},{e:'🖼️',x:16,y:20,s:8},{e:'🛋️',x:20,y:62,s:22},{k:'table',x:55,y:70,w:24},{e:'📦',x:86,y:76,s:12},{e:'🌻',x:93,y:42,s:7}],
   zones:[{id:'on-sofa',x:20,y:50},{id:'next-sofa',x:37,y:78},{id:'on-table',x:55,y:51},{id:'under-table',x:55,y:74},{id:'in-box',x:86,y:70},{id:'next-box',x:74,y:82}],
   objects:[{id:'cat',e:'🐱'},{id:'ball',e:'⚽'},{id:'book',e:'📕'},{id:'teddy',e:'🧸'},{id:'shoe',e:'👟'}],
   steps:[{say:"Look at the cat. It's on the sofa.",o:'cat',z:'on-sofa'},{say:'Can you see the ball? Put the ball under the table.',o:'ball',z:'under-table'},
     {say:'Now the book. Put the book on the table, please.',o:'book',z:'on-table'},{say:'Where is the teddy? Put the teddy in the box.',o:'teddy',z:'in-box'},
     {say:"And the shoe? Put it next to the sofa.",o:'shoe',z:'next-sofa'}]},
  {type:'move', title:'My bedroom', icon:'🛏️', bg:'bedroom',
   items:[{e:'🛏️',x:24,y:62,s:26},{k:'shelf',x:74,y:34,w:24},{e:'🪑',x:57,y:70,s:14},{e:'🎒',x:87,y:76,s:11},{k:'window',x:30,y:20,w:12}],
   zones:[{id:'on-bed',x:28,y:55},{id:'next-bed',x:44,y:80},{id:'on-chair',x:57,y:56},{id:'under-chair',x:57,y:84},{id:'in-bag',x:87,y:72},{id:'on-shelf',x:74,y:24}],
   objects:[{id:'teddy',e:'🧸'},{id:'shoes',e:'👟'},{id:'book',e:'📘'},{id:'pencil',e:'✏️'},{id:'clock',e:'⏰'}],
   steps:[{say:"This is my bedroom. My teddy is on the bed.",o:'teddy',z:'on-bed'},{say:'Put my shoes under the chair, please.',o:'shoes',z:'under-chair'},
     {say:'Can you put the book on the shelf?',o:'book',z:'on-shelf'},{say:'My pencil goes in my bag.',o:'pencil',z:'in-bag'},
     {say:'And put the clock next to the bed.',o:'clock',z:'next-bed'}]},
  {type:'move', title:'In the kitchen', icon:'🍳', bg:'kitchen',
   items:[{k:'table',x:40,y:70,w:30},{e:'🥣',x:34,y:53,s:9},{e:'🧺',x:84,y:78,s:12},{k:'window',x:78,y:24,w:13},{e:'🕰️',x:14,y:22,s:8}],
   zones:[{id:'in-bowl',x:34,y:48},{id:'on-table',x:48,y:51},{id:'under-table',x:40,y:76},{id:'in-basket',x:84,y:72},{id:'next-basket',x:68,y:82},{id:'next-table',x:12,y:78}],
   objects:[{id:'apple',e:'🍎'},{id:'dog',e:'🐶'},{id:'cup',e:'☕'},{id:'bread',e:'🍞'},{id:'milk',e:'🥛'}],
   steps:[{say:"Look! The apple is in the bowl.",o:'apple',z:'in-bowl'},{say:'Oh no! The dog is under the table. Put the dog under the table.',o:'dog',z:'under-table'},
     {say:"Put Mum's cup on the table.",o:'cup',z:'on-table'},{say:'The bread goes in the basket.',o:'bread',z:'in-basket'},
     {say:'And the milk? Put the milk next to the basket.',o:'milk',z:'next-basket'}]},
  {type:'move', title:'In the park', icon:'🌳', bg:'park',
   items:[{e:'🌳',x:22,y:48,s:34},{k:'bench',x:60,y:74,w:24},{k:'pond',x:87,y:82,w:22},{e:'☀️',x:88,y:16,s:9}],
   zones:[{id:'in-tree',x:22,y:32},{id:'under-tree',x:30,y:84},{id:'on-bench',x:60,y:60},{id:'under-bench',x:60,y:84},{id:'in-pond',x:87,y:80},{id:'next-bench',x:44,y:70}],
   objects:[{id:'bird',e:'🐦'},{id:'dog',e:'🐕'},{id:'ball',e:'⚽'},{id:'duck',e:'🦆'},{id:'icecream',e:'🍦'}],
   steps:[{say:'There is a bird in the tree.',o:'bird',z:'in-tree'},{say:'The dog is sleeping under the tree.',o:'dog',z:'under-tree'},
     {say:'Put the ball under the bench.',o:'ball',z:'under-bench'},{say:'Can you see the duck? It is in the water.',o:'duck',z:'in-pond'},
     {say:"And my ice cream is on the bench.",o:'icecream',z:'on-bench'}]},
  {type:'move', title:'In the classroom', icon:'🏫', bg:'class',
   items:[{k:'board',x:56,y:24,w:40},{k:'table',x:32,y:72,w:28},{e:'🪑',x:70,y:72,s:14},{e:'🗑️',x:91,y:80,s:9}],
   zones:[{id:'on-desk',x:32,y:53},{id:'under-desk',x:32,y:77},{id:'on-chair',x:70,y:58},{id:'under-chair',x:70,y:86},{id:'in-bin',x:91,y:76},{id:'next-bin',x:82,y:62}],
   objects:[{id:'book',e:'📗'},{id:'bag',e:'🎒'},{id:'pencil',e:'✏️'},{id:'paper',e:'📄'},{id:'ruler',e:'📏'}],
   steps:[{say:"Your book is on the desk.",o:'book',z:'on-desk'},{say:'Put your bag under the chair.',o:'bag',z:'under-chair'},
     {say:'Put the pencil on the chair.',o:'pencil',z:'on-chair'},{say:'This paper is old. Put it in the bin.',o:'paper',z:'in-bin'},
     {say:'And the ruler goes under the desk.',o:'ruler',z:'under-desk'}]},
  {type:'lines', title:'Fun in the park', icon:'🪁', bg:'park',
   names:['Ben','Anna','Sam','Mrs Brown','Tom','Lucy'],
   people:[{id:'p1',e:'👦',p:'🪁',x:12,y:60},{id:'p2',e:'👧',p:'🍦',x:29,y:72},{id:'p3',e:'🧒',p:'🚲',x:47,y:62},{id:'p4',e:'👩',p:'📖',x:65,y:74},{id:'p5',e:'👴',p:'🐕',x:83,y:62},{id:'p6',e:'👧',p:'⚽',x:89,y:84}],
   steps:[{say:"Hello! I'm Ben. I'm flying my kite.",n:'Ben',to:'p1'},{say:'Anna is eating an ice cream. She loves ice cream!',n:'Anna',to:'p2'},
     {say:"Who's that on the bike? That's Sam.",n:'Sam',to:'p3'},{say:'Look at Mrs Brown. She is reading a book.',n:'Mrs Brown',to:'p4'},
     {say:'And that is Grandpa Tom with his dog.',n:'Tom',to:'p5'}]},
  {type:'lines', title:'At the beach', icon:'🏖️', bg:'beach',
   names:['Jill','Dan','Alex','Mum','Grandma','Nick'],
   people:[{id:'p1',e:'🏊',p:'',x:16,y:76},{id:'p2',e:'😎',p:'📰',x:34,y:62},{id:'p3',e:'🧒',p:'🏰',x:52,y:78},{id:'p4',e:'👩',p:'🎣',x:70,y:60},{id:'p5',e:'👵',p:'😴',x:86,y:76},{id:'p6',e:'👦',p:'🏐',x:89,y:50}],
   steps:[{say:"I'm Jill. I'm swimming in the sea.",n:'Jill',to:'p1'},{say:'Dan is wearing sunglasses. He is reading a newspaper.',n:'Dan',to:'p2'},
     {say:'Alex is making a sandcastle.',n:'Alex',to:'p3'},{say:"Look, there's Mum! She's fishing.",n:'Mum',to:'p4'},
     {say:'And Grandma is sleeping.',n:'Grandma',to:'p5'}]},
  {type:'lines', title:'The birthday party', icon:'🎂', bg:'party',
   names:['May','Jack','Lily','Mr Green','Pat','Bill'],
   people:[{id:'p1',e:'👧',p:'🎂',x:14,y:70},{id:'p2',e:'👦',p:'🎈',x:32,y:60},{id:'p3',e:'🧒',p:'🎁',x:50,y:74},{id:'p4',e:'👨',p:'📷',x:68,y:60},{id:'p5',e:'👩',p:'🥤',x:85,y:72},{id:'p6',e:'👦',p:'🎩',x:89,y:44}],
   steps:[{say:"It's May's birthday. May is eating cake.",n:'May',to:'p1'},{say:'Jack has got three balloons.',n:'Jack',to:'p2'},
     {say:'Lily is opening a present.',n:'Lily',to:'p3'},{say:'Mr Green is taking a photo.',n:'Mr Green',to:'p4'},
     {say:'And Pat is drinking orange juice.',n:'Pat',to:'p5'}]},
  {type:'tick', title:'Where is it?', icon:'📍',
   qs:[{say:"Where's the cat? The cat is on the chair.",o:[{f:'🪑',o:'🐱',p:'on'},{f:'🪑',o:'🐱',p:'under'},{f:'🪑',o:'🐱',p:'next'}],a:0},
     {say:"Where's my ball? It's in the box.",o:[{f:'table',o:'⚽',p:'under'},{f:'📦',o:'⚽',p:'next'},{f:'📦',o:'⚽',p:'in'}],a:2},
     {say:'The dog is under the table.',o:[{f:'table',o:'🐶',p:'under'},{f:'table',o:'🐶',p:'next'},{f:'🛏️',o:'🐶',p:'on'}],a:0},
     {say:'My book is on the bed.',o:[{f:'🪑',o:'📕',p:'under'},{f:'🛏️',o:'📕',p:'on'},{f:'🎒',o:'📕',p:'in'}],a:1},
     {say:'The bird is next to the tree.',o:[{f:'🌳',o:'🐦',p:'in'},{f:'🌳',o:'🐦',p:'under'},{f:'🌳',o:'🐦',p:'next'}],a:2}]},
  {type:'tick', title:'How many?', icon:'🍎',
   qs:[{say:'How many apples are there? There are three apples.',o:['🍎🍎','🍎🍎🍎','🍎🍎🍎🍎'],a:1},
     {say:"I've got two cats.",o:['🐱🐱','🐶🐶','🐱🐱🐱'],a:0},
     {say:'There are four books on my desk.',o:['📕📕📕','✏️✏️✏️✏️','📕📕📕📕'],a:2},
     {say:"I'd like a banana and an orange, please.",o:['🍌🍎','🍌🍊','🍐🍊'],a:1},
     {say:'My brother has got five balloons.',o:['🎈🎈🎈','🪁🪁🪁🪁🪁','🎈🎈🎈🎈🎈'],a:2}]},
  {type:'tick', title:'What are they doing?', icon:'🏃',
   qs:[{say:"What's Tom doing? He's brushing his teeth.",o:['🧒🦷','🧒🍽️','🧒🛏️'],a:0},
     {say:'Look at Kim. She is reading a book.',o:['👧📺','👧📖','👧🎨'],a:1},
     {say:'Dad is cooking dinner in the kitchen.',o:['👨🚗','👨📰','👨‍🍳🍳'],a:2},
     {say:'My sister is riding her bike.',o:['👧🚲','👧🛴','👧🏊'],a:0},
     {say:'The children are playing football.',o:['🧒🏀🧒','🧒⚽🧒','🧒🎾🧒'],a:1}]},
  {type:'colour', title:'Colour the toys', icon:'🧸',
   shapes:['star','ball','kite','fish','balloon','car'],
   steps:[{say:'Can you see the star? Colour it yellow.',s:'star',c:'yellow'},{say:'Colour the ball red.',s:'ball',c:'red'},
     {say:'Now the kite. Make the kite blue.',s:'kite',c:'blue'},{say:'The fish is orange. Colour the fish orange.',s:'fish',c:'orange'},
     {say:'And colour the balloon green.',s:'balloon',c:'green'}]},
  {type:'colour', title:'Colour the clothes', icon:'👕',
   shapes:['hat','tshirt','sock','dress','bag','shoe'],
   steps:[{say:"Look at the hat. It's brown.",s:'hat',c:'brown'},{say:'Colour the T-shirt green.',s:'tshirt',c:'green'},
     {say:'The sock is purple.',s:'sock',c:'purple'},{say:'Colour the dress pink, please.',s:'dress',c:'pink'},
     {say:'And my bag is blue.',s:'bag',c:'blue'}]},
  {type:'number', title:'My day', icon:'⏰',
   pics:[{id:'a',e:'⏰🛏️',t:'getting up'},{id:'b',e:'🥣🍞',t:'breakfast'},{id:'c',e:'🚌🏫',t:'bus to school'},{id:'d',e:'✏️📓',t:'homework'},{id:'e',e:'⚽🥅',t:'football'},{id:'f',e:'🛁🧼',t:'bath'}],
   steps:[{say:"Number one. Hi, I'm Max. I get up at seven o'clock.",p:'a'},{say:'Number two. I have breakfast with my mum.',p:'b'},
     {say:'Number three. I go to school by bus.',p:'c'},{say:'Number four. After school, I play football with my friends.',p:'e'},
     {say:'Number five. In the evening, I do my homework.',p:'d'}]},
  {type:'number', title:'Around the town', icon:'🏙️',
   pics:[{id:'a',e:'🛒🍎',t:'supermarket'},{id:'b',e:'🏥🩺',t:'doctor'},{id:'c',e:'🍕🍽️',t:'restaurant'},{id:'d',e:'🎬🍿',t:'cinema'},{id:'e',e:'🏊💦',t:'swimming pool'},{id:'f',e:'📚🤫',t:'library'}],
   steps:[{say:"Number one. We're buying fruit at the supermarket.",p:'a'},{say:"Number two. I'm swimming at the swimming pool.",p:'e'},
     {say:"Number three. We're eating pizza in a restaurant.",p:'c'},{say:"Number four. We're watching a film. I love popcorn!",p:'d'},
     {say:'Number five. Shh! We are reading books in the library.',p:'f'}]},
  // A1 · Names and describing people: listen and draw lines from the names to the people (one example).
  {type:'lines', group:'A1 listening', title:'People in the park', icon:'👩‍🦰', bg:'park', v:9,
   names:['Mr Brown','Anna','Tom','Lily','Grandma Rose','Sam','Ben'],
   people:[{id:'p1',e:'👨‍🦳',p:'📰',x:12,y:60},{id:'p2',e:'👩‍🦰',p:'🐕',x:29,y:72},{id:'p3',e:'🧔',p:'🚲',x:47,y:62},{id:'p4',e:'👧',p:'🍦',x:64,y:74},{id:'p5',e:'👵',p:'',x:80,y:60},{id:'p6',e:'👦',p:'⚽',x:89,y:84}],
   steps:[{say:"Can you see Mr Brown? He's got white hair. He's reading a newspaper.",n:'Mr Brown',to:'p1'},
     {say:"Look at the woman with long red hair. That's Anna. She's walking her dog.",n:'Anna',to:'p2'},
     {say:"The man with the beard is Tom. He's riding his bike.",n:'Tom',to:'p3'},
     {say:"Who's the little girl with the ice cream? Oh, that's Lily.",n:'Lily',to:'p4'},
     {say:"And the old woman with white hair and glasses is Grandma Rose.",n:'Grandma Rose',to:'p5'},
     {say:"Sam is the boy with the football. He loves football!",n:'Sam',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'People at the party', icon:'🧔', bg:'party', v:9,
   names:['Sophie','Kate','Mr Green','Uncle Jack','Mia','Harry','Leo'],
   people:[{id:'p1',e:'👩‍🦱',p:'🎂',x:13,y:68},{id:'p2',e:'👱‍♀️',p:'🎈',x:30,y:58},{id:'p3',e:'👨‍🦲',p:'📷',x:48,y:72},{id:'p4',e:'🧔',p:'🎸',x:65,y:58},{id:'p5',e:'👧',p:'🎁',x:80,y:76},{id:'p6',e:'👨‍🦰',p:'🥤',x:90,y:46}],
   steps:[{say:"Sophie has got curly black hair. She's cutting the birthday cake.",n:'Sophie',to:'p1'},
     {say:"Kate is the woman with long fair hair. She's holding a balloon.",n:'Kate',to:'p2'},
     {say:"Mr Green hasn't got any hair! He's taking photos.",n:'Mr Green',to:'p3'},
     {say:"Look at Uncle Jack. He's got a beard and he's playing the guitar.",n:'Uncle Jack',to:'p4'},
     {say:"Mia is the little girl with the present.",n:'Mia',to:'p5'},
     {say:"And the man with short red hair is Harry. He's drinking juice.",n:'Harry',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'People at school', icon:'👩‍🏫', bg:'class', v:9,
   names:['Miss White','Mr Clark','Jack','Emma','Ali','Mr Fox','Zoe'],
   people:[{id:'p1',e:'👩‍🏫',p:'📚',x:13,y:62},{id:'p2',e:'👨‍🦳',p:'🧹',x:30,y:74},{id:'p3',e:'👦',p:'🧢',x:47,y:60},{id:'p4',e:'👧',p:'👓',x:64,y:74},{id:'p5',e:'🧒',p:'🎒',x:80,y:60},{id:'p6',e:'👱',p:'⚽',x:89,y:82}],
   steps:[{say:"Miss White is our teacher. She's got a lot of books.",n:'Miss White',to:'p1'},
     {say:"Mr Clark has got white hair. He's cleaning the floor.",n:'Mr Clark',to:'p2'},
     {say:"Jack is the boy with the blue cap.",n:'Jack',to:'p3'},
     {say:"Can you see Emma? She's the girl with glasses.",n:'Emma',to:'p4'},
     {say:"Ali has got a big school bag.",n:'Ali',to:'p5'},
     {say:"And Mr Fox has got short fair hair. He's our football teacher.",n:'Mr Fox',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'People at the beach', icon:'🕶️', bg:'beach', v:10,
   names:['Lucy','Mr Hill','Jane','Paul','Grandpa Joe','Kim','Max'],
   people:[{id:'p1',e:'👩‍🦱',p:'🕶️',x:12,y:72},{id:'p2',e:'🧔',p:'🎣',x:29,y:60},{id:'p3',e:'👱‍♀️',p:'📖',x:46,y:76},{id:'p4',e:'👨‍🦲',p:'🏐',x:63,y:62},{id:'p5',e:'👴',p:'🍦',x:79,y:76},{id:'p6',e:'👧',p:'🏰',x:90,y:58}],
   steps:[{say:"Lucy has got curly black hair. She's wearing sunglasses.",n:'Lucy',to:'p1'},
     {say:"Can you see the man with the beard? That's Mr Hill. He's fishing.",n:'Mr Hill',to:'p2'},
     {say:"Jane has got long fair hair. She's reading a book.",n:'Jane',to:'p3'},
     {say:"Paul hasn't got any hair. He's playing with a ball.",n:'Paul',to:'p4'},
     {say:"Look at Grandpa Joe. He's old and he's got glasses. He's eating an ice cream.",n:'Grandpa Joe',to:'p5'},
     {say:"And the little girl is Kim. She's making a sandcastle.",n:'Kim',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'My family at home', icon:'🏠', bg:'room', v:10,
   names:['Dad','Mum','Grandma','Uncle Tim','Ben','Amy','Aunt Sue'],
   people:[{id:'p1',e:'👨',p:'📺',x:12,y:66},{id:'p2',e:'👩‍🦰',p:'🍲',x:29,y:76},{id:'p3',e:'👵',p:'☕',x:46,y:62},{id:'p4',e:'🧔',p:'🎮',x:63,y:76},{id:'p5',e:'👦',p:'🐱',x:79,y:62},{id:'p6',e:'👧',p:'🎨',x:90,y:82}],
   steps:[{say:"This is my dad. He's got short black hair. He's watching TV.",n:'Dad',to:'p1'},
     {say:"My mum has got long red hair. She's cooking dinner.",n:'Mum',to:'p2'},
     {say:"Grandma has got white hair and glasses. She's drinking a cup of tea.",n:'Grandma',to:'p3'},
     {say:"Uncle Tim has got a beard. He's playing a computer game.",n:'Uncle Tim',to:'p4'},
     {say:"My brother Ben is playing with our cat.",n:'Ben',to:'p5'},
     {say:"And my little sister Amy is painting a picture.",n:'Amy',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'People at the street market', icon:'🛍️', bg:'street', v:10,
   names:['Mr Lee','Mrs Smith','Carlos','Sara','Grandad Fred','Noah','Ella'],
   people:[{id:'p1',e:'👨‍🦳',p:'🍎',x:12,y:70},{id:'p2',e:'👱‍♀️',p:'🛍️',x:29,y:58},{id:'p3',e:'👨‍🦰',p:'🚲',x:46,y:74},{id:'p4',e:'👩‍🦱',p:'📱',x:63,y:58},{id:'p5',e:'👴',p:'🐕',x:79,y:74},{id:'p6',e:'🧒',p:'🛴',x:90,y:56}],
   steps:[{say:"Mr Lee has got white hair. He's selling apples.",n:'Mr Lee',to:'p1'},
     {say:"Mrs Smith is the woman with long fair hair. She's got a lot of shopping bags.",n:'Mrs Smith',to:'p2'},
     {say:"Carlos has got short red hair. He's riding his bike.",n:'Carlos',to:'p3'},
     {say:"Look at Sara. She's got curly black hair. She's talking on her phone.",n:'Sara',to:'p4'},
     {say:"Grandad Fred is walking his dog.",n:'Grandad Fred',to:'p5'},
     {say:"And the child on the scooter is Noah.",n:'Noah',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'People at the zoo', icon:'🦒', bg:'park', v:11,
   names:['Olivia','Mr Ward','Rachel','Peter','Granny May','Leo','Dan'],
   people:[{id:'p1',e:'👩‍🦰',p:'📷',x:12,y:66},{id:'p2',e:'🧔',p:'🍌',x:29,y:76},{id:'p3',e:'👱‍♀️',p:'🎈',x:46,y:60},{id:'p4',e:'👨‍🦲',p:'🗺️',x:63,y:76},{id:'p5',e:'👵',p:'🥪',x:79,y:60},{id:'p6',e:'👦',p:'🧢',x:90,y:82}],
   steps:[{say:"Olivia has got long red hair. She's taking a photo of the lions.",n:'Olivia',to:'p1'},
     {say:"The man with the beard is Mr Ward. He's giving bananas to the monkeys.",n:'Mr Ward',to:'p2'},
     {say:"Rachel has got long fair hair. She's got a balloon.",n:'Rachel',to:'p3'},
     {say:"Peter hasn't got any hair. He's looking at a map.",n:'Peter',to:'p4'},
     {say:"Granny May has got white hair and glasses. She's eating a sandwich.",n:'Granny May',to:'p5'},
     {say:"And Leo is the boy with the cap.",n:'Leo',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'People at the café', icon:'☕', bg:'room', v:11,
   names:['Mr Jones','Helen','Chris','Maria','Grandpa Ted','Ruby','Josh'],
   people:[{id:'p1',e:'👨‍🦳',p:'☕',x:12,y:62},{id:'p2',e:'👩‍🦱',p:'🍰',x:29,y:76},{id:'p3',e:'👨‍🦰',p:'💻',x:46,y:62},{id:'p4',e:'👱‍♀️',p:'📱',x:63,y:76},{id:'p5',e:'👴',p:'📰',x:79,y:60},{id:'p6',e:'👧',p:'🥤',x:90,y:82}],
   steps:[{say:"Mr Jones has got white hair. He's drinking a cup of coffee.",n:'Mr Jones',to:'p1'},
     {say:"Helen has got curly black hair. She's eating a piece of cake.",n:'Helen',to:'p2'},
     {say:"Chris is the man with short red hair. He's working on his computer.",n:'Chris',to:'p3'},
     {say:"Maria has got long fair hair. She's talking on her phone.",n:'Maria',to:'p4'},
     {say:"Grandpa Ted is wearing glasses. He's reading a newspaper.",n:'Grandpa Ted',to:'p5'},
     {say:"And the little girl drinking orange juice is Ruby.",n:'Ruby',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'Sports in the park', icon:'🎾', bg:'park', v:11,
   names:['Mr Moss','Laura','Simon','Nina','Grandad Ray','Toby','Fay'],
   people:[{id:'p1',e:'🧔',p:'🎾',x:12,y:70},{id:'p2',e:'👩‍🦰',p:'🏀',x:29,y:58},{id:'p3',e:'👨‍🦲',p:'🏓',x:46,y:74},{id:'p4',e:'👩‍🦱',p:'🛹',x:63,y:58},{id:'p5',e:'👨‍🦳',p:'👟',x:79,y:74},{id:'p6',e:'🧒',p:'🪁',x:90,y:56}],
   steps:[{say:"Mr Moss has got a beard. He's playing tennis.",n:'Mr Moss',to:'p1'},
     {say:"Laura is the woman with red hair. She's playing basketball.",n:'Laura',to:'p2'},
     {say:"Simon hasn't got any hair. He's playing table tennis.",n:'Simon',to:'p3'},
     {say:"Nina has got curly black hair. She's on her skateboard.",n:'Nina',to:'p4'},
     {say:"Grandad Ray has got white hair. He's going running in his new trainers.",n:'Grandad Ray',to:'p5'},
     {say:"And Toby is flying his kite.",n:'Toby',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'People at the train station', icon:'🚆', bg:'street', v:12,
   names:['Mr King','Lisa','Omar','Julia','Grandma Pat','Finn','Hugo'],
   people:[{id:'p1',e:'👨‍🦳',p:'💼',x:12,y:70},{id:'p2',e:'👩‍🦰',p:'☂️',x:29,y:58},{id:'p3',e:'🧔',p:'🍫',x:46,y:74},{id:'p4',e:'👱‍♀️',p:'🎧',x:63,y:58},{id:'p5',e:'👵',p:'💐',x:79,y:74},{id:'p6',e:'👦',p:'🎒',x:90,y:56}],
   steps:[{say:"Mr King has got white hair. He's carrying a big bag for work.",n:'Mr King',to:'p1'},
     {say:"Lisa is the woman with long red hair. She's got an umbrella.",n:'Lisa',to:'p2'},
     {say:"Omar has got a beard. He's eating some chocolate.",n:'Omar',to:'p3'},
     {say:"Julia has got long fair hair. She's listening to music.",n:'Julia',to:'p4'},
     {say:"Grandma Pat has got glasses and white hair. She's got some flowers.",n:'Grandma Pat',to:'p5'},
     {say:"And the boy with the school bag is Finn.",n:'Finn',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'People at the library', icon:'📚', bg:'class', v:12,
   names:['Mrs Bell','Adam','Grace','Mr Shaw','Holly','Sami','Iris'],
   people:[{id:'p1',e:'👩',p:'📚',x:12,y:62},{id:'p2',e:'👨‍🦲',p:'💻',x:29,y:76},{id:'p3',e:'👩‍🦱',p:'✏️',x:46,y:62},{id:'p4',e:'🧔',p:'📖',x:63,y:76},{id:'p5',e:'👱‍♀️',p:'🎧',x:79,y:60},{id:'p6',e:'🧒',p:'🖍️',x:90,y:82}],
   steps:[{say:"Mrs Bell works in the library. She's carrying a lot of books.",n:'Mrs Bell',to:'p1'},
     {say:"Adam hasn't got any hair. He's using a computer.",n:'Adam',to:'p2'},
     {say:"Grace has got curly black hair. She's writing a story.",n:'Grace',to:'p3'},
     {say:"Mr Shaw has got a beard. He's reading a big book.",n:'Mr Shaw',to:'p4'},
     {say:"Holly is the girl with long fair hair. She's listening to music.",n:'Holly',to:'p5'},
     {say:"And Sami is drawing a picture.",n:'Sami',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'People at the swimming pool', icon:'🏊', bg:'pool', v:12,
   names:['Coach Mike','Rosa','Ethan','Megan','Grandpa Al','Zack','Bella'],
   people:[{id:'p1',e:'👨‍🦲',p:'📣',x:12,y:86},{id:'p2',e:'👩‍🦰',p:'🕶️',x:29,y:84},{id:'p3',e:'👱',p:'🏐',x:46,y:60},{id:'p4',e:'👩‍🦱',p:'🍹',x:63,y:86},{id:'p5',e:'👴',p:'📰',x:79,y:84},{id:'p6',e:'👦',p:'🐬',x:88,y:60}],
   steps:[{say:"Coach Mike hasn't got any hair. He's shouting: swim faster!",n:'Coach Mike',to:'p1'},
     {say:"Rosa has got long red hair. She's wearing sunglasses.",n:'Rosa',to:'p2'},
     {say:"Ethan has got short fair hair. He's playing with a ball in the water.",n:'Ethan',to:'p3'},
     {say:"Megan has got curly black hair. She's having a cold drink.",n:'Megan',to:'p4'},
     {say:"Grandpa Al is reading the newspaper next to the pool.",n:'Grandpa Al',to:'p5'},
     {say:"And Zack is in the water with his toy dolphin.",n:'Zack',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'People at the supermarket', icon:'🛒', bg:'kitchen', v:13,
   names:['Mrs Hall','Kevin','Lena','Mr Cole','Grandma Joy','Ivy','Ray'],
   people:[{id:'p1',e:'👩‍🦱',p:'🛒',x:12,y:66},{id:'p2',e:'👨‍🦰',p:'🍌',x:29,y:78},{id:'p3',e:'👱‍♀️',p:'🥛',x:46,y:62},{id:'p4',e:'🧔',p:'🍕',x:63,y:78},{id:'p5',e:'👵',p:'🧀',x:79,y:60},{id:'p6',e:'👧',p:'🍭',x:90,y:82}],
   steps:[{say:"Mrs Hall has got curly black hair. She's pushing a shopping trolley.",n:'Mrs Hall',to:'p1'},
     {say:"Kevin has got short red hair. He's buying some bananas.",n:'Kevin',to:'p2'},
     {say:"Lena is the woman with long fair hair. She's got a bottle of milk.",n:'Lena',to:'p3'},
     {say:"Mr Cole has got a beard. He's buying a pizza for dinner.",n:'Mr Cole',to:'p4'},
     {say:"Grandma Joy has got white hair and glasses. She likes cheese.",n:'Grandma Joy',to:'p5'},
     {say:"And the little girl with the lollipop is Ivy.",n:'Ivy',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'People at the campsite', icon:'⛺', bg:'park', v:13,
   names:['Mr Dean','Fiona','Tariq','Amber','Grandad Bob','Theo','Cara'],
   people:[{id:'p1',e:'🧔',p:'⛺',x:12,y:66},{id:'p2',e:'👩‍🦰',p:'🔦',x:29,y:78},{id:'p3',e:'👨‍🦲',p:'🔥',x:46,y:62},{id:'p4',e:'👩‍🦱',p:'🎸',x:63,y:78},{id:'p5',e:'👨‍🦳',p:'🎣',x:79,y:62},{id:'p6',e:'👦',p:'🐸',x:90,y:82}],
   steps:[{say:"Mr Dean has got a beard. He's putting up the tent.",n:'Mr Dean',to:'p1'},
     {say:"Fiona has got long red hair. She's got a torch.",n:'Fiona',to:'p2'},
     {say:"Tariq hasn't got any hair. He's making a fire.",n:'Tariq',to:'p3'},
     {say:"Amber has got curly black hair. She's playing the guitar.",n:'Amber',to:'p4'},
     {say:"Grandad Bob has got white hair. He's fishing in the river.",n:'Grandad Bob',to:'p5'},
     {say:"And Theo is the boy with the frog!",n:'Theo',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'People at the bus stop', icon:'🚏', bg:'street', v:13,
   names:['Mrs Ford','Jamal','Daisy','Mr Price','Grandpa Lou','Mila','Owen'],
   people:[{id:'p1',e:'👵',p:'🐩',x:12,y:70},{id:'p2',e:'👨‍🦲',p:'🍔',x:29,y:58},{id:'p3',e:'👩‍🦰',p:'📱',x:46,y:74},{id:'p4',e:'👨‍🦳',p:'☂️',x:63,y:58},{id:'p5',e:'🧔',p:'👜',x:79,y:74},{id:'p6',e:'🧒',p:'🧸',x:90,y:56}],
   steps:[{say:"Mrs Ford is old. She's got glasses and a small grey dog.",n:'Mrs Ford',to:'p1'},
     {say:"Jamal hasn't got any hair. He's eating a burger.",n:'Jamal',to:'p2'},
     {say:"Daisy has got long red hair. She's looking at her phone.",n:'Daisy',to:'p3'},
     {say:"Mr Price has got white hair. He's got an umbrella.",n:'Mr Price',to:'p4'},
     {say:"Grandpa Lou has got a beard. He's carrying a bag.",n:'Grandpa Lou',to:'p5'},
     {say:"And Mila is the little child with the teddy bear.",n:'Mila',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:"At the doctor's", icon:'🩺', bg:'room', v:14,
   names:['Dr Patel','Nurse Kim','Mr Grey','Sally','Grandma Edna','Jake','Lola'],
   people:[{id:'p1',e:'🧔',p:'🩺',x:12,y:64},{id:'p2',e:'👩‍🦱',p:'📋',x:29,y:78},{id:'p3',e:'👨‍🦳',p:'🌡️',x:46,y:62},{id:'p4',e:'👱‍♀️',p:'💊',x:63,y:78},{id:'p5',e:'👵',p:'📖',x:79,y:60},{id:'p6',e:'👦',p:'🦷',x:90,y:82}],
   steps:[{say:"Dr Patel is the doctor. He's got a beard.",n:'Dr Patel',to:'p1'},
     {say:"Nurse Kim has got curly black hair. She's writing our names.",n:'Nurse Kim',to:'p2'},
     {say:"Mr Grey has got white hair. He's very hot. He's got a temperature.",n:'Mr Grey',to:'p3'},
     {say:"Sally has got long fair hair. She's got some medicine.",n:'Sally',to:'p4'},
     {say:"Grandma Edna has got glasses. She's reading a magazine.",n:'Grandma Edna',to:'p5'},
     {say:"And Jake is the boy with toothache. Poor Jake!",n:'Jake',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'At the museum', icon:'🦖', bg:'class', v:14,
   names:['Mr Olsen','Priya','Luke','Hannah','Grandad Sid','Elsie','Mo'],
   people:[{id:'p1',e:'👨‍🦳',p:'🦖',x:12,y:66},{id:'p2',e:'👩‍🦰',p:'📷',x:29,y:78},{id:'p3',e:'👨‍🦲',p:'🗺️',x:46,y:62},{id:'p4',e:'👩‍🦱',p:'🖼️',x:63,y:78},{id:'p5',e:'🧔',p:'🎟️',x:79,y:62},{id:'p6',e:'👧',p:'🦕',x:90,y:82}],
   steps:[{say:"Mr Olsen has got white hair. He's looking at the big dinosaur.",n:'Mr Olsen',to:'p1'},
     {say:"Priya has got long red hair. She's taking photos.",n:'Priya',to:'p2'},
     {say:"Luke hasn't got any hair. He's looking at the museum map.",n:'Luke',to:'p3'},
     {say:"Hannah has got curly black hair. She's looking at a picture.",n:'Hannah',to:'p4'},
     {say:"Grandad Sid has got a beard. He's got the tickets.",n:'Grandad Sid',to:'p5'},
     {say:"And the little girl with the toy dinosaur is Elsie.",n:'Elsie',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'In the garden', icon:'🌻', bg:'park', v:14,
   names:['Mr Brook','Ruth','Sean','Clara','Granny Bea','Alfie','Nell'],
   people:[{id:'p1',e:'🧔',p:'🌻',x:12,y:70},{id:'p2',e:'👩‍🦰',p:'🍎',x:29,y:58},{id:'p3',e:'👨‍🦲',p:'🔨',x:46,y:74},{id:'p4',e:'👱‍♀️',p:'🐱',x:63,y:58},{id:'p5',e:'👵',p:'🌹',x:79,y:74},{id:'p6',e:'👦',p:'🐛',x:90,y:56}],
   steps:[{say:"Mr Brook has got a beard. He's got a big sunflower.",n:'Mr Brook',to:'p1'},
     {say:"Ruth has got long red hair. She's picking apples.",n:'Ruth',to:'p2'},
     {say:"Sean hasn't got any hair. He's making a bird house.",n:'Sean',to:'p3'},
     {say:"Clara has got long fair hair. She's playing with the cat.",n:'Clara',to:'p4'},
     {say:"Granny Bea has got glasses and white hair. She loves her red roses.",n:'Granny Bea',to:'p5'},
     {say:"And Alfie is looking at a little green caterpillar.",n:'Alfie',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'At the airport', icon:'✈️', bg:'street', v:15,
   names:['Captain Reed','Erin','Mr Wu','Tessa','Grandpa Gus','Jonah','Kara'],
   people:[{id:'p1',e:'👨‍🦳',p:'✈️',x:12,y:66},{id:'p2',e:'👩‍🦰',p:'🧳',x:29,y:78},{id:'p3',e:'🧔',p:'🍩',x:46,y:60},{id:'p4',e:'👩‍🦱',p:'🕶️',x:63,y:78},{id:'p5',e:'👴',p:'🧢',x:79,y:60},{id:'p6',e:'👦',p:'🎮',x:90,y:82}],
   steps:[{say:"Captain Reed has got white hair. He's the pilot of the plane.",n:'Captain Reed',to:'p1'},
     {say:"Erin has got long red hair. She's got a big suitcase.",n:'Erin',to:'p2'},
     {say:"Mr Wu has got a beard. He's eating a doughnut.",n:'Mr Wu',to:'p3'},
     {say:"Tessa has got curly black hair. She's wearing sunglasses.",n:'Tessa',to:'p4'},
     {say:"Grandpa Gus is wearing a blue cap.",n:'Grandpa Gus',to:'p5'},
     {say:"And Jonah is playing a computer game.",n:'Jonah',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'At the wedding', icon:'💐', bg:'party', v:15,
   names:['Rose','Daniel','Aunt Mary','Uncle Ken','Grandma Iris','Poppy','Will'],
   people:[{id:'p1',e:'👱‍♀️',p:'💐',x:12,y:64},{id:'p2',e:'👨‍🦰',p:'🎩',x:29,y:78},{id:'p3',e:'👩‍🦱',p:'📷',x:46,y:62},{id:'p4',e:'🧔',p:'🎻',x:63,y:78},{id:'p5',e:'👵',p:'🍰',x:79,y:60},{id:'p6',e:'👧',p:'🎈',x:90,y:82}],
   steps:[{say:"Rose has got long fair hair. She's got some beautiful flowers.",n:'Rose',to:'p1'},
     {say:"Daniel has got short red hair. He's wearing a tall black hat.",n:'Daniel',to:'p2'},
     {say:"Aunt Mary has got curly black hair. She's taking photos.",n:'Aunt Mary',to:'p3'},
     {say:"Uncle Ken has got a beard. He's playing the violin.",n:'Uncle Ken',to:'p4'},
     {say:"Grandma Iris has got white hair and glasses. She's eating a piece of cake.",n:'Grandma Iris',to:'p5'},
     {say:"And Poppy is the little girl with the balloon.",n:'Poppy',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'At the restaurant', icon:'🍝', bg:'room', v:15,
   names:['Marco','Leah','Mr Hart','Zara','Grandad Vic','Arlo','Jade'],
   people:[{id:'p1',e:'👨‍🦲',p:'🍝',x:12,y:70},{id:'p2',e:'👩‍🦰',p:'🥗',x:29,y:58},{id:'p3',e:'👨‍🦳',p:'🍜',x:46,y:74},{id:'p4',e:'👩‍🦱',p:'🧁',x:63,y:58},{id:'p5',e:'🧔',p:'🍔',x:79,y:74},{id:'p6',e:'🧒',p:'🍦',x:90,y:56}],
   steps:[{say:"Marco is the cook. He hasn't got any hair. He's making spaghetti.",n:'Marco',to:'p1'},
     {say:"Leah has got long red hair. She's eating a salad.",n:'Leah',to:'p2'},
     {say:"Mr Hart has got white hair. He's having some soup.",n:'Mr Hart',to:'p3'},
     {say:"Zara has got curly black hair. She's eating a cupcake.",n:'Zara',to:'p4'},
     {say:"Grandad Vic has got a beard. He's eating a big burger.",n:'Grandad Vic',to:'p5'},
     {say:"And Arlo has got an ice cream.",n:'Arlo',to:'p6'}]},
  // A1 · Names, spellings and other information: listen and fill in the form (one example).
  {type:'write', group:'A1 listening', examples:1, how:'Listen and write the missing information on the form.', title:'Joining the sports club', icon:'🏅', v:16,
   qs:[{q:'Name:', a:'Amy Carter', say:[{w:'w',t:'Hello. Can I have your name, please?'},{w:'g',t:"It's Amy Carter."},{w:'w',t:'How do you spell Carter?'},{w:'g',t:'C, A, R, T, E, R.'}]},
     {q:'Lives at:', pre:'12', post:'Road', a:'Oak', say:[{w:'w',t:'And where do you live, Amy?'},{w:'g',t:'At number twelve, Oak Road.'},{w:'w',t:'Oak? Is that O, A, K?'},{w:'g',t:'Yes, that’s right.'}]},
     {q:'Age:', a:'10', say:[{w:'w',t:'How old are you?'},{w:'g',t:"I'm ten. My brother is eight."}]},
     {q:'Favourite sport:', a:'swimming', say:[{w:'w',t:"What's your favourite sport?"},{w:'g',t:'I love swimming. I go every weekend.'}]},
     {q:'Can also play:', a:'tennis', say:[{w:'w',t:'Can you play any other sports?'},{w:'g',t:"Yes, I can play tennis. I can't play football."}]},
     {q:'Day for lessons:', a:'Tuesday', say:[{w:'w',t:'Which day do you want lessons?'},{w:'g',t:"Tuesday, please. I'm busy on Mondays."}]}]},
  {type:'write', group:'A1 listening', examples:1, how:'Listen and write the missing information on the form.', title:'All about Leo', icon:'🧒', v:16,
   qs:[{q:'Name:', a:'Leo Grant', say:[{w:'m',t:"Hi! What's your name?"},{w:'b',t:"Leo Grant. That's G, R, A, N, T."}]},
     {q:'Age:', a:'9', say:[{w:'m',t:'How old are you, Leo?'},{w:'b',t:"I'm nine. My sister is eleven."}]},
     {q:'Hair colour:', a:'brown', say:[{w:'m',t:'What colour is your hair?'},{w:'b',t:"It's brown. My sister's hair is black."}]},
     {q:'Eye colour:', a:'green', say:[{w:'m',t:'And what colour are your eyes?'},{w:'b',t:"They're green, like my dad's eyes."}]},
     {q:'How many brothers:', a:'2', say:[{w:'m',t:'Have you got any brothers?'},{w:'b',t:"Yes, I've got two brothers."}]},
     {q:'Favourite food:', a:'pizza', say:[{w:'m',t:"What's your favourite food?"},{w:'b',t:"Pizza! I don't like fish."}]}]},
  {type:'write', group:'A1 listening', examples:1, how:'Listen and write the missing information on the form.', title:"At the doctor's", icon:'🩹', v:16,
   qs:[{q:'Name:', a:'Sam Fox', say:[{w:'w',t:"Hello. What's your name?"},{w:'b',t:'Sam Fox. F, O, X.'}]},
     {q:'Lives in:', a:'Bath', say:[{w:'w',t:'Where do you live, Sam?'},{w:'b',t:'I live in Bath.'},{w:'w',t:'How do you spell that?'},{w:'b',t:'B, A, T, H.'}]},
     {q:'Age:', a:'8', say:[{w:'w',t:'And how old are you?'},{w:'b',t:"I'm eight."}]},
     {q:"Mother's name:", a:'Helen', say:[{w:'w',t:"What's your mother's name?"},{w:'b',t:'Helen. H, E, L, E, N.'}]},
     {q:"Father's name:", a:'Mark', say:[{w:'w',t:"And your father's name?"},{w:'b',t:"It's Mark. M, A, R, K."}]},
     {q:'What hurts:', a:'leg', alt:['his leg','my leg','the leg','legs'], say:[{w:'w',t:"So, Sam, what's the problem?"},{w:'b',t:'My leg hurts. I fell off my bike.'}]}]},
  {type:'write', group:'A1 listening', examples:1, how:'Listen and write the missing information.', title:'My sister Kate', icon:'👧', v:17,
   qs:[{q:"Sister's name:", a:'Kate', say:[{w:'w',t:"Tell me about your sister. What's her name?"},{w:'g',t:'Kate. K, A, T, E.'}]},
     {q:'How old:', a:'16', say:[{w:'w',t:'How old is Kate?'},{w:'g',t:"She's sixteen. I'm nine."}]},
     {q:'Where she works:', pre:'in a', a:'café', alt:['cafe'], say:[{w:'w',t:'Has she got a job?'},{w:'g',t:'Yes, she works in a café in town.'}]},
     {q:'How many days she works:', a:'2', say:[{w:'w',t:'Does she work every day?'},{w:'g',t:'No. She works there two days a week, on Saturday and Sunday.'}]},
     {q:'What she does in the evening:', a:'homework', alt:['her homework','does homework','does her homework'], say:[{w:'w',t:'What does she do in the evening?'},{w:'g',t:"She does her homework. She doesn't watch TV."}]},
     {q:'What she plays:', pre:'the', a:'piano', say:[{w:'w',t:'Does Kate play music?'},{w:'g',t:'Yes, she plays the piano. I play the guitar.'}]}]},
  {type:'write', group:'A1 listening', examples:1, how:'Listen and write the missing information.', title:"Tim's birthday", icon:'🎁', v:17,
   qs:[{q:'How old?', a:'8', say:[{w:'m',t:'Happy birthday, Tim! How old are you today?'},{w:'b',t:"I'm eight!"}]},
     {q:'Present from Grandma:', pre:'a', post:'bike', a:'blue', say:[{w:'m',t:'What did Grandma give you?'},{w:'b',t:"A bike! It's a blue bike. My old bike was red."}]},
     {q:'Favourite game:', a:'football', say:[{w:'m',t:"What's your favourite game?"},{w:'b',t:'Football. I play it every day after school.'}]},
     {q:'Present from his sister:', pre:'two', a:'books', alt:['book'], say:[{w:'m',t:'And what did your sister give you?'},{w:'b',t:'Two books about animals.'}]},
     {q:"How old is Tim's sister?", a:'13', say:[{w:'m',t:'How old is your sister?'},{w:'b',t:"She's thirteen."}]},
     {q:"Sister's name:", a:'Zoe', say:[{w:'m',t:"What's her name?"},{w:'b',t:'Zoe. Z, O, E.'}]}]},
  {type:'write', group:'A1 listening', examples:1, how:'Listen and write the missing information.', title:"Ella's favourite things", icon:'📕', v:17,
   qs:[{q:'Favourite book:', a:'The Happy Cat', say:[{w:'w',t:"What's your favourite book, Ella?"},{w:'g',t:"It's called The Happy Cat."}]},
     {q:'Favourite sports:', pre:'dancing,', post:'and running', a:'basketball', say:[{w:'w',t:'What sports do you like?'},{w:'g',t:'I like dancing, basketball and running.'}]},
     {q:'School:', post:'Street School', a:'Mill', say:[{w:'w',t:"What's the name of your school?"},{w:'g',t:'Mill Street School.'},{w:'w',t:'Mill? Is that M, I, L, L?'},{w:'g',t:'Yes, it is.'}]},
     {q:'Best friend: name', pre:'Sophie', a:'Lane', say:[{w:'w',t:"Who's your best friend?"},{w:'g',t:'Sophie Lane. That’s L, A, N, E.'}]},
     {q:'Best friend: how old', a:'11', say:[{w:'w',t:'Is Sophie the same age as you?'},{w:'g',t:"No, she's eleven. I'm ten."}]},
     {q:'Best friend: pet', a:'rabbit', alt:['a rabbit'], say:[{w:'w',t:'Has Sophie got a pet?'},{w:'g',t:"Yes, she's got a rabbit. I've got a cat."}]}]},
  // A1 · Names and everyday activities: draw a line from each day to the right picture (one example).
  {type:'lines', group:'A1 listening', title:'What did Ben do last week?', icon:'🗓️', bg:'cards', voices:['w','b'], v:18,
   how:'What did Ben do last week? Listen and draw a line from the day to the correct picture.',
   names:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
   people:[{id:'p1',e:'🏊',p:'',x:14,y:30},{id:'p2',e:'⚽',p:'',x:38,y:30},{id:'p3',e:'🎬',p:'🍿',x:62,y:30},{id:'p4',e:'🍕',p:'',x:86,y:30},{id:'p5',e:'🚲',p:'',x:26,y:74},{id:'p6',e:'🎂',p:'',x:50,y:74},{id:'p7',e:'🛒',p:'',x:74,y:74}],
   steps:[{say:"What did you do on Monday, Ben? — On Monday I went swimming with my dad.",n:'Monday',to:'p1'},
     {say:'And on Tuesday? — I played football after school.',n:'Tuesday',to:'p2'},
     {say:'What did you do on Wednesday? — I rode my bike in the park.',n:'Wednesday',to:'p5'},
     {say:"Did you go to the cinema on Thursday? — No, I didn't. On Thursday I made a pizza with Mum.",n:'Thursday',to:'p4'},
     {say:'What about Friday? — On Friday we went to the cinema. The film was great!',n:'Friday',to:'p3'},
     {say:"And on Saturday? — On Saturday I went to my friend's birthday party.",n:'Saturday',to:'p6'}]},
  {type:'lines', group:'A1 listening', title:'What did Lucy do last week?', icon:'🎨', bg:'cards', voices:['m','g'], v:18,
   how:'What did Lucy do last week? Listen and draw a line from the day to the correct picture.',
   names:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
   people:[{id:'p1',e:'🎨',p:'',x:14,y:30},{id:'p2',e:'🎹',p:'',x:38,y:30},{id:'p3',e:'🐎',p:'',x:62,y:30},{id:'p4',e:'🍰',p:'',x:86,y:30},{id:'p5',e:'🧺',p:'',x:26,y:74},{id:'p6',e:'📞',p:'',x:50,y:74},{id:'p7',e:'📺',p:'',x:74,y:74}],
   steps:[{say:"What did you do on Monday, Lucy? — I played the piano. I have lessons on Mondays.",n:'Monday',to:'p2'},
     {say:'And on Tuesday? — I painted a picture of my cat.',n:'Tuesday',to:'p1'},
     {say:'What did you do on Wednesday? — I made a cake with my grandma.',n:'Wednesday',to:'p4'},
     {say:"Did you watch TV on Thursday? — No, I didn't. I phoned my cousin in Australia.",n:'Thursday',to:'p6'},
     {say:'And on Friday? — I rode a horse! It was my first time.',n:'Friday',to:'p3'},
     {say:'What about Saturday? — We had a picnic in the park.',n:'Saturday',to:'p5'}]},
  {type:'lines', group:'A1 listening', title:'What did Sam do last week?', icon:'🎸', bg:'cards', voices:['w','b'], v:18,
   how:'What did Sam do last week? Listen and draw a line from the day to the correct picture.',
   names:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
   people:[{id:'p1',e:'🎸',p:'',x:14,y:30},{id:'p2',e:'🏀',p:'',x:38,y:30},{id:'p3',e:'🐕',p:'',x:62,y:30},{id:'p4',e:'🧹',p:'',x:86,y:30},{id:'p5',e:'🎮',p:'',x:26,y:74},{id:'p6',e:'🏖️',p:'',x:50,y:74},{id:'p7',e:'🚌',p:'',x:74,y:74}],
   steps:[{say:"What did you do on Monday, Sam? — I walked our dog. He's called Max.",n:'Monday',to:'p3'},
     {say:'And on Tuesday? — I played basketball at school.',n:'Tuesday',to:'p2'},
     {say:"What did you do on Wednesday? — Mum said, clean your bedroom! So I cleaned my bedroom.",n:'Wednesday',to:'p4'},
     {say:"Did you play computer games on Thursday? — No, I didn't. I played the guitar.",n:'Thursday',to:'p1'},
     {say:'And on Friday? — On Friday I played computer games with my brother.',n:'Friday',to:'p5'},
     {say:'What about Saturday? — We went to the beach. It was very hot!',n:'Saturday',to:'p6'}]},
  {type:'write', group:'A1 listening', examples:1, how:'HOMEWORK DIARY — Listen and write the missing information.', title:'My homework diary', icon:'📓', voices:['w','g'], v:19,
   qs:[{q:'Homework:', a:'Maths', say:[{w:'g',t:"Miss Jones, what's our homework this week?"},{w:'w',t:"It's maths homework."}]},
     {q:'For which day?', a:'Thursday', say:[{w:'g',t:'When do we give it to you?'},{w:'w',t:'On Thursday, please. Not Wednesday.'}]},
     {q:'Page:', a:'20', say:[{w:'g',t:'What do we do?'},{w:'w',t:'Answer the questions on page twenty.'}]},
     {q:'How many questions?', a:'8', say:[{w:'g',t:'All the questions?'},{w:'w',t:'No, only eight questions. There are twelve on the page.'}]},
     {q:'Also bring:', pre:'a', a:'ruler', say:[{w:'w',t:'And bring a ruler to class, please. You don’t need your pencil case.'}]},
     {q:'Book to read:', pre:'‘The', post:'Box’', a:'Magic', say:[{w:'w',t:'Please read the book The Magic Box.'},{w:'g',t:'How do you spell magic?'},{w:'w',t:'M, A, G, I, C.'}]}]},
  {type:'write', group:'A1 listening', examples:1, how:'CITY SPORTS CENTRE — Listen and write the missing information.', title:'City Sports Centre', icon:'💃', v:19,
   qs:[{q:'Name:', a:'Lily Moore', say:[{w:'m',t:"What's your name, please?"},{w:'g',t:'Lily Moore. M, O, O, R, E.'}]},
     {q:'How old:', a:'11', say:[{w:'m',t:'How old are you, Lily?'},{w:'g',t:"I'm eleven."}]},
     {q:'Lives in:', post:'Street', a:'Bridge', say:[{w:'m',t:'And where do you live?'},{w:'g',t:'In Bridge Street.'},{w:'m',t:'Is that B, R, I, D, G, E?'},{w:'g',t:'Yes, it is.'}]},
     {q:'Name of dance class:', a:'Rainbow', say:[{w:'m',t:'Which dance class do you want?'},{w:'g',t:'The Rainbow class, please. My friend is in the Sunshine class.'}]},
     {q:"Teacher's name:", pre:'Anna', a:'Bell', say:[{w:'m',t:'Your teacher is Anna Bell. That’s B, E, L, L.'}]},
     {q:'Needs to bring:', a:'water', alt:['a bottle of water','bottle of water','water bottle','some water'], say:[{w:'m',t:'Bring some water, please. You don’t need shoes.'}]}]},
  {type:'write', group:'A1 listening', examples:1, how:'HILL SCHOOL LIBRARY — Listen and write the missing information.', title:'Hill School Library', icon:'📚', v:19,
   qs:[{q:'Class:', a:'5', say:[{w:'w',t:'Which class are you in?'},{w:'b',t:'Class five.'}]},
     {q:'Name:', pre:'Jack', a:'Turner', say:[{w:'w',t:'And what’s your name?'},{w:'b',t:'Jack Turner. T, U, R, N, E, R.'}]},
     {q:'Book:', pre:'‘Animals of the', post:'’', a:'Jungle', say:[{w:'w',t:'Which book do you want?'},{w:'b',t:'Animals of the Jungle, please.'}]},
     {q:'DVD about:', a:'dinosaurs', alt:['dinosaur'], say:[{w:'w',t:'Do you want a DVD too?'},{w:'b',t:'Yes, please. The one about dinosaurs. Not the one about space.'}]},
     {q:'Magazine:', post:'magazine', a:'football', say:[{w:'w',t:'And a magazine?'},{w:'b',t:'Yes, a football magazine, please.'}]},
     {q:'You can keep these for:', pre:'one', a:'week', say:[{w:'w',t:'You can keep these for one week. Bring them back next Monday.'}]}]},
  {type:'write', group:'A1 listening', examples:1, how:'LOST AND FOUND — Listen and write the missing information.', title:'Lost and found', icon:'🧥', v:20,
   qs:[{q:'Please look for:', a:'jacket', say:[{w:'w',t:'Hello. Can I help you?'},{w:'b',t:"Yes, please. I can't find my jacket."}]},
     {q:'Name of child:', pre:'Oliver', a:'Stone', say:[{w:'w',t:"What's your name?"},{w:'b',t:'Oliver Stone. S, T, O, N, E.'}]},
     {q:'Colour of jacket:', a:'green', say:[{w:'w',t:'What colour is your jacket?'},{w:'b',t:"It's green. My brother's jacket is blue."}]},
     {q:'Left it:', pre:'next to the', a:'pool', alt:['swimming pool'], say:[{w:'w',t:'Where did you leave it?'},{w:'b',t:'Next to the swimming pool.'}]},
     {q:'In the pocket:', pre:'a', a:'phone', alt:['mobile','mobile phone'], say:[{w:'w',t:'Is there anything in the pocket?'},{w:'b',t:'Yes, my phone is in the pocket.'}]},
     {q:"Child's address:", post:'Green Lane', a:'14', say:[{w:'w',t:"And what's your address?"},{w:'b',t:'Fourteen Green Lane.'}]}]},
  {type:'write', group:'A1 listening', examples:1, how:'THINGS TO DO ON SATURDAY — Listen and write the missing information.', title:'Things to do on Saturday', icon:'📝', v:20,
   qs:[{q:'At the shops, buy:', pre:'a', a:'birthday card', say:[{w:'m',t:'OK, Mia. What do we need to do today?'},{w:'g',t:"First we go to the shops. We need a birthday card for Grandma."}]},
     {q:'Also buy:', pre:'some', a:'flowers', say:[{w:'g',t:'And some flowers. Grandma loves flowers.'}]},
     {q:'Cake:', pre:'a', post:'cake', a:'chocolate', say:[{w:'m',t:'What kind of cake does she want?'},{w:'g',t:'A chocolate cake. Not a lemon cake!'}]},
     {q:'Then go to:', pre:'the', a:'library', say:[{w:'m',t:'And then where do we go?'},{w:'g',t:'Then we go to the library. I need a new book.'}]},
     {q:"At Grandma's, she needs:", pre:'two', a:'chairs', alt:['chair'], say:[{w:'m',t:"What about at Grandma's house?"},{w:'g',t:'Grandma needs two chairs for her party.'}]},
     {q:'And her:', a:'glasses', say:[{w:'g',t:"And her glasses! They're in our car."}]}]},
  {type:'write', group:'A1 listening', examples:1, how:'THE SEASIDE CAFÉ — Listen and write the missing information.', title:'The Seaside Café', icon:'☕', v:20,
   qs:[{q:'Name:', a:'Rita Long', say:[{w:'m',t:'Hello! Can I have your name for our café club?'},{w:'w',t:'Rita Long. L, O, N, G.'}]},
     {q:'Age:', a:'35', alt:['thirty-five','thirty five'], say:[{w:'m',t:'And how old are you?'},{w:'w',t:"I'm thirty-five."}]},
     {q:'Comes to the café on:', a:'Fridays', alt:['Friday'], say:[{w:'m',t:'When do you come to the café?'},{w:'w',t:'Every Friday. I work on Mondays.'}]},
     {q:'Favourite drink:', a:'orange juice', alt:['juice'], say:[{w:'m',t:"What's your favourite drink?"},{w:'w',t:"Orange juice. I don't like coffee."}]},
     {q:'Would like the café to sell:', a:'ice cream', alt:['ice-cream','icecream'], say:[{w:'m',t:'What would you like us to sell?'},{w:'w',t:'Ice cream, please! For my children.'}]},
     {q:'Came today with:', pre:'her', a:'sister', say:[{w:'m',t:"Who's with you today?"},{w:'w',t:'My sister. My husband is at work.'}]}]},
  {type:'write', group:'A1 listening', examples:1, how:'THE SCHOOL TRIP — Listen and write the missing information.', title:'The school trip', icon:'🚌', v:21,
   qs:[{q:'Day:', a:'Wednesday', say:[{w:'b',t:'Miss Grey, when is our school trip?'},{w:'w',t:"It's on Wednesday."}]},
     {q:'Place:', pre:'the', post:'Museum', a:'Science', say:[{w:'b',t:'Where are we going?'},{w:'w',t:"We're going to the Science Museum."}]},
     {q:'Number of children:', a:'24', alt:['twenty-four','twenty four'], say:[{w:'b',t:'How many children are going?'},{w:'w',t:"Twenty-four children. Mr Black's class isn't coming."}]},
     {q:'Bus leaves at:', post:"o'clock", a:'9', say:[{w:'b',t:'What time does the bus leave?'},{w:'w',t:"At nine o'clock. Please come to school at half past eight."}]},
     {q:'Bring:', pre:'a', a:'sandwich', alt:['sandwiches'], say:[{w:'b',t:'What do we need to bring?'},{w:'w',t:"Bring a sandwich and some water. Don't bring any money."}]},
     {q:'Back at school at:', post:"o'clock", a:'3', say:[{w:'b',t:'When do we come back?'},{w:'w',t:"We're back at school at three o'clock."}]}]},
  {type:'write', group:'A1 listening', examples:1, how:'OUR NEW PET RABBIT — Listen and write the missing information.', title:'Our new pet rabbit', icon:'🐰', v:21,
   qs:[{q:'Colour:', a:'white and brown', say:[{w:'m',t:'Tell me about your new rabbit, Emma. What colour is she?'},{w:'g',t:"She's white and brown."}]},
     {q:'Age:', post:'months', a:'6', say:[{w:'m',t:'How old is she?'},{w:'g',t:"She's only six months old."}]},
     {q:'Favourite food:', a:'carrots', alt:['carrot'], say:[{w:'m',t:'What does she like to eat?'},{w:'g',t:"Carrots! She doesn't like apples."}]},
     {q:'She can:', a:'jump', alt:['jump high','jump very high'], say:[{w:'m',t:'Can she do anything funny?'},{w:'g',t:'Yes! She can jump very high.'}]},
     {q:'Where she lives:', pre:'in the', a:'garden', say:[{w:'m',t:'Where does she live?'},{w:'g',t:'In a little house in the garden. Not in our house!'}]},
     {q:'Name:', a:'Snowy', say:[{w:'m',t:"And what's her name?"},{w:'g',t:'Snowy. S, N, O, W, Y.'}]}]},
  {type:'write', group:'A1 listening', examples:1, how:'HOMEWORK — My favourite day out. Listen and write the missing information.', title:'My favourite day out', icon:'🏖️', v:21,
   qs:[{q:'Favourite place:', a:'the beach', alt:['beach'], say:[{w:'w',t:'Where do you like to go for a day out?'},{w:'g',t:'I love going to the beach.'}]},
     {q:'Always takes:', pre:'her', a:'camera', say:[{w:'w',t:'What do you always take with you?'},{w:'g',t:'My camera. I love taking photos.'}]},
     {q:'How she goes:', pre:'by', a:'train', say:[{w:'w',t:'How do you get there?'},{w:'g',t:"By train. My dad doesn't drive."}]},
     {q:'Goes with:', pre:'her', a:'cousin', say:[{w:'w',t:'Who do you go with?'},{w:'g',t:'With my cousin. My brother doesn’t like the beach.'}]},
     {q:'When she goes:', pre:'in the', a:'summer', say:[{w:'w',t:'When do you go?'},{w:'g',t:"In the summer. It's too cold in the winter."}]},
     {q:"Cousin's name:", a:'Ruby', say:[{w:'w',t:"What's your cousin's name?"},{w:'g',t:'Ruby. R, U, B, Y.'}]}]},
  // A1 · Daily conversations: listen and tick the box (one example). Every conversation mentions all three pictures.
  {type:'tick', group:'A1 listening', title:"Kim's week", icon:'👗', voices:['w','g'], v:22, how:'Listen and tick (✓) the box. Read the question, then listen to the conversation.',
   qs:[{q:'What is Kim wearing today?', o:['👗','👖','🧣'], a:1, say:"Are you wearing your new dress today, Kim? — No, Mum. It's cold. I'm wearing my jeans. — And your scarf? — No, I can't find it."},
     {q:'What does Kim want for dinner?', o:['🐟','🍝','🍕'], a:2, say:"What do you want for dinner? Fish? — No, I had fish for lunch. Can we have pizza? — Not spaghetti? — No, pizza, please!"},
     {q:'What did Kim get for her birthday?', o:['📱','🚲','🐶'], a:1, say:"Did you get a phone for your birthday? — No, I'm too young! I got a bike. — A bike! Lucky you. — Yes. Now I want a dog!"},
     {q:'Where did Kim go at the weekend?', o:['🏖️','🎡','🏰'], a:2, say:"Where did you go at the weekend? The beach? — No, it rained. We went to the castle. — Was it good? — Yes! Next time I want to go to the funfair."},
     {q:"What's the matter with Kim?", o:['🤒','🤕','🤧'], a:1, say:"What's the matter, Kim? Have you got a cold? — No. I fell off my bike. My head hurts. — Oh dear! Come and sit down."},
     {q:"What fruit is in Kim's garden?", o:['🍎','🍐','🍒'], a:1, say:"Have you got apples in your garden? — No, we've got pears. My grandma has got cherries in her garden."}]},
  {type:'tick', group:'A1 listening', title:"Pat's busy day", icon:'🛍️', voices:['m','g'], v:22, how:'Listen and tick (✓) the box. Read the question, then listen to the conversation.',
   qs:[{q:"Where is Pat's dad going?", o:['🏦','🏥','🏫'], a:0, say:"Where are you going, Dad? — I'm going to the bank. — Not to the hospital? — No. Grandma is fine now. She's at home."},
     {q:"Which one is Pat's mother?", o:['👩‍🦰','👱‍♀️','👩‍🦱'], a:2, say:"Which one is your mum, Pat? The woman with red hair? — No, that's my aunt. My mum has got curly black hair."},
     {q:'What does Pat want to buy?', o:['📚','🧸','🎮'], a:2, say:"What do you want to buy at the shops? — A computer game! — Not a book? — No, I've got lots of books. And I'm too old for teddy bears!"},
     {q:'What was the weather like yesterday?', o:['☀️','🌧️','❄️'], a:1, say:"Was it sunny here yesterday? — No, it rained all day. — Did it snow? — No! It was wet, not cold. It's sunny today."},
     {q:"Where's Pat's brother?", o:['🛏️','🛁','📺'], a:0, say:"Where's your brother? In the bath? — No, he's in bed. He's very tired. — Is he watching TV? — No, he's asleep."},
     {q:'What will they take on the picnic?', o:['🥪','🍰','🍉'], a:1, say:"Shall we take sandwiches on the picnic? — We haven't got any bread. Let's take a cake. — And a watermelon? — No, it's too big!"}]},
  {type:'tick', group:'A1 listening', title:"Ben's big brother", icon:'🚗', voices:['w','b'], v:22, how:'Listen and tick (✓) the box. Read the question, then listen to the conversation.',
   qs:[{q:"Which is Ben's brother's car?", o:['🚗','🚙','🚕'], a:0, say:"Is your brother's car red, Ben? — Yes, it's a small red car. — Not the big blue one? — No, that's my dad's car."},
     {q:"What sport does Ben's brother play?", o:['⚽','🎾','🏀'], a:1, say:"Does your brother play football? — No, he plays tennis. I play football. — And basketball? — No, he's not very tall!"},
     {q:"Where does Ben's brother work?", o:['🏥','🏫','🏪'], a:0, say:"Where does your brother work? In a shop? — No, he works in a hospital. He's a nurse. My mum works in a school."},
     {q:"How did Ben go to his grandparents' house?", o:['🚆','🚌','✈️'], a:0, say:"Did you go to your grandparents' house by bus? — No, we went by train. The bus is very slow. — Do they live far away? — No, not very far."},
     {q:'What can Ben give his sister for her birthday?', o:['💐','🍫','📖'], a:2, say:"What can I give my sister for her birthday? Flowers? — She doesn't like flowers. Give her a book. — Not chocolate? — No, she doesn't eat chocolate."},
     {q:"What's Ben's sister's favourite food?", o:['🍔','🍣','🍜'], a:0, say:"What's your sister's favourite food? — Burgers! — Not noodles? — No. And she doesn't like fish."}]},
  {type:'tick', group:'A1 listening', title:'Jill and Ben at school', icon:'🎒', voices:['w','b'], v:23, how:'Listen and tick (✓) the box. Read the question, then listen to the conversation.',
   qs:[{q:'What did Sam do at school today?', o:['🎨','🎹','🏊'], a:1, say:"What did you do at school today, Sam? Did you paint? — No, we didn't paint. We played music. — Did you swim? — No, we swim on Friday."},
     {q:"What's the matter with Jill?", o:['🦷','🤕','🤒'], a:1, say:"What's the matter, Jill? Have you got toothache? — No, my head hurts. — Do you have a temperature? — No, I'm not hot."},
     {q:'Which child is Ben?', o:['👦🧢','👦👓','👦🎒'], a:0, say:"Which one is Ben? The boy with glasses? — No, that's Tom. Ben is wearing a cap. — Not the boy with the bag? — No, that's Max."},
     {q:'What does John want for lunch?', o:['🥪','🍝','🍲'], a:2, say:"What do you want for lunch, John? A sandwich? — No, thank you. I'd like some soup. — Spaghetti? — No, I had spaghetti yesterday."},
     {q:"What does Jane want to take to Jim's house?", o:['🎮','📚','🍫'], a:2, say:"What do you want to take to Jim's house, Jane? Your game? — No, he's got lots of games. Can I take him some chocolate? — Not a book? — No, he doesn't like reading."},
     {q:'What did Nick do at the weekend?', o:['⛺','🎣','🎬'], a:2, say:"What did you do at the weekend, Nick? Did you go fishing? — No, the weather was bad. We went to the cinema. — Not camping? — No, that's next weekend."}]},
  {type:'tick', group:'A1 listening', title:"Kim's comic", icon:'📚', voices:['m','g'], v:23, how:'Listen and tick (✓) the box. Read the question, then listen to the conversation.',
   qs:[{q:"Where's Kim's comic?", o:['🛏️','🎒','📦'], a:1, say:"Where's my comic, Dad? Is it on the bed? — No. Look in your school bag. — Not in the box? — No, the box is for toys."},
     {q:"Where does Sam's dad work?", o:['🏨','🏦','🚒'], a:0, say:"Where does your dad work, Sam? In a bank? — No, he works in a hotel. He's a cook. — Is he a firefighter? — No!"},
     {q:'What does Ann have to buy?', o:['🥛','🧀','🍞'], a:2, say:"Ann, what do you need to buy? Milk? — No, we have milk. We need bread. — And cheese? — No, Mum bought it yesterday."},
     {q:"Which is Jim's family?", o:['👨👩👦👧👵','👨👩👦','👨👩👦👧'], a:2, say:"Who lives in your house, Jim? — My mum, my dad and my sister. And me. — So there are four of you? — Yes, four. My grandma lives in Spain."},
     {q:'What does Daisy want?', o:['🐱','🐶','🐰'], a:0, say:"Daisy, what do you want for your birthday? A dog? — No, we haven't got a garden. I'd like a cat. — Not a rabbit? — No, cats are softer."},
     {q:"What's Jill drawing?", o:['🌳','🚗','🏠'], a:2, say:"What are you drawing, Jill? A tree? — No, that was last week. I'm drawing our house. — Is it a car? — No!"}]},
  {type:'tick', group:'A1 listening', title:"Fred's evening", icon:'🍽️', voices:['w','b'], v:23, how:'Listen and tick (✓) the box. Read the question, then listen to the conversation.',
   qs:[{q:'What did Fred do at school today?', o:['📖','🔬','🏃'], a:2, say:"What did you do at school today, Fred? Did you read? — No, we did sport. We ran in the park. — Not science? — That's tomorrow."},
     {q:"What's Sue doing?", o:['🍳','🧹','📺'], a:2, say:"What's Sue doing? Is she cooking? — No, she's watching TV. — Is she cleaning her room? — Not today."},
     {q:"What's for supper?", o:['🐟','🍗','🍕'], a:0, say:"What's for supper? Chicken? — Not tonight. We're having fish. — Not pizza? — That's on Friday."},
     {q:"Which hat is Ben's?", o:['🧢','🎩','👒'], a:1, say:"Which hat is Ben's? The cap? — No, Ben's hat is the tall black hat. — Not the straw hat? — No, that's Mum's."},
     {q:'What did John buy at the shops?', o:['👟','🧤','👕'], a:2, say:"What did you buy at the shops, John? Some trainers? — No, I didn't buy any shoes. I bought a T-shirt. — Gloves? — No, it isn't cold."},
     {q:'Which film did Kim see on Tuesday?', o:['🚀','🦁','🦈'], a:0, say:"Which film did you see, Kim? The one about sharks? — No, I saw the one about space. — The lion film? — That's on Saturday."}]},
  // A1 · Words, colours and describing things: listen, colour some things and draw others (one example).
  {type:'cdraw', group:'A1 listening', title:'Colour and draw: the garden', icon:'🌳', bg:'park', v:24,
   items:[{e:'🌳',x:20,y:48,s:30},{k:'bench',x:62,y:74,w:24},{e:'☀️',x:90,y:12,s:7}],
   things:[{id:'t1',k:'kite',lbl:'in the sky',x:50,y:20,w:9},{id:'t2',k:'ball',lbl:'on the bench',x:62,y:60,w:7},{id:'t3',k:'hat',lbl:'under the tree',x:28,y:86,w:7},{id:'t4',k:'flower',lbl:'next to the bench',x:84,y:82,w:6}],
   spots:[{id:'in-tree',x:20,y:30},{id:'under-bench',x:62,y:87},{id:'next-tree',x:42,y:70},{id:'in-sky',x:80,y:30}],
   draws:[{id:'bird',e:'🐦'},{id:'dog',e:'🐶'},{id:'cat',e:'🐱'},{id:'butterfly',e:'🦋'}],
   steps:[{say:"Look at the kite in the sky. It's red.",s:'t1',c:'red'},
     {say:'Colour the ball on the bench blue.',s:'t2',c:'blue'},
     {say:'Can you see the big tree? Draw a bird in the tree.',o:'bird',z:'in-tree'},
     {say:'The hat under the tree is yellow.',s:'t3',c:'yellow'},
     {say:'Now draw a dog under the bench.',o:'dog',z:'under-bench'},
     {say:'And colour the flower next to the bench orange.',s:'t4',c:'orange'}]},
  {type:'cdraw', group:'A1 listening', title:'Colour and draw: the bedroom', icon:'🛏️', bg:'bedroom', v:24,
   items:[{e:'🛏️',x:24,y:62,s:26},{k:'shelf',x:74,y:34,w:24},{e:'🪑',x:57,y:70,s:14},{e:'🎒',x:87,y:76,s:11},{k:'window',x:30,y:20,w:12}],
   things:[{id:'t1',k:'hat',lbl:'on the shelf',x:70,y:24,w:9},{id:'t2',k:'sock',lbl:'on the bed',x:30,y:58,w:7},{id:'t3',k:'ball',lbl:'on the chair',x:57,y:57,w:6},{id:'t4',k:'shoe',lbl:'next to the bed',x:43,y:84,w:8}],
   spots:[{id:'on-bed',x:15,y:52},{id:'under-chair',x:57,y:88},{id:'in-bag',x:87,y:66},{id:'next-shelf',x:93,y:42}],
   draws:[{id:'teddy',e:'🧸'},{id:'book',e:'📕'},{id:'clock',e:'⏰'},{id:'lamp',e:'💡'}],
   steps:[{say:"Look at the hat on the shelf. It's brown.",s:'t1',c:'brown'},
     {say:'Colour the sock on the bed purple.',s:'t2',c:'purple'},
     {say:'Draw a teddy bear on the bed, please.',o:'teddy',z:'on-bed'},
     {say:'The ball on the chair is green.',s:'t3',c:'green'},
     {say:'Now draw a book under the chair.',o:'book',z:'under-chair'},
     {say:'And colour the shoe next to the bed pink.',s:'t4',c:'pink'}]},
  {type:'cdraw', group:'A1 listening', title:'Colour and draw: the kitchen', icon:'🍳', bg:'kitchen', v:24,
   items:[{k:'table',x:40,y:70,w:30},{e:'🥣',x:30,y:53,s:9},{e:'🧺',x:84,y:78,s:12},{k:'window',x:78,y:24,w:13},{e:'🕰️',x:14,y:22,s:8}],
   things:[{id:'t1',k:'apple',lbl:'in the bowl',x:30,y:45,w:6},{id:'t2',k:'star',lbl:'next to the window',x:64,y:24,w:6},{id:'t3',k:'hat',lbl:'under the table',x:40,y:77,w:7},{id:'t4',k:'bag',lbl:'in the basket',x:84,y:69,w:6}],
   spots:[{id:'on-table',x:52,y:52},{id:'next-clock',x:28,y:22},{id:'under-window',x:78,y:46},{id:'next-basket',x:66,y:87}],
   draws:[{id:'cup',e:'☕'},{id:'cat',e:'🐱'},{id:'flower',e:'🌸'},{id:'bread',e:'🍞'}],
   steps:[{say:'The apple in the bowl is green.',s:'t1',c:'green'},
     {say:'Colour the star next to the window yellow.',s:'t2',c:'yellow'},
     {say:'Draw a cup on the table, please.',o:'cup',z:'on-table'},
     {say:'Find the hat under the table. Colour it blue.',s:'t3',c:'blue'},
     {say:'Now draw a cat next to the basket.',o:'cat',z:'next-basket'},
     {say:'And the bag in the basket is pink.',s:'t4',c:'pink'}]},
  // Words, colours and prepositions (set 2)
  {type:'scolour', title:'Colours in the living room', icon:'⭐', bg:'room', v:5,
   items:[{e:'🛋️',x:22,y:62,s:22},{k:'table',x:58,y:70,w:24},{e:'📦',x:87,y:76,s:12},{k:'window',x:50,y:22,w:13},{e:'🖼️',x:14,y:20,s:8}],
   things:[{id:'t1',k:'star',lbl:'next to the window',x:66,y:20,w:7},{id:'t2',k:'star',lbl:'on the box',x:87,y:60,w:7},{id:'t3',k:'car',lbl:'under the table',x:58,y:77,w:9},
     {id:'t4',k:'car',lbl:'on the sofa',x:22,y:51,w:9},{id:'t5',k:'balloon',lbl:'next to the sofa',x:40,y:58,w:6},{id:'t6',k:'hat',lbl:'on the table',x:58,y:52,w:8}],
   steps:[{say:"Look at the star next to the window. It's yellow.",s:'t1',c:'yellow'},{say:'Can you see the star on the box? Colour it purple.',s:'t2',c:'purple'},
     {say:'Now find the car under the table. Colour it red.',s:'t3',c:'red'},{say:"There's a car on the sofa too. Colour that car green.",s:'t4',c:'green'},
     {say:'Colour the balloon next to the sofa blue.',s:'t5',c:'blue'},{say:'And the hat on the table is brown.',s:'t6',c:'brown'}]},
  {type:'scolour', title:'Colours at school', icon:'🎒', bg:'class', v:5,
   items:[{k:'board',x:50,y:24,w:40},{k:'table',x:30,y:72,w:26},{e:'🪑',x:68,y:72,s:13},{e:'🗑️',x:89,y:80,s:9}],
   things:[{id:'t1',k:'bag',lbl:'under the desk',x:30,y:78,w:8},{id:'t2',k:'bag',lbl:'on the chair',x:68,y:57,w:8},{id:'t3',k:'apple',lbl:'on the desk',x:23,y:53,w:6},
     {id:'t4',k:'ball',lbl:'under the chair',x:68,y:87,w:6},{id:'t5',k:'flower',lbl:'next to the board',x:80,y:26,w:7},{id:'t6',k:'star',lbl:'on the board',x:60,y:22,w:7}],
   steps:[{say:'The bag under the desk is blue.',s:'t1',c:'blue'},{say:'Colour the bag on the chair orange.',s:'t2',c:'orange'},
     {say:'Can you see the apple on the desk? Make it red.',s:'t3',c:'red'},{say:'Find the ball under the chair. Colour it green.',s:'t4',c:'green'},
     {say:'Now colour the flower next to the board pink.',s:'t5',c:'pink'},{say:"And there's a star on the board. Colour it yellow.",s:'t6',c:'yellow'}]},
  {type:'scolour', title:'Colours at the beach', icon:'🏖️', bg:'beach', v:5,
   items:[{e:'☀️',x:88,y:14,s:8},{e:'⛱️',x:30,y:62,s:18},{e:'🏰',x:72,y:72,s:14},{e:'🚤',x:55,y:46,s:10}],
   things:[{id:'t1',k:'kite',lbl:'in the sky',x:48,y:16,w:9},{id:'t2',k:'fish',lbl:'in the sea',x:18,y:50,w:9},{id:'t3',k:'fish',lbl:'next to the boat',x:41,y:47,w:8},
     {id:'t4',k:'ball',lbl:'under the umbrella',x:30,y:80,w:7},{id:'t5',k:'ball',lbl:'next to the sandcastle',x:89,y:80,w:7},{id:'t6',k:'hat',lbl:'on the sandcastle',x:72,y:56,w:8}],
   steps:[{say:"Look at the kite in the sky. It's red.",s:'t1',c:'red'},{say:'Can you see the fish in the sea? Colour it orange.',s:'t2',c:'orange'},
     {say:"There's a fish next to the boat too. Make that fish purple.",s:'t3',c:'purple'},{say:'Now find the ball under the umbrella. Colour it yellow.',s:'t4',c:'yellow'},
     {say:'Colour the ball next to the sandcastle green.',s:'t5',c:'green'},{say:'And the hat on the sandcastle is blue.',s:'t6',c:'blue'}]},
  // Words, colours and prepositions (set 3)
  {type:'scolour', title:'Colours at the party', icon:'🎈', bg:'party', v:6,
   items:[{k:'table',x:50,y:72,w:30},{e:'🎂',x:42,y:53,s:8},{e:'🎁',x:85,y:79,s:10},{k:'window',x:80,y:22,w:12},{e:'🪑',x:15,y:74,s:12}],
   things:[{id:'t1',k:'balloon',lbl:'next to the window',x:64,y:22,w:6},{id:'t2',k:'balloon',lbl:'on the chair',x:15,y:58,w:6},{id:'t3',k:'hat',lbl:'on the table',x:59,y:52,w:8},
     {id:'t4',k:'hat',lbl:'under the table',x:50,y:79,w:8},{id:'t5',k:'star',lbl:'next to the present',x:72,y:83,w:6},{id:'t6',k:'ball',lbl:'on the present',x:85,y:66,w:6}],
   steps:[{say:"Look at the balloon next to the window. It's pink.",s:'t1',c:'pink'},{say:'Now colour the balloon on the chair yellow.',s:'t2',c:'yellow'},
     {say:'Can you see the hat on the table? Make it purple.',s:'t3',c:'purple'},{say:"There's a hat under the table too. Colour that hat green.",s:'t4',c:'green'},
     {say:'Colour the star next to the present orange.',s:'t5',c:'orange'},{say:'And the ball on the present is blue.',s:'t6',c:'blue'}]},
  {type:'scolour', title:'Colours in the street', icon:'🚌', bg:'street', v:6,
   items:[{e:'🏠',x:20,y:52,s:24},{e:'🚌',x:62,y:70,s:18},{e:'🌳',x:90,y:52,s:22},{e:'☀️',x:50,y:14,s:7}],
   things:[{id:'t1',k:'kite',lbl:'on the house',x:20,y:23,w:8},{id:'t2',k:'kite',lbl:'in the tree',x:90,y:40,w:8},{id:'t3',k:'car',lbl:'next to the house',x:40,y:74,w:10},
     {id:'t4',k:'car',lbl:'under the tree',x:91,y:82,w:9},{id:'t5',k:'ball',lbl:'next to the bus',x:46,y:86,w:6},{id:'t6',k:'flower',lbl:'next to the tree',x:77,y:58,w:6}],
   steps:[{say:"Look at the kite on the house. It's blue.",s:'t1',c:'blue'},{say:'Colour the kite in the tree red.',s:'t2',c:'red'},
     {say:'Can you see the car next to the house? Make it yellow.',s:'t3',c:'yellow'},{say:"There's a car under the tree too. Colour that car purple.",s:'t4',c:'purple'},
     {say:'Now find the ball next to the bus. Colour it orange.',s:'t5',c:'orange'},{say:'And the flower next to the tree is pink.',s:'t6',c:'pink'}]},
  {type:'scolour', title:'Colours at the picnic', icon:'🧺', bg:'park', v:6,
   items:[{e:'🌳',x:18,y:48,s:30},{k:'bench',x:60,y:74,w:24},{e:'🧺',x:86,y:80,s:11},{e:'☀️',x:86,y:14,s:8}],
   things:[{id:'t1',k:'apple',lbl:'in the basket',x:86,y:73,w:6},{id:'t2',k:'apple',lbl:'on the bench',x:54,y:58,w:6},{id:'t3',k:'bag',lbl:'under the bench',x:60,y:84,w:7},
     {id:'t4',k:'bag',lbl:'next to the tree',x:36,y:76,w:7},{id:'t5',k:'kite',lbl:'in the tree',x:16,y:30,w:8},{id:'t6',k:'shoe',lbl:'under the tree',x:22,y:86,w:7}],
   steps:[{say:'The apple in the basket is red.',s:'t1',c:'red'},{say:'Look at the apple on the bench. Colour it green.',s:'t2',c:'green'},
     {say:'Can you see the bag under the bench? Make it orange.',s:'t3',c:'orange'},{say:"There's a bag next to the tree too. Colour that bag blue.",s:'t4',c:'blue'},
     {say:'Now colour the kite in the tree yellow.',s:'t5',c:'yellow'},{say:'And the shoe under the tree is brown.',s:'t6',c:'brown'}]},
  // Words, colours and prepositions (set 4)
  {type:'scolour', title:'Colours in the bathroom', icon:'🛁', bg:'bathroom', v:7,
   items:[{e:'🛁',x:28,y:66,s:24},{e:'🚽',x:72,y:70,s:14},{k:'window',x:50,y:22,w:12}],
   things:[{id:'t1',k:'fish',lbl:'in the bath',x:26,y:57,w:8},{id:'t2',k:'fish',lbl:'next to the bath',x:50,y:84,w:8},{id:'t3',k:'sock',lbl:'on the toilet',x:72,y:57,w:6},
     {id:'t4',k:'sock',lbl:'under the window',x:50,y:44,w:6},{id:'t5',k:'ball',lbl:'next to the toilet',x:88,y:84,w:6},{id:'t6',k:'star',lbl:'on the window',x:50,y:20,w:6}],
   steps:[{say:"Look at the fish in the bath. It's orange.",s:'t1',c:'orange'},{say:"There's a fish next to the bath too. Colour it blue.",s:'t2',c:'blue'},
     {say:"Can you see the sock on the toilet? That's funny! Colour it green.",s:'t3',c:'green'},{say:'Now find the sock under the window. Make it red.',s:'t4',c:'red'},
     {say:'Colour the ball next to the toilet yellow.',s:'t5',c:'yellow'},{say:'And the star on the window is purple.',s:'t6',c:'purple'}]},
  {type:'scolour', title:'Colours on the farm', icon:'🐄', bg:'park', v:7,
   items:[{e:'🌳',x:20,y:48,s:30},{e:'🏠',x:78,y:52,s:22},{k:'pond',x:46,y:85,w:22},{e:'🐄',x:50,y:62,s:10},{e:'☀️',x:50,y:14,s:7}],
   things:[{id:'t1',k:'apple',lbl:'in the tree',x:24,y:33,w:6},{id:'t2',k:'apple',lbl:'under the tree',x:28,y:85,w:6},{id:'t3',k:'fish',lbl:'in the pond',x:46,y:83,w:8},
     {id:'t4',k:'hat',lbl:'on the house',x:78,y:26,w:8},{id:'t5',k:'hat',lbl:'next to the cow',x:62,y:64,w:7},{id:'t6',k:'flower',lbl:'next to the house',x:95,y:74,w:6}],
   steps:[{say:'The apple in the tree is red.',s:'t1',c:'red'},{say:'Look at the apple under the tree. Colour it yellow.',s:'t2',c:'yellow'},
     {say:'Can you see the fish in the pond? Make it orange.',s:'t3',c:'orange'},{say:"There's a hat on the house! Colour that hat brown.",s:'t4',c:'brown'},
     {say:"And there's a hat next to the cow. Colour it blue.",s:'t5',c:'blue'},{say:'Now colour the flower next to the house pink.',s:'t6',c:'pink'}]},
  {type:'scolour', title:'Colours in the toy shop', icon:'🧸', bg:'room', v:7,
   items:[{k:'shelf',x:28,y:32,w:30},{k:'shelf',x:28,y:58,w:30},{k:'table',x:68,y:72,w:24},{e:'📦',x:92,y:80,s:9},{k:'window',x:82,y:22,w:11}],
   things:[{id:'t1',k:'car',lbl:'on the top shelf',x:22,y:25,w:8},{id:'t2',k:'car',lbl:'on the bottom shelf',x:34,y:51,w:8},{id:'t3',k:'ball',lbl:'on the table',x:64,y:54,w:6},
     {id:'t4',k:'ball',lbl:'under the table',x:72,y:79,w:6},{id:'t5',k:'kite',lbl:'next to the window',x:64,y:21,w:7},{id:'t6',k:'star',lbl:'in the box',x:92,y:75,w:5}],
   steps:[{say:"Look at the car on the top shelf. It's green.",s:'t1',c:'green'},{say:'Now find the car on the bottom shelf. Colour it red.',s:'t2',c:'red'},
     {say:'Can you see the ball on the table? Make it blue.',s:'t3',c:'blue'},{say:"There's a ball under the table too. Colour that ball yellow.",s:'t4',c:'yellow'},
     {say:'Colour the kite next to the window orange.',s:'t5',c:'orange'},{say:'And the star in the box is purple.',s:'t6',c:'purple'}]},
  // Words, colours and prepositions (set 5)
  {type:'scolour', title:'Colours at the zoo', icon:'🐘', bg:'park', v:8,
   items:[{e:'🐘',x:24,y:60,s:20},{e:'🌳',x:52,y:48,s:22},{e:'🦒',x:78,y:50,s:24},{e:'☀️',x:90,y:12,s:7}],
   things:[{id:'t1',k:'hat',lbl:'on the elephant',x:22,y:42,w:7},{id:'t2',k:'hat',lbl:'under the tree',x:54,y:77,w:7},{id:'t3',k:'balloon',lbl:'in the tree',x:49,y:37,w:5},
     {id:'t4',k:'balloon',lbl:'next to the giraffe',x:94,y:38,w:6},{id:'t5',k:'ball',lbl:'next to the elephant',x:39,y:77,w:6},{id:'t6',k:'flower',lbl:'under the giraffe',x:79,y:82,w:6}],
   steps:[{say:"Look at the hat on the elephant. It's brown.",s:'t1',c:'brown'},{say:"There's a hat under the tree too. Colour it green.",s:'t2',c:'green'},
     {say:'Can you see the balloon in the tree? Make it red.',s:'t3',c:'red'},{say:'Now colour the balloon next to the giraffe yellow.',s:'t4',c:'yellow'},
     {say:'Find the ball next to the elephant. Colour it blue.',s:'t5',c:'blue'},{say:'And the flower under the giraffe is pink.',s:'t6',c:'pink'}]},
  {type:'scolour', title:'Colours at the swimming pool', icon:'🏊', bg:'pool', v:8,
   items:[{k:'window',x:20,y:18,w:12},{e:'🕰️',x:80,y:18,s:7},{e:'🏊',x:38,y:58,s:11},{e:'🪑',x:86,y:82,s:10}],
   things:[{id:'t1',k:'ball',lbl:'in the water',x:62,y:57,w:6},{id:'t2',k:'ball',lbl:'next to the chair',x:72,y:89,w:6},{id:'t3',k:'hat',lbl:'on the chair',x:86,y:71,w:7},
     {id:'t4',k:'hat',lbl:'under the window',x:20,y:36,w:7},{id:'t5',k:'star',lbl:'next to the window',x:36,y:18,w:6},{id:'t6',k:'bag',lbl:'under the chair',x:94,y:92,w:5}],
   steps:[{say:"Look at the ball in the water. It's red.",s:'t1',c:'red'},{say:"There's a ball next to the chair too. Colour it yellow.",s:'t2',c:'yellow'},
     {say:'Can you see the hat on the chair? Make it blue.',s:'t3',c:'blue'},{say:'Now find the hat under the window. Colour it green.',s:'t4',c:'green'},
     {say:'Colour the star next to the window orange.',s:'t5',c:'orange'},{say:'And the bag under the chair is purple.',s:'t6',c:'purple'}]},
  {type:'scolour', title:'Colours in the playground', icon:'🚲', bg:'park', v:8,
   items:[{k:'bench',x:28,y:74,w:24},{e:'🚲',x:55,y:72,s:12},{e:'🌳',x:82,y:48,s:28},{e:'☀️',x:10,y:12,s:7}],
   things:[{id:'t1',k:'kite',lbl:'in the tree',x:80,y:32,w:8},{id:'t2',k:'kite',lbl:'in the sky',x:42,y:18,w:8},{id:'t3',k:'bag',lbl:'on the bench',x:24,y:59,w:7},
     {id:'t4',k:'bag',lbl:'next to the bike',x:67,y:79,w:7},{id:'t5',k:'ball',lbl:'under the bench',x:28,y:85,w:6},{id:'t6',k:'ball',lbl:'under the tree',x:88,y:84,w:6}],
   steps:[{say:'The kite in the tree is pink.',s:'t1',c:'pink'},{say:'Look at the kite in the sky. Colour it red.',s:'t2',c:'red'},
     {say:'Can you see the bag on the bench? Make it purple.',s:'t3',c:'purple'},{say:"There's a bag next to the bike too. Colour that bag orange.",s:'t4',c:'orange'},
     {say:'Now find the ball under the bench. Colour it blue.',s:'t5',c:'blue'},{say:'And the ball under the tree is yellow.',s:'t6',c:'yellow'}]},
  // Numbers and spelling: read the question, listen to the conversation, write a name or a number (two examples).
  {type:'write', title:"Lucy's birthday", icon:'🎂', v:4,
   qs:[{q:"What's the girl's name?", a:'Lucy', say:[{w:'w',t:"Hello! What's your name?"},{w:'g',t:"My name's Lucy."},{w:'w',t:'How do you spell that?'},{w:'g',t:'L, U, C, Y.'}]},
     {q:'How old is she today?', a:'7', say:[{w:'w',t:'Is it your birthday today, Lucy?'},{w:'g',t:"Yes, it is! I'm seven today."}]},
     {q:"What's the name of Lucy's best friend?", a:'Grace', say:[{w:'w',t:'Who is your best friend?'},{w:'g',t:'My best friend is Grace.'},{w:'w',t:'How do you spell Grace?'},{w:'g',t:'G, R, A, C, E.'}]},
     {q:'How many balloons has Lucy got?', a:'12', say:[{w:'w',t:"Wow! You've got lots of balloons!"},{w:'g',t:"Yes. I've got twelve balloons."}]},
     {q:'Where does Lucy live?', pre:'in', post:'Street', a:'Park', say:[{w:'w',t:'Where do you live, Lucy?'},{w:'g',t:'I live in Park Street.'},{w:'w',t:'Park? Is that P, A, R, K?'},{w:'g',t:"Yes, that's right."}]},
     {q:"What's the name of Lucy's dog?", a:'Spot', say:[{w:'w',t:'Have you got a pet?'},{w:'g',t:"Yes, I've got a dog. His name is Spot."},{w:'w',t:'How do you spell that?'},{w:'g',t:'S, P, O, T.'}]},
     {q:'How many cakes are on the table?', a:'4', say:[{w:'w',t:'Look at the table! How many cakes are there?'},{w:'g',t:'There are four cakes. Yummy!'}]}]},
  {type:'write', title:'A day at the zoo', icon:'🦒', v:4,
   qs:[{q:"What's the boy's name?", a:'Dan', say:[{w:'m',t:"Hi! What's your name?"},{w:'b',t:"I'm Dan. D, A, N."}]},
     {q:'How old is Dan?', a:'9', say:[{w:'m',t:'And how old are you, Dan?'},{w:'b',t:"I'm nine."}]},
     {q:'How many monkeys can Dan see?', a:'15', say:[{w:'m',t:'Look at the monkeys! How many can you see?'},{w:'b',t:'Fifteen! I can see fifteen monkeys.'}]},
     {q:"What's the name of the big elephant?", a:'Jumbo', say:[{w:'b',t:"What's the big elephant's name?"},{w:'m',t:'Her name is Jumbo.'},{w:'b',t:'How do you spell that?'},{w:'m',t:'J, U, M, B, O.'}]},
     {q:'How old is the elephant?', a:'20', say:[{w:'b',t:'Is Jumbo very old?'},{w:'m',t:"Yes, she is. She's twenty."}]},
     {q:"Who is Dan's teacher?", pre:'Mr', a:'Hill', say:[{w:'m',t:'Who is your teacher at school, Dan?'},{w:'b',t:'Mr Hill.'},{w:'m',t:'Is that H, I, L, L?'},{w:'b',t:'Yes, it is.'}]},
     {q:'How many giraffes are there?', a:'3', say:[{w:'b',t:'How many giraffes are there at the zoo?'},{w:'m',t:'There are three giraffes. Look, there they are!'}]}]},
  {type:'write', title:"Ben's new house", icon:'🏡', v:4,
   qs:[{q:"What's the boy's name?", a:'Ben', say:[{w:'w',t:"Hello. What's your name?"},{w:'b',t:"My name's Ben. B, E, N."}]},
     {q:"What number is Ben's house?", a:'6', say:[{w:'w',t:'What number is your new house, Ben?'},{w:'b',t:"It's number six."}]},
     {q:'Where is the house?', pre:'in', post:'Street', a:'Rose', say:[{w:'w',t:"And what's the name of your street?"},{w:'b',t:"It's Rose Street."},{w:'w',t:'How do you spell Rose?'},{w:'b',t:'R, O, S, E.'}]},
     {q:'How many bedrooms are there?', a:'3', say:[{w:'w',t:'How many bedrooms are there in your new house?'},{w:'b',t:'There are three bedrooms.'}]},
     {q:"What's the name of Ben's sister?", a:'Kim', say:[{w:'w',t:'Have you got a brother or a sister?'},{w:'b',t:"I've got a sister. Her name is Kim. K, I, M."}]},
     {q:"How old is Ben's sister?", a:'11', say:[{w:'w',t:'How old is Kim?'},{w:'b',t:"She's eleven."}]},
     {q:"How many windows are in Ben's bedroom?", a:'2', say:[{w:'w',t:'Is your bedroom nice, Ben?'},{w:'b',t:"Yes, it's big. It's got two windows."}]}]},
  // Words and prepositions: draw a line from each thing to the place where it is.
  {type:'plines', title:'Lines: the toy room', icon:'🧸', bg:'bedroom', v:3,
   items:[{k:'shelf',x:30,y:30,w:26},{e:'📦',x:18,y:76,s:12},{k:'table',x:55,y:72,w:24},{e:'🛋️',x:85,y:64,s:20},{k:'window',x:70,y:20,w:12}],
   spots:[{id:'on-shelf',x:30,y:21},{id:'in-box',x:18,y:71},{id:'next-box',x:33,y:82},{id:'on-table',x:55,y:53},{id:'under-table',x:55,y:77},{id:'on-sofa',x:85,y:52}],
   objects:[{id:'teddy',e:'🧸',w:'teddy'},{id:'ball',e:'⚽',w:'ball'},{id:'robot',e:'🤖',w:'robot'},{id:'car',e:'🚗',w:'car'},{id:'train',e:'🚂',w:'train'},{id:'kite',e:'🪁',w:'kite'}],
   steps:[{say:'Look! The teddy is on the shelf.',n:'teddy',to:'on-shelf'},{say:'The ball is under the table.',n:'ball',to:'under-table'},
     {say:"Where's the robot? The robot is on the sofa.",n:'robot',to:'on-sofa'},{say:'My car is in the box.',n:'car',to:'in-box'},
     {say:'And the train? The train is on the table.',n:'train',to:'on-table'}]},
  {type:'plines', title:'Lines: the classroom', icon:'✏️', bg:'class', v:3,
   items:[{k:'board',x:50,y:24,w:40},{k:'table',x:30,y:72,w:26},{e:'🪑',x:66,y:72,s:13},{e:'🗑️',x:89,y:80,s:9}],
   spots:[{id:'next-board',x:84,y:24},{id:'on-desk',x:30,y:53},{id:'under-desk',x:30,y:77},{id:'on-chair',x:66,y:58},{id:'under-chair',x:66,y:86},{id:'in-bin',x:89,y:75}],
   objects:[{id:'clock',e:'⏰',w:'clock'},{id:'apple',e:'🍎',w:'apple'},{id:'bag',e:'🎒',w:'bag'},{id:'book',e:'📕',w:'book'},{id:'pencil',e:'✏️',w:'pencil'},{id:'ruler',e:'📏',w:'ruler'}],
   steps:[{say:'The clock is next to the board.',n:'clock',to:'next-board'},{say:"The teacher's apple is on the desk.",n:'apple',to:'on-desk'},
     {say:"Can you see my bag? It's under the chair.",n:'bag',to:'under-chair'},{say:'The book is under the desk.',n:'book',to:'under-desk'},
     {say:'Oh dear! The pencil is in the bin.',n:'pencil',to:'in-bin'}]},
  {type:'plines', title:'Lines: on the farm', icon:'🐸', bg:'park', v:3,
   items:[{e:'🌳',x:20,y:48,s:32},{e:'🏠',x:78,y:52,s:24},{k:'pond',x:50,y:84,w:22},{e:'☀️',x:50,y:14,s:8}],
   spots:[{id:'in-tree',x:20,y:32},{id:'under-tree',x:30,y:84},{id:'on-house',x:78,y:28},{id:'next-house',x:93,y:74},{id:'in-water',x:50,y:82},{id:'next-tree',x:38,y:62}],
   objects:[{id:'bird',e:'🐦',w:'bird'},{id:'cat',e:'🐱',w:'cat'},{id:'dog',e:'🐶',w:'dog'},{id:'duck',e:'🦆',w:'duck'},{id:'frog',e:'🐸',w:'frog'},{id:'rabbit',e:'🐰',w:'rabbit'}],
   steps:[{say:'The bird is in the tree.',n:'bird',to:'in-tree'},{say:'Look at the cat. The cat is on the house!',n:'cat',to:'on-house'},
     {say:"Where's the dog? It's under the tree.",n:'dog',to:'under-tree'},{say:'The duck is in the water.',n:'duck',to:'in-water'},
     {say:'And the frog is next to the house.',n:'frog',to:'next-house'}]},
  // Words, colours and prepositions: the same thing appears in different places — colour the right one.
  {type:'scolour', title:'Colours in the garden', icon:'🌷', bg:'park', v:2,
   items:[{e:'🌳',x:22,y:48,s:34},{k:'bench',x:60,y:74,w:24},{k:'pond',x:87,y:82,w:22},{e:'☀️',x:88,y:14,s:8}],
   things:[{id:'t1',k:'kite',lbl:'in the tree',x:20,y:30,w:9},{id:'t2',k:'kite',lbl:'in the sky',x:58,y:22,w:9},{id:'t3',k:'ball',lbl:'under the tree',x:31,y:84,w:7},
     {id:'t4',k:'ball',lbl:'on the bench',x:60,y:58,w:7},{id:'t5',k:'fish',lbl:'in the water',x:87,y:80,w:9},{id:'t6',k:'flower',lbl:'next to the bench',x:42,y:74,w:8}],
   steps:[{say:"Look at the kite in the tree. It's red.",s:'t1',c:'red'},{say:'Can you see the kite in the sky? Colour it yellow.',s:'t2',c:'yellow'},
     {say:'Now find the ball under the tree. Colour it blue.',s:'t3',c:'blue'},{say:'There is a ball on the bench too. Make that ball green.',s:'t4',c:'green'},
     {say:'Colour the fish in the water orange.',s:'t5',c:'orange'},{say:'And the flower next to the bench is pink.',s:'t6',c:'pink'}]},
  {type:'scolour', title:'Colours in the bedroom', icon:'🧦', bg:'bedroom', v:2,
   items:[{e:'🛏️',x:24,y:62,s:26},{k:'shelf',x:74,y:34,w:24},{e:'🪑',x:57,y:70,s:14},{e:'🎒',x:87,y:76,s:11},{k:'window',x:30,y:20,w:12}],
   things:[{id:'t1',k:'hat',lbl:'on the shelf',x:70,y:24,w:9},{id:'t2',k:'hat',lbl:'on the chair',x:57,y:55,w:8},{id:'t3',k:'sock',lbl:'on the bed',x:30,y:58,w:7},
     {id:'t4',k:'sock',lbl:'under the chair',x:57,y:86,w:6},{id:'t5',k:'shoe',lbl:'next to the bed',x:43,y:82,w:8},{id:'t6',k:'ball',lbl:'in the bag',x:87,y:68,w:6}],
   steps:[{say:"Look at the hat on the shelf. It's brown.",s:'t1',c:'brown'},{say:'Colour the hat on the chair purple.',s:'t2',c:'purple'},
     {say:'Find the sock on the bed. Colour it red.',s:'t3',c:'red'},{say:'The sock under the chair is green.',s:'t4',c:'green'},
     {say:'Can you see the shoe next to the bed? Colour it blue.',s:'t5',c:'blue'},{say:"And there's a ball in the bag. Make it orange.",s:'t6',c:'orange'}]},
  {type:'scolour', title:'Colours in the kitchen', icon:'🍏', bg:'kitchen', v:2,
   items:[{k:'table',x:40,y:70,w:30},{e:'🥣',x:30,y:53,s:9},{e:'🧺',x:84,y:78,s:12},{k:'window',x:78,y:24,w:13},{e:'🕰️',x:14,y:22,s:8}],
   things:[{id:'t1',k:'apple',lbl:'in the bowl',x:30,y:45,w:6},{id:'t2',k:'apple',lbl:'in the basket',x:84,y:70,w:7},{id:'t3',k:'apple',lbl:'under the table',x:40,y:77,w:7},
     {id:'t4',k:'car',lbl:'on the table',x:50,y:49,w:10},{id:'t5',k:'balloon',lbl:'next to the window',x:93,y:26,w:7},{id:'t6',k:'fish',lbl:'next to the basket',x:66,y:85,w:9}],
   steps:[{say:'The apple in the bowl is green.',s:'t1',c:'green'},{say:'Colour the apple in the basket red.',s:'t2',c:'red'},
     {say:'Now the apple under the table. Colour it yellow.',s:'t3',c:'yellow'},{say:"There's a car on the table. Colour the car blue.",s:'t4',c:'blue'},
     {say:'Colour the balloon next to the window pink.',s:'t5',c:'pink'},{say:'And the fish next to the basket is orange.',s:'t6',c:'orange'}]},
];

/* ---- scene pieces ---- */
const PIECES = {
  table: `<svg viewBox="0 0 100 60"><rect x="0" y="0" width="100" height="11" rx="3" fill="#b5723a"/><rect x="0" y="9" width="100" height="4" fill="#8d5524"/><rect x="7" y="11" width="8" height="49" rx="2" fill="#8d5524"/><rect x="85" y="11" width="8" height="49" rx="2" fill="#8d5524"/></svg>`,
  shelf: `<svg viewBox="0 0 100 14"><rect x="0" y="0" width="100" height="7" rx="2" fill="#b5723a"/><path d="M12 7 v7 h6 l-6 -7z M82 7 v7 h6 l-6 -7z" fill="#8d5524"/></svg>`,
  bench: `<svg viewBox="0 0 100 50"><rect x="2" y="0" width="96" height="9" rx="3" fill="#a0612a"/><rect x="2" y="13" width="96" height="9" rx="3" fill="#a0612a"/><rect x="0" y="22" width="100" height="7" rx="2" fill="#8d5524"/><rect x="8" y="29" width="7" height="21" fill="#555"/><rect x="85" y="29" width="7" height="21" fill="#555"/></svg>`,
  pond:  `<svg viewBox="0 0 100 40"><ellipse cx="50" cy="20" rx="50" ry="20" fill="#5ab4e6"/><ellipse cx="50" cy="16" rx="38" ry="11" fill="#8fd3f4" opacity=".7"/></svg>`,
  window: `<svg viewBox="0 0 100 90"><rect x="0" y="0" width="100" height="90" rx="6" fill="#8d5524"/><rect x="7" y="7" width="86" height="76" rx="3" fill="#bde7ff"/><path d="M50 7 V83 M7 45 H93" stroke="#8d5524" stroke-width="6"/><circle cx="28" cy="26" r="9" fill="#ffe08a"/></svg>`,
  board: `<svg viewBox="0 0 100 46"><rect x="0" y="0" width="100" height="46" rx="4" fill="#8d5524"/><rect x="4" y="4" width="92" height="38" rx="2" fill="#2f6b4f"/><text x="14" y="30" font-size="16" fill="#fff" font-family="Baloo 2,cursive" font-weight="800">A b c 1 2 3</text></svg>`,
};
function pieceHTML(it) {
  if (it.k) return `<div class="lp" style="left:${it.x}%;top:${it.y}%;width:${it.w}%">${PIECES[it.k]}</div>`;
  return `<div class="lp le" style="left:${it.x}%;top:${it.y}%;--s:${it.s}">${it.e}</div>`;
}
function miniHTML(o) {
  if (typeof o === 'string') { const n = [...o.replace(/[️‍]/g, '')].length, fs = n <= 1 ? 56 : n <= 2 ? 44 : n <= 3 ? 30 : n <= 4 ? 24 : 20;   // one big picture, or a row of small ones
    return `<div class="mini mtxt" style="--fs:${fs}px">${o}</div>`; }
  const f = o.f === 'table' ? `<div class="mf mtable">${PIECES.table}</div>` : `<div class="mf">${o.f}</div>`;
  return `<div class="mini">${f}<div class="mo p-${o.p} ${o.f === 'table' ? 't' : ''}">${o.o}</div></div>`;
}
const SHAPES = {
  apple: f => `<path d="M50 30 Q52 16 60 8" fill="none"/><path d="M54 18 Q66 8 77 14 Q66 25 54 18z" fill="#52b788"/><path d="M50 30 Q30 18 18 34 Q6 54 20 76 Q32 94 50 86 Q68 94 80 76 Q94 54 82 34 Q70 18 50 30z" fill="${f}"/>`,
  flower: f => `<path d="M50 58 V98 M50 82 Q36 72 30 80" fill="none"/><circle cx="50" cy="20" r="14" fill="${f}"/><circle cx="72" cy="36" r="14" fill="${f}"/><circle cx="64" cy="60" r="14" fill="${f}"/><circle cx="36" cy="60" r="14" fill="${f}"/><circle cx="28" cy="36" r="14" fill="${f}"/><circle cx="50" cy="42" r="10" fill="#ffd60a"/>`,
  ball: f => `<circle cx="50" cy="50" r="40" fill="${f}"/><path d="M12 44 Q50 64 88 44 M30 16 Q52 50 30 86" fill="none"/>`,
  kite: f => `<path d="M50 80 q-10 7 0 12 q10 5 0 8" fill="none"/><polygon points="50,4 82,40 50,80 18,40" fill="${f}"/><path d="M50 4 V80 M18 40 H82" fill="none"/>`,
  balloon: f => `<path d="M50 80 q-8 8 2 18" fill="none"/><ellipse cx="50" cy="40" rx="29" ry="35" fill="${f}"/><path d="M45 74 h10 l-5 7z" fill="${f}"/>`,
  fish: f => `<path d="M68 50 L94 28 L94 72z" fill="${f}"/><path d="M8 50 Q38 14 72 50 Q38 86 8 50z" fill="${f}"/><circle cx="28" cy="46" r="4" fill="#2b2b2b"/>`,
  star: f => `<polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" fill="${f}"/>`,
  car: f => `<path d="M6 66 V50 Q8 42 18 42 L30 24 Q34 20 42 20 H62 Q70 20 74 26 L86 42 Q94 42 94 52 V66z" fill="${f}"/><path d="M36 26 H50 V42 H26z M56 26 H66 L76 42 H56z" fill="#e3f4ff"/><circle cx="28" cy="68" r="11" fill="#2b2b2b"/><circle cx="72" cy="68" r="11" fill="#2b2b2b"/>`,
  tshirt: f => `<path d="M32 10 L14 20 L4 42 L20 48 L25 40 V92 H75 V40 L80 48 L96 42 L86 20 L68 10 Q50 26 32 10z" fill="${f}"/>`,
  hat: f => `<ellipse cx="50" cy="66" rx="46" ry="11" fill="${f}"/><path d="M27 62 V30 Q27 16 50 16 Q73 16 73 30 V62z" fill="${f}"/><path d="M27 54 H73" fill="none"/>`,
  sock: f => `<path d="M34 6 H64 V54 L82 68 Q94 80 84 92 Q74 98 62 90 L36 72 Q28 64 34 54z" fill="${f}"/><path d="M34 16 H64" fill="none"/>`,
  dress: f => `<path d="M38 6 H62 L60 30 L86 94 H14 L40 30z" fill="${f}"/><path d="M40 30 H60" fill="none"/>`,
  bag: f => `<path d="M34 34 V24 Q34 10 50 10 Q66 10 66 24 V34" fill="none" stroke-width="5"/><rect x="14" y="34" width="72" height="56" rx="9" fill="${f}"/>`,
  shoe: f => `<path d="M8 72 V40 Q8 30 18 30 H34 Q38 46 54 50 L82 56 Q94 60 94 72 V80 H8z" fill="${f}"/><path d="M8 72 H94" fill="none"/>`,
};
const isCol = t => t === 'colour' || t === 'scolour' || t === 'cdraw';
const isSc = t => t === 'scolour' || t === 'cdraw';
const isLin = t => t === 'lines' || t === 'plines';
const exN = ex => ex.type === 'write' ? (ex.examples || 2) : 1;   // Starters 'Listen and write' has two examples, A1 forms have one          // "Listen and write" has two examples, like the Starters test
const PITCH = {w: 1.1, m: 0.8, b: 1.3, g: 1.4};          // woman, man, boy, girl
const WHO = {w: 'Woman', m: 'Man', b: 'Boy', g: 'Girl'};
// Read spelled names letter by letter (so "D, A, N." is not read as the word "a").
const spellTTS = t => String(t).replace(/(^|, )A(?=[,.])/g, '$1ay');
const WNUM = {zero:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16, seventeen:17, eighteen:18, nineteen:19, twenty:20};
const wNorm = v => { v = String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ''); /* café = cafe */ return WNUM[v] !== undefined ? String(WNUM[v]) : v; };
const wOk = (q, v) => !!wNorm(v) && [q.a, ...(q.alt || [])].some(x => wNorm(x) === wNorm(v));   // numbers can be written as 8 or eight
const SHAPE_NAME = {apple:'apple', flower:'flower', ball:'ball', kite:'kite', balloon:'balloon', fish:'fish', star:'star', car:'car', tshirt:'T-shirt', hat:'hat', sock:'sock', dress:'dress', bag:'bag', shoe:'shoe'};

/* ---- state ---- */
let LS_ = {}, listenBest = {}, lsSlow = false;
function lsNew(n) {
  const ex = lexs()[n - 1], s = {n, placed: {}, links: {}, ticks: {}, colours: {}, nums: {}, sel: null, brush: null, checked: false};
  const e0 = (ex.qs || ex.steps)[0];   // the example is already done
  if (ex.type === 'write') s.ans = {};
  if (ex.type === 'move') s.placed[e0.o] = e0.z;
  if (isLin(ex.type)) s.links[e0.n] = e0.to;
  if (ex.type === 'tick') s.ticks[0] = e0.a;
  if (isCol(ex.type)) s.colours[e0.s] = e0.c;
  if (ex.type === 'number') s.nums[e0.p] = 1;
  return s;
}
function lsGrade(ex, s) {
  const items = (ex.qs || ex.steps);
  const res = items.map((it, i) => {
    if (ex.type === 'move') return s.placed[it.o] === it.z;
    if (isLin(ex.type)) return s.links[it.n] === it.to;
    if (ex.type === 'write') return wOk(it, s.ans[i]);
    if (ex.type === 'tick') return s.ticks[i] === it.a;
    if (isCol(ex.type)) return it.z ? s.placed[it.o] === it.z : s.colours[it.s] === it.c;
    if (ex.type === 'number') return s.nums[it.p] === i + 1;
  }).slice(exN(ex));   // the examples do not count
  const ok = res.filter(Boolean).length;
  return {res, ok, total: res.length, pct: Math.round(ok / res.length * 100)};
}
const stars = p => p === 100 ? '⭐⭐⭐' : p >= 60 ? '⭐⭐' : '⭐';

/* ---- pages ---- */
function renderListen(n) {
  n = parseInt(n);
  if (!n || !lexs()[n - 1]) return renderListenIndex();
  if (!LS_.n || LS_.n !== n) LS_ = lsNew(n);
  renderListenEx(n);
}
function renderListenIndex() {
  app.innerHTML = `
  <div class="crumbs"><a href="#/">Home</a> › Listening</div>
  <div class="banner photo lnban" style="--img:url(photos/listening.jpg)"><div class="bi">🎧</div><div><h1>Listening</h1>
    <p>${lexs().length} exercises. Listen to the audio and do what you hear: move things, draw lines, tick, colour, write and number.</p></div></div>
  ${mode === 'teacher' ? `<div class="edit lsedit"><h4>🧑‍🏫 Teacher tools · Listening exercises</h4>
    <div class="row"><select class="in" id="newType">${Object.entries(LTYPES).map(([k, t]) => `<option value="${k}">${t.icon} ${t.name}</option>`).join('')}</select>
      <input class="in" id="newGroup" list="lsGroups" value="${esc(lsGroups()[0] || LS_GROUP)}" placeholder="Section" title="Which section the new exercise goes in">
      <datalist id="lsGroups">${lsGroups().map(g => `<option value="${esc(g)}">`).join('')}</datalist>
      <button class="btn sun sm" id="newEx">➕ New exercise</button>
      <input class="in" id="newSec" placeholder="New section name, e.g. Listening for Movers" style="min-width:240px"><button class="btn sm" id="addSec">➕ Add section</button>
      <button class="btn ghost sm" id="resetEx" style="margin-left:auto">↺ Restore the original exercises</button></div>
    <p class="lbl" style="margin:10px 0 0">Open any exercise to edit its sentences, pictures and answers, or to move it to another section. Use ↑ to change the order. Type a new section name to start a new section (for example “Listening for Movers”).</p></div>` : ''}
  ${lsGroups().map(gname => { const list = lexs().map((ex, i) => [ex, i]).filter(([ex]) => lsGroup(ex) === gname), done = list.filter(([ex]) => listenBest[ex.id] !== undefined).length;
    return `<section class="lsec"><div class="lsech"><h2>🎧 ${esc(gname)}</h2>
      <div class="row" style="gap:8px"><span class="lbl">${list.length ? `${list.length} exercise${list.length === 1 ? '' : 's'} · ${done} done` : 'No exercises yet'}</span>
      ${mode === 'teacher' ? `<button class="btn sm sun" data-gadd="${esc(gname)}" title="Add a new exercise to this section">➕ Exercise</button>
        <button class="btn sm ghost" data-gren="${esc(gname)}" title="Rename this section">✏️</button>
        <button class="btn sm ghost" data-gdel="${esc(gname)}" title="Delete this section">🗑</button>` : ''}</div></div>
  ${list.length ? '' : `<div class="lempty">${mode === 'teacher' ? 'Press <b>➕ Exercise</b> to add the first exercise to this section (choose the type in Teacher tools above).' : 'Coming soon! 🎧'}</div>`}
  <div class="lgrid">${list.map(([ex, i], k) => { const b = listenBest[ex.id], t = LTYPES[ex.type]; return `
    <div class="lcard2" data-go="#/listening/${i + 1}">
      <div class="lnum">${k + 1}</div><div class="lic">${esc(ex.icon)}</div>
      <b>${esc(ex.title)}</b><span class="ltype">${t.icon} ${t.name}</span>
      ${b !== undefined ? `<span class="pbest" style="background:${pcol(b)}">${stars(b)} ${b}%</span>` : '<span class="pbest none">Not done yet</span>'}
      ${mode === 'teacher' ? `<div class="row" style="gap:6px;margin-top:4px"><button class="btn sm ghost" data-up="${i}" ${k ? '' : 'disabled'}>↑</button><button class="btn sm ghost" data-del="${i}">🗑 Delete</button></div>` : ''}
    </div>`; }).join('')}</div></section>`; }).join('')}`;
  app.querySelectorAll('[data-go]').forEach(el => el.onclick = e => { if (!e.target.closest('button')) go(el.dataset.go); });
  if (mode !== 'teacher') return;
  const keep = () => { const y = window.scrollY; renderListenIndex(); window.scrollTo(0, y); };
  $('#newEx').onclick = async () => {
    const tp = $('#newType').value, base = LEX.find(e => e.type === tp), grp = $('#newGroup').value.trim() || LS_GROUP;
    const ex = {...JSON.parse(JSON.stringify(base)), id: uid(), title: 'New ' + LTYPES[tp].name.toLowerCase() + ' exercise', group: grp};
    lexs().push(ex); await save(); LS_ = {}; go('#/listening/' + lexs().length); toast(`New exercise added to “${grp}” — edit it below`);
  };
  $('#resetEx').onclick = async () => { if (!confirm('Replace ALL listening exercises with the original ones? Your changes will be lost.')) return; state.listen.exercises = defaultListen(); state.listen.v = LISTEN_V; LS_ = {}; await save(); keep(); toast('Original exercises restored'); };
  const groups = () => state.listen.groups || (state.listen.groups = []);
  $('#addSec').onclick = async () => {
    const nm = $('#newSec').value.trim(); if (!nm) return toast('Write the section name first');
    if (lsGroups().some(g => g.toLowerCase() === nm.toLowerCase())) return toast('That section already exists');
    groups().push(nm); await save(); keep(); toast(`Section “${nm}” added`);
  };
  app.querySelectorAll('[data-gadd]').forEach(b => b.onclick = () => { $('#newGroup').value = b.dataset.gadd; $('#newEx').click(); });
  app.querySelectorAll('[data-gren]').forEach(b => b.onclick = async () => {
    const old = b.dataset.gren, nm = (prompt('New name for this section:', old) || '').trim(); if (!nm || nm === old) return;
    if (lsGroups().some(g => g !== old && g.toLowerCase() === nm.toLowerCase())) return toast('That section already exists');
    const gs = groups(), k = gs.indexOf(old); if (k >= 0) gs[k] = nm; else gs.push(nm);
    lexs().forEach(e => { if (lsGroup(e) === old) e.group = nm; }); await save(); keep(); toast('Section renamed');
  });
  app.querySelectorAll('[data-gdel]').forEach(b => b.onclick = async () => {
    const nm = b.dataset.gdel, n = lexs().filter(e => lsGroup(e) === nm).length;
    if (n) return toast(`This section has ${n} exercise${n === 1 ? '' : 's'}. Move or delete them first.`);
    if (!confirm(`Delete the empty section “${nm}”?`)) return;
    state.listen.groups = groups().filter(g => g !== nm); await save(); keep();
  });
  app.querySelectorAll('[data-up]').forEach(b => b.onclick = async () => {   // move up within its own section
    const i = +b.dataset.up, a = lexs(), gname = lsGroup(a[i]); let j = i - 1; while (j >= 0 && lsGroup(a[j]) !== gname) j--;
    if (j < 0) return; [a[j], a[i]] = [a[i], a[j]]; LS_ = {}; await save(); keep(); });
  app.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { const i = +b.dataset.del; if (!confirm(`Delete the exercise “${lexs()[i].title}”?`)) return; lexs().splice(i, 1); LS_ = {}; await save(); keep(); });
}
function renderListenEx(n) {
  const ex = lexs()[n - 1], s = LS_, t = LTYPES[ex.type], items = (ex.qs || ex.steps), g = s.checked ? lsGrade(ex, s) : null;
  app.innerHTML = `
  ${(() => { const gname = lsGroup(ex), sec = lexs().map((e, i) => [e, i + 1]).filter(([e]) => lsGroup(e) === gname), k = sec.findIndex(([, m]) => m === n), prev = sec[k - 1], next = sec[k + 1];
    return `<div class="crumbs"><a href="#/">Home</a> › <a href="#/listening">Listening</a> › ${esc(gname)} › ${k + 1}. ${esc(ex.title)}</div>
  <div class="lhead"><div><span class="lv" style="background:#00b4d8">🎧 ${esc(gname)} · ${k + 1} of ${sec.length}</span><h1>${ex.icon} ${esc(ex.title)}</h1></div>
    <div class="row">${prev ? `<a class="btn ghost sm" href="#/listening/${prev[1]}">← ${k}</a>` : ''}${next ? `<a class="btn ghost sm" href="#/listening/${next[1]}">${k + 2} →</a>` : ''}</div></div>`; })()}
  <div class="panel">
    <div class="linstr"><span class="ltype big">${t.icon} ${t.name}</span><span>${esc(ex.how || t.how)} <b>${exN(ex) > 1 ? 'There are two examples.' : 'There is one example.'}</b></span></div>
    <div class="lplayer">
      <button class="btn teal" id="lPlayAll">▶ Play all</button>
      <div class="lsteps">${items.map((_, i) => `<button class="btn ghost sm lstep" data-st="${i}">${i < exN(ex) ? '🔊 Example' + (exN(ex) > 1 ? ' ' + (i + 1) : '') : '🔊 ' + (i - exN(ex) + 1)}</button>`).join('')}</div>
      <button class="btn ghost sm" id="lSlow">${lsSlow ? '🐢 Slow: on' : '🐢 Slow: off'}</button>
    </div>
    <div id="lAct">${lsActHTML(ex, s, g)}</div>
    ${g ? `<div class="lres" style="--c:${pcol(g.pct)}"><div class="ring" style="--p:${g.pct};--rc:${pcol(g.pct)}"><span>${g.ok}/${g.total}</span></div>
      <div><div style="font-size:30px">${stars(g.pct)}</div><b class="baloo" style="font-size:26px;color:${pcol(g.pct)}">${g.pct === 100 ? 'Excellent! All correct!' : g.pct >= 60 ? 'Good job!' : 'Keep practising!'}</b>
      <div class="hint" style="margin:4px 0 0">Wrong answers are marked ✗. Listen again and try once more.</div></div></div>` : ''}
    <div class="row" style="justify-content:center;margin-top:18px">
      ${g ? `<button class="btn ghost" id="lShow">👀 Show the answers</button><button class="btn sun" id="lAgain">↻ Try again</button>${n < lexs().length ? `<a class="btn" style="background:#00b4d8" href="#/listening/${n + 1}">Next exercise →</a>` : ''}`
        : `<button class="btn sun" id="lCheck">✔ Check my answers</button>`}
    </div>
  </div>
  ${mode === 'teacher' ? lsEditorHTML(ex) : ''}`;
  bindListen(ex, s);
  if (mode === 'teacher') bindLsEditor(ex, n);
}
function lsActHTML(ex, s, g) {
  const mark = (i, extra = '') => g ? `<span class="lmark ${g.res[i - 1] ? 'ok' : 'no'}" ${extra}>${g.res[i - 1] ? '✓' : '✗'}</span>` : '';
  const stepOf = (key, val) => ex.steps.findIndex(st => st[key] === val);
  if (ex.type === 'move') {
    const tray = ex.objects.filter(o => !s.placed[o.id]);
    return `<div class="lstage bg-${ex.bg} ${s.sel ? 'picking' : ''}" id="lStage">
        ${ex.items.map(pieceHTML).join('')}
        ${ex.zones.map(z => `<div class="lzone" data-z="${z.id}" style="left:${z.x}%;top:${z.y}%"></div>`).join('')}
        ${ex.objects.filter(o => s.placed[o.id]).map(o => { const z = ex.zones.find(z => z.id === s.placed[o.id]), i = stepOf('o', o.id), ex0 = i === 0;
          return `<div class="lobj onstage ${ex0 ? 'ex' : ''} ${s.sel === o.id ? 'sel' : ''}" data-o="${o.id}" style="left:${z.x}%;top:${z.y}%">${o.e}${i > 0 ? mark(i) : ''}</div>`; }).join('')}
      </div>
      <div class="ltray" id="lTray">${tray.length ? tray.map(o => `<div class="lobj ${s.sel === o.id ? 'sel' : ''}" data-o="${o.id}">${o.e}</div>`).join('') : '<span class="lbl">All the things are in the picture.</span>'}</div>`;
  }
  if (ex.type === 'lines') {
    return `<div class="lwrap" id="lWrap">
      <div class="lnames">${ex.names.map(nm => { const i = stepOf('n', nm); return `<button class="lname ${s.sel === nm ? 'sel' : ''} ${s.links[nm] ? 'linked' : ''} ${i === 0 ? 'ex' : ''}" data-n="${esc(nm)}">${esc(nm)}${i > 0 && s.links[nm] ? mark(i) : ''}</button>`; }).join('')}</div>
      <div class="lstage bg-${ex.bg}" id="lStage">
        ${ex.people.map(p => `<div class="lperson" data-p="${p.id}" style="left:${p.x}%;top:${p.y}%"><span class="pe1">${p.e}</span>${p.p ? `<span class="pe2">${p.p}</span>` : ''}</div>`).join('')}
      </div>
      <svg class="llines" id="lLines"></svg></div>`;
  }
  if (ex.type === 'write') {
    const E = exN(ex);
    return `<div class="wqs">${ex.qs.map((q, i) => { const isEx = i < E, v = isEx ? q.a : (s.ans[i] || ''), ok = g && !isEx ? g.res[i - E] : null;
      return `${i === 0 ? `<div class="wqh">${E > 1 ? 'Examples' : 'Example'}</div>` : ''}${i === E ? '<div class="wqh">Questions</div>' : ''}
        <div class="wq ${isEx ? 'ex' : ''} ${ok === true ? 'good' : ok === false ? 'wrong' : ''}">
          <span class="wqn">${isEx ? '' : i - E + 1}</span><span class="wqq">${esc(q.q)}</span>
          <span class="wqa">${q.pre ? `<span>${esc(q.pre)}</span>` : ''}<input class="in win" data-wi="${i}" value="${esc(v)}" ${isEx ? `style="width:${Math.max(150, String(v).length * 12 + 34)}px"` : ''} ${isEx || s.checked ? 'disabled' : ''} autocomplete="off" spellcheck="false" autocapitalize="off" aria-label="${esc(q.q)}">${q.post ? `<span>${esc(q.post)}</span>` : ''}</span>
          ${ok !== null ? `<span class="lmark ${ok ? 'ok' : 'no'}">${ok ? '✓' : '✗'}</span>` : ''}
        </div>`; }).join('')}</div>
      <p class="lbl" style="margin:10px 0 0">Write numbers as 8 or eight. Spell names carefully!</p>
      ${s.checked ? `<details class="wscript"><summary>📜 Show the audioscript</summary>${ex.qs.map(q => q.say.map(l => `<p><b>${WHO[l.w] || ''}:</b> ${esc(l.t)}</p>`).join('')).join('<hr>')}</details>` : ''}`;
  }
  if (ex.type === 'plines') {
    return `<div class="lwrap" id="lWrap">
      <div class="lnames">${ex.objects.map(o => { const i = stepOf('n', o.id); return `<button class="lname lobjname ${s.sel === o.id ? 'sel' : ''} ${s.links[o.id] ? 'linked' : ''} ${i === 0 ? 'ex' : ''}" data-n="${o.id}"><span class="loe">${o.e}</span>${esc(o.w)}${i > 0 && s.links[o.id] ? mark(i) : ''}</button>`; }).join('')}</div>
      <div class="lstage bg-${ex.bg}" id="lStage">${ex.items.map(pieceHTML).join('')}
        ${ex.spots.map(sp => { const who = Object.keys(s.links).find(k => s.links[k] === sp.id), o = who && ex.objects.find(x => x.id === who);
          return `<div class="lperson lspot ${o ? 'filled' : ''}" data-p="${sp.id}" title="${esc(zoneLabel(sp.id))}" style="left:${sp.x}%;top:${sp.y}%">${o ? `<span class="lse">${o.e}</span>` : ''}</div>`; }).join('')}
      </div>
      <svg class="llines" id="lLines"></svg></div>`;
  }
  if (ex.type === 'tick') {
    return `<div class="lticks">${ex.qs.map((q, i) => `<div class="tq ${i === 0 ? 'ex' : ''}"><div class="tqn">${i === 0 ? 'Example' : i}</div>
      <div class="tqb">${q.q ? `<div class="tqq">${esc(q.q)}</div>` : ''}<div class="topts">${q.o.map((o, k) => { const ch = s.ticks[i] === k; let cls = ch ? 'ch' : '';
        if (g && i > 0) cls += k === q.a && ch ? ' good' : ch ? ' wrong' : '';
        return `<button class="topt ${cls}" data-q="${i}" data-k="${k}" ${i === 0 ? 'disabled' : ''}><span class="tabc">${'ABC'[k]}</span>${miniHTML(o)}${ch ? '<span class="tickm">✔</span>' : ''}</button>`; }).join('')}</div></div>
      ${i > 0 ? mark(i) : ''}</div>`).join('')}</div>`;
  }
  if (ex.type === 'colour') {
    return `<div class="lpal">${Object.keys(CLR).filter(c => c !== 'grey').map(c => `<button class="lsw ${s.brush === c ? 'sel' : ''}" data-c="${c}" style="background:${CLR[c]}" title="${c}"><span>${c}</span></button>`).join('')}</div>
      <div class="lshapes">${ex.shapes.map(k => { const c = s.colours[k], i = stepOf('s', k);
        return `<button class="lshape ${i === 0 ? 'ex' : ''}" data-s="${k}"><svg viewBox="0 0 100 100">${SHAPES[k](c ? CLR[c] : '#fff')}</svg><span>${SHAPE_NAME[k]}</span>${i > 0 && c ? mark(i) : ''}</button>`; }).join('')}</div>`;
  }
  if (isSc(ex.type)) {
    return `<div class="lpal">${Object.keys(CLR).filter(c => c !== 'grey').map(c => `<button class="lsw ${s.brush === c ? 'sel' : ''}" data-c="${c}" style="background:${CLR[c]}" title="${c}"><span>${c}</span></button>`).join('')}</div>
      <div class="lstage bg-${ex.bg}" style="margin-top:28px">${ex.items.map(pieceHTML).join('')}
        ${ex.things.map(th => { const c = s.colours[th.id], i = stepOf('s', th.id);
          return `<button class="lthing ${i === 0 ? 'ex' : ''}" data-s="${th.id}" title="${esc(SHAPE_NAME[th.k] + ' ' + th.lbl)}" style="left:${th.x}%;top:${th.y}%;width:${th.w}%"><svg viewBox="0 0 100 100">${SHAPES[th.k](c ? CLR[c] : '#fff')}</svg>${i > 0 && c ? mark(i) : ''}</button>`; }).join('')}
        ${(ex.spots || []).map(sp => { const who = Object.keys(s.placed).find(k => s.placed[k] === sp.id), o = who && (ex.draws || []).find(d => d.id === who), i = who ? ex.steps.findIndex(st => st.o === who) : -1;
          return `<button class="dspot ${o ? 'filled' : ''}" data-z="${sp.id}" style="left:${sp.x}%;top:${sp.y}%" title="${esc(zoneLabel(sp.id))}">${o ? `<span class="dse">${o.e}</span>${i > 0 ? mark(i) : ''}` : ''}</button>`; }).join('')}
      </div>
      ${(ex.draws || []).length ? `<div class="ltray" id="lTray">${ex.draws.filter(d => !s.placed[d.id]).map(d => `<div class="lobj dobj ${s.sel === d.id ? 'sel' : ''}" data-o="${d.id}">${d.e}</div>`).join('') || '<span class="lbl">Everything is drawn in the picture.</span>'}</div>` : ''}`;
  }
  if (ex.type === 'number') {
    const used = Object.values(s.nums);
    return `<div class="lnums">${ex.steps.map((_, i) => i === 0 ? '' : `<button class="lnb ${s.brush === i + 1 ? 'sel' : ''} ${used.includes(i + 1) ? 'used' : ''}" data-num="${i + 1}">${i + 1}</button>`).join('')}</div>
      <div class="lpics">${ex.pics.map(p => { const nmb = s.nums[p.id], i = nmb ? nmb - 1 : -1;
        return `<button class="lpic ${i === 0 ? 'ex' : ''}" data-pic="${p.id}"><span class="lpe">${p.e}</span>${nmb ? `<span class="lnbadge">${nmb}</span>` : ''}${i > 0 ? mark(i) : ''}</button>`; }).join('')}</div>`;
  }
}
function drawLines(ex, s, showAns) {
  const w = $('#lWrap'), svg = $('#lLines'); if (!w || !svg) return;
  const R = w.getBoundingClientRect(); svg.setAttribute('viewBox', `0 0 ${R.width} ${R.height}`);
  const g = s.checked ? lsGrade(ex, s) : null;
  const pairs = showAns ? ex.steps.map(st => [st.n, st.to]) : Object.entries(s.links);
  svg.innerHTML = pairs.map(([nm, pid]) => {
    const a = w.querySelector(`.lname[data-n="${CSS.escape(nm)}"]`), b = w.querySelector(`.lperson[data-p="${pid}"]`); if (!a || !b) return '';
    const A = a.getBoundingClientRect(), B = b.getBoundingClientRect(), i = ex.steps.findIndex(st => st.n === nm);
    const col = showAns ? '#1b9e5a' : i === 0 ? '#9aa0a6' : g ? (g.res[i - 1] ? '#1b9e5a' : '#e63946') : '#3a86ff';
    return `<line x1="${A.left + A.width / 2 - R.left}" y1="${A.bottom - R.top}" x2="${B.left + B.width / 2 - R.left}" y2="${B.top + 6 - R.top}" stroke="${col}" stroke-width="4" stroke-linecap="round" ${i === 0 || showAns ? 'stroke-dasharray="8 7"' : ''}/>`;
  }).join('');
}
function bindListen(ex, s) {
  const items = (ex.qs || ex.steps), n = s.n, re = () => { const y = window.scrollY; renderListenEx(n); window.scrollTo(0, y); };
  const sayStep = (i, cb) => {
    app.querySelectorAll('.lstep').forEach(b => b.classList.toggle('now', +b.dataset.st === i));
    const V2 = ex.voices || ['w', 'b'], raw = items[i].say, seg = Array.isArray(raw) ? raw : String(raw).split(/\s+—\s+/).map((t, j, arr) => ({t, w: arr.length > 1 ? V2[j % 2] : undefined})), tok = playToken; let k = 0;   // a conversation has several lines and speakers
    const nx = () => { if (tok !== playToken) return; if (k >= seg.length) { app.querySelectorAll('.lstep').forEach(b => b.classList.remove('now')); return cb && cb(); }
      const ln = seg[k++]; say(spellTTS(ln.t), () => setTimeout(nx, 350), lsSlow ? 0.65 : 0.85, PITCH[ln.w] || 1); };
    nx();
  };
  app.querySelectorAll('.lstep').forEach(b => b.onclick = () => { playToken++; sayStep(+b.dataset.st); });
  $('#lPlayAll').onclick = () => { const tok = ++playToken; let i = 0; const nx = () => { if (tok !== playToken || i >= items.length) return; sayStep(i++, () => setTimeout(() => tok === playToken && nx(), 1400)); }; nx(); };
  $('#lSlow').onclick = () => { lsSlow = !lsSlow; $('#lSlow').textContent = lsSlow ? '🐢 Slow: on' : '🐢 Slow: off'; };
  if ($('#lCheck')) $('#lCheck').onclick = async () => {
    stopAll(); s.checked = true; s.sel = null; const g = lsGrade(ex, s);
    if (listenBest[ex.id] === undefined || g.pct > listenBest[ex.id]) { listenBest[ex.id] = g.pct; await DB.put('kv', 'listenById', listenBest); }
    onActivity();
    re(); if (g.pct === 100) say('Excellent!', null, 1);
  };
  if ($('#lAgain')) $('#lAgain').onclick = () => { LS_ = lsNew(n); re(); };
  if ($('#lShow')) $('#lShow').onclick = () => {
    const a = lsNew(n);
    items.forEach((it, i) => { if (ex.type === 'move') a.placed[it.o] = it.z; if (isLin(ex.type)) a.links[it.n] = it.to; if (ex.type === 'write') a.ans[i] = it.a; if (ex.type === 'tick') a.ticks[i] = it.a; if (isCol(ex.type)) { if (it.z) a.placed[it.o] = it.z; else a.colours[it.s] = it.c; } if (ex.type === 'number') a.nums[it.p] = i + 1; });
    a.checked = true; LS_ = a; re(); toast('These are the right answers ✔');
  };
  const locked = () => s.checked;
  const isEx = (key, val) => ex.steps && ex.steps[0][key] === val;

  if (ex.type === 'move') {
    const stage = $('#lStage');
    const place = (oid, zid) => { if (zid) { Object.keys(s.placed).forEach(k => { if (s.placed[k] === zid && !isEx('o', k)) delete s.placed[k]; }); s.placed[oid] = zid; } else delete s.placed[oid]; s.sel = null; re(); };
    const zoneAt = (cx, cy) => { const R = stage.getBoundingClientRect(); if (cx < R.left || cx > R.right || cy < R.top || cy > R.bottom) return null;
      const x = (cx - R.left) / R.width * 100, y = (cy - R.top) / R.height * 100; let best = null, bd = 1e9;
      ex.zones.forEach(z => { if (isEx('z', z.id)) return; const d = Math.hypot(x - z.x, (y - z.y) * 0.625); if (d < bd) { bd = d; best = z; } });
      return bd < 13 ? best.id : null; };
    app.querySelectorAll('.lobj').forEach(el => {
      const oid = el.dataset.o; if (isEx('o', oid) || locked()) return;
      el.onpointerdown = e => {
        e.preventDefault(); const sx = e.clientX, sy = e.clientY, R = el.getBoundingClientRect(); let moved = false;
        const ghost = el.cloneNode(true); ghost.className = 'lobj ghost'; ghost.style.cssText = `left:${R.left + R.width / 2}px;top:${R.top + R.height / 2}px;font-size:${getComputedStyle(el).fontSize}`;
        const mv = ev => { if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) { moved = true; document.body.appendChild(ghost); el.style.opacity = .3; stage.classList.add('picking'); }
          if (moved) { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; } };
        const up = ev => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); ghost.remove();
          if (moved) place(oid, zoneAt(ev.clientX, ev.clientY));
          else { s.sel = s.sel === oid ? null : oid; re(); } };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
      };
    });
    app.querySelectorAll('.lzone').forEach(z => z.onclick = () => { if (s.sel && !locked() && !isEx('z', z.dataset.z)) place(s.sel, z.dataset.z); });
    $('#lTray').onclick = e => { if (e.target.id === 'lTray' && s.sel && !locked()) place(s.sel, null); };
  }
  if (isLin(ex.type)) {
    const showAns = false;
    requestAnimationFrame(() => drawLines(ex, s, showAns));
    window.onresize = () => drawLines(ex, s, showAns);
    app.querySelectorAll('.lname').forEach(b => b.onclick = () => { const nm = b.dataset.n; if (locked() || isEx('n', nm)) return; s.sel = s.sel === nm ? null : nm; re(); });
    app.querySelectorAll('.lperson').forEach(p => p.onclick = () => {
      if (locked() || !s.sel) return; const pid = p.dataset.p; if (isEx('to', pid)) return toast('That one is the example');
      Object.keys(s.links).forEach(k => { if (s.links[k] === pid && !isEx('n', k)) delete s.links[k]; });
      s.links[s.sel] = pid; s.sel = null; re();
    });
  }
  if (ex.type === 'write') app.querySelectorAll('.win:not(:disabled)').forEach(el => {
    el.oninput = () => { s.ans[+el.dataset.wi] = el.value; };
    el.onkeydown = e => { if (e.key === 'Enter') { const all = [...app.querySelectorAll('.win:not(:disabled)')], k = all.indexOf(el); (all[k + 1] || $('#lCheck')).focus(); } };
  });
  if (ex.type === 'tick') app.querySelectorAll('.topt').forEach(b => b.onclick = () => { if (locked()) return; s.ticks[+b.dataset.q] = +b.dataset.k; re(); });
  if (isCol(ex.type)) {
    app.querySelectorAll('.lsw').forEach(b => b.onclick = () => { s.brush = b.dataset.c; re(); });
    app.querySelectorAll('.lshape, .lthing').forEach(b => b.onclick = () => { if (locked() || isEx('s', b.dataset.s)) return; if (!s.brush) return toast('First choose a colour 🎨'); s.colours[b.dataset.s] = s.brush; re(); });
    app.querySelectorAll('.dobj').forEach(b => b.onclick = () => { if (locked()) return; s.sel = s.sel === b.dataset.o ? null : b.dataset.o; re(); });
    app.querySelectorAll('.dspot').forEach(sp => sp.onclick = () => {
      if (locked()) return; const z = sp.dataset.z, who = Object.keys(s.placed).find(k => s.placed[k] === z);
      if (!s.sel) { if (who) { delete s.placed[who]; re(); } else toast('First tap a thing in the tray ✏️'); return; }
      if (who) delete s.placed[who]; s.placed[s.sel] = z; s.sel = null; re(); });
  }
  if (ex.type === 'number') {
    app.querySelectorAll('.lnb').forEach(b => b.onclick = () => { s.brush = +b.dataset.num; re(); });
    app.querySelectorAll('.lpic').forEach(b => b.onclick = () => {
      const id = b.dataset.pic; if (locked() || s.nums[id] === 1) return;
      if (s.nums[id] && (!s.brush || s.nums[id] === s.brush)) { delete s.nums[id]; return re(); }
      if (!s.brush) return toast('First choose a number 🔢');
      Object.keys(s.nums).forEach(k => { if (s.nums[k] === s.brush) delete s.nums[k]; });
      s.nums[id] = s.brush; s.brush = null; re();
    });
  }
}

/* ---- listening: editable data + teacher editor ---- */
const lexs = () => state.listen.exercises;
// Sections on the Listening page. Every exercise so far belongs to "Listening for Starters".
const LS_GROUP = 'Listening for Starters';
const lsGroup = ex => (ex.group || '').trim() || LS_GROUP;
const LS_DEFAULT_GROUPS = [LS_GROUP, 'A1 listening', 'A2 listening', 'B1 listening', 'B2 listening', 'C1 listening', 'C2 listening'];
// Sections in order: the saved list (empty sections included), then any section only named on an exercise.
const lsGroups = () => [...new Set([...(state.listen.groups || []), ...lexs().map(lsGroup)])];
function groupListen() {
  let ch = false;
  state.listen.exercises.forEach(e => { if (!e.group) { e.group = LS_GROUP; ch = true; } });
  if (!Array.isArray(state.listen.groups)) { state.listen.groups = []; ch = true; }
  if (!state.listen.gv) {   // add the level sections once (so a section the teacher deletes does not come back)
    LS_DEFAULT_GROUPS.forEach(g => { if (!state.listen.groups.includes(g)) state.listen.groups.push(g); });
    state.listen.gv = 1; ch = true;
  }
  return ch;
}
function defaultListen() { return JSON.parse(JSON.stringify(LEX)).sort((a, b) => (a.v || 1) - (b.v || 1)).map(ex => ({id: uid(), group: LS_GROUP, ...ex})); }
const LISTEN_V = 24;   // bump when new default exercises are added, so existing courses get them too
function upgradeListen() { const v = state.listen.v || 1; if (v < LISTEN_V) { state.listen.exercises.push(...defaultListen().filter(e => (e.v || 1) > v)); state.listen.v = LISTEN_V; return true; } return false; }
const ZTHING = {pond: 'water'};
function zoneLabel(id) { const i = id.indexOf('-'), p = id.slice(0, i), t = id.slice(i + 1); return ({on: 'on the', under: 'under the', 'in': 'in the', next: 'next to the'}[p] || p) + ' ' + (ZTHING[t] || t); }
const MOVE_SCENES = LEX.filter(e => e.type === 'move').map(e => ({name: e.title, bg: e.bg, items: e.items, zones: e.zones}));
const BGS = {room: 'Living room', bedroom: 'Bedroom', kitchen: 'Kitchen', park: 'Park', class: 'Classroom', beach: 'Beach', party: 'Party', street: 'Street', bathroom: 'Bathroom', pool: 'Swimming pool', cards: 'Picture cards'};
const TFURN = [['🪑', 'chair'], ['📦', 'box'], ['table', 'table'], ['🛏️', 'bed'], ['🌳', 'tree'], ['🎒', 'bag']];
const TPREP = [['on', 'on'], ['under', 'under'], ['in', 'in'], ['next', 'next to']];
const OPTS = (arr, cur) => arr.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(l)}</option>`).join('');
function setPath(o, path, v) { const ks = path.split('.'); let t = o; for (let i = 0; i < ks.length - 1; i++) t = t[ks[i]]; t[ks[ks.length - 1]] = v; }

function lsEditorHTML(ex) {
  const T = ex.type, items = (ex.qs || ex.steps), warn = [];
  const lbl = i => `<span class="ew">${i ? 'Question ' + i : 'Example'}</span>`;
  const sayIn = (path, v) => `<div class="sayin grow"><input class="in grow" data-ef="${path}" value="${esc(v)}" placeholder="What the students hear"><button class="btn sm ghost" data-hear title="Hear it">▶</button></div>`;
  const del = i => `<button class="btn sm ghost" data-delstep="${i}" title="Delete">🗑</button>`;
  let head = '', body = '';
  if (T === 'move') {
    const cur = MOVE_SCENES.findIndex(sc => sc.bg === ex.bg && sc.zones.map(z => z.id).join() === ex.zones.map(z => z.id).join());
    head = `<label class="field"><span>Picture</span><select class="in" data-scene>${cur < 0 ? '<option>Custom</option>' : ''}${OPTS(MOVE_SCENES.map((sc, k) => [k, sc.name]), cur)}</select></label>`;
    const zones = ex.zones.map(z => [z.id, zoneLabel(z.id)]), obj = id => ex.objects.find(o => o.id === id) || {e: '?'};
    body = `<div class="eh"><span></span><span>Sentence</span><span>Thing</span><span>Correct place</span></div>` +
      ex.steps.map((st, i) => `<div class="erow">${lbl(i)}${sayIn(`steps.${i}.say`, st.say)}<input class="in emo-in" data-obj="${st.o}" value="${esc(obj(st.o).e)}" title="The thing (emoji)"><select class="in" data-ef="steps.${i}.z">${OPTS(zones, st.z)}</select>${del(i)}</div>`).join('');
    const extras = ex.objects.filter(o => !ex.steps.some(st => st.o === o.id));
    body += `<div class="erow"><span class="ew">Extra things</span><span class="lbl grow">Things in the tray that are not in the audio (to make it harder):</span>
      ${extras.map(o => `<input class="in emo-in" data-obj="${o.id}" value="${esc(o.e)}"><button class="btn sm ghost" data-delobj="${o.id}">🗑</button>`).join('')}
      <button class="btn sm ghost" data-act="addobj">➕ Extra thing</button></div>`;
    const zs = ex.steps.map(s => s.z); if (new Set(zs).size !== zs.length) warn.push('Two questions use the same place — each place can hold only one thing.');
  }
  if (T === 'lines') {
    head = `<label class="field"><span>Background</span><select class="in" data-ef="bg">${OPTS(Object.entries(BGS), ex.bg)}</select></label>`;
    body = `<div class="erow"><span class="ew">Names</span><input class="in grow" data-names value="${esc(ex.names.join(', '))}" placeholder="Ben, Anna, Sam …"><span class="lbl">Add one or two extra names to make it harder.</span></div>
      <div class="erow"><span class="ew">People</span>${ex.people.map((p, k) => `<span class="pslot"><b>${k + 1}</b><input class="in emo-in" data-ef="people.${k}.e" value="${esc(p.e)}" title="Person ${k + 1}"><input class="in emo-in" data-ef="people.${k}.p" value="${esc(p.p)}" title="What person ${k + 1} has or does"></span>`).join('')}</div>
      <div class="eh"><span></span><span>Sentence</span><span>Name</span><span>Person</span></div>` +
      ex.steps.map((st, i) => `<div class="erow">${lbl(i)}${sayIn(`steps.${i}.say`, st.say)}<select class="in" data-ef="steps.${i}.n">${OPTS(ex.names.map(x => [x, x]), st.n)}${ex.names.includes(st.n) ? '' : `<option selected>${esc(st.n)} (missing)</option>`}</select>
        <select class="in" data-ef="steps.${i}.to">${OPTS(ex.people.map((p, k) => [p.id, `${k + 1}: ${p.e} ${p.p}`]), st.to)}</select>${del(i)}</div>`).join('');
    const ns = ex.steps.map(s => s.n), ps = ex.steps.map(s => s.to);
    if (new Set(ns).size !== ns.length) warn.push('The same name is used in two questions.');
    if (new Set(ps).size !== ps.length) warn.push('The same person is used in two questions.');
    if (ns.some(x => !ex.names.includes(x))) warn.push('A question uses a name that is not in the names list.');
  }
  if (T === 'tick') {
    body = `<p class="lbl" style="margin:0 0 8px">Optional: write a question the students read. For a conversation, write it as <b>question — answer — …</b> (with dashes) and two voices will read it.</p>` +
      ex.qs.map((q, i) => `<div class="tqe"><div class="erow" style="margin:0 0 6px"><span class="ew"></span><input class="in grow" data-ef="qs.${i}.q" value="${esc(q.q || '')}" placeholder="Question the students read (optional), e.g. What is Jill wearing?"></div>
      <div class="erow" style="margin:0">${lbl(i)}${sayIn(`qs.${i}.say`, q.say)}${del(i)}</div>
      <div class="optEs">${q.o.map((o, k) => `<div class="optE ${q.a === k ? 'right' : ''}">
        <div class="mprev">${miniHTML(o)}</div>
        <select class="in" data-otype="${i}.${k}">${OPTS([['pic', 'Pictures'], ['pos', 'Position']], typeof o === 'string' ? 'pic' : 'pos')}</select>
        ${typeof o === 'string' ? `<input class="in" data-ef="qs.${i}.o.${k}" value="${esc(o)}" placeholder="emoji, e.g. 🍎🍎🍎">`
          : `<div class="row" style="gap:4px"><input class="in emo-in" data-ef="qs.${i}.o.${k}.o" value="${esc(o.o)}" title="Thing"><select class="in" data-ef="qs.${i}.o.${k}.p">${OPTS(TPREP, o.p)}</select><select class="in" data-ef="qs.${i}.o.${k}.f">${OPTS(TFURN, o.f)}</select></div>`}
        <label class="lbl"><input type="radio" name="cor${i}" data-correct="${i}" value="${k}" ${q.a === k ? 'checked' : ''}> Right answer</label>
      </div>`).join('')}</div></div>`).join('');
  }
  if (T === 'colour') {
    head = '';
    body = `<div class="erow"><span class="ew">Pictures</span>${ex.shapes.map((sh, k) => `<select class="in" data-ef="shapes.${k}">${OPTS(Object.keys(SHAPES).map(x => [x, SHAPE_NAME[x]]), sh)}</select>`).join('')}</div>
      <div class="eh"><span></span><span>Sentence</span><span>Picture</span><span>Colour</span></div>` +
      ex.steps.map((st, i) => `<div class="erow">${lbl(i)}${sayIn(`steps.${i}.say`, st.say)}<select class="in" data-ef="steps.${i}.s">${OPTS(ex.shapes.map(x => [x, SHAPE_NAME[x]]), st.s)}</select>
        <select class="in" data-ef="steps.${i}.c">${OPTS(Object.keys(CLR).filter(c => c !== 'grey').map(c => [c, c]), st.c)}</select>${del(i)}</div>`).join('');
    if (new Set(ex.shapes).size !== ex.shapes.length) warn.push('The same picture is chosen twice.');
    const ss = ex.steps.map(s => s.s); if (new Set(ss).size !== ss.length) warn.push('Two questions colour the same picture.');
    if (ss.some(x => !ex.shapes.includes(x))) warn.push('A question uses a picture that is not shown.');
  }
  if (T === 'write') {
    const E = exN(ex);
    body = `<p class="lbl" style="margin:0 0 8px">${E > 1 ? 'The first two are the examples' : 'The first one is the example'} (already answered for the students). For spelling, write the letters with commas: <b>S, A, M.</b> Numbers can be answered as 8 or eight.</p>` +
      ex.qs.map((q, i) => `<div class="tqe">
        <div class="erow" style="margin:0"><span class="ew">${i < E ? 'Example ' + (i + 1) : 'Question ' + (i - E + 1)}</span>
          <input class="in grow" data-ef="qs.${i}.q" value="${esc(q.q)}" placeholder="Question, e.g. What's the boy's name?">${del(i)}</div>
        <div class="erow" style="margin:6px 0 0"><span class="ew">Answer</span>
          <input class="in" style="width:80px" data-ef="qs.${i}.pre" value="${esc(q.pre || '')}" placeholder="before" title="Words before the gap (optional)">
          <input class="in" style="width:130px;border-color:#9be2b9" data-ef="qs.${i}.a" value="${esc(q.a)}" placeholder="answer">
          <input class="in" style="width:90px" data-ef="qs.${i}.post" value="${esc(q.post || '')}" placeholder="after" title="Words after the gap (optional)"></div>
        ${q.say.map((l, k) => `<div class="erow" style="margin:6px 0 0"><span class="ew">${k ? '' : 'Audio'}</span>
          <select class="in" data-ef="qs.${i}.say.${k}.w">${OPTS(Object.entries(WHO), l.w)}</select>${sayIn(`qs.${i}.say.${k}.t`, l.t)}
          <button class="btn sm ghost" data-delline="${i}.${k}" title="Delete line">✕</button></div>`).join('')}
        <div class="row" style="margin-top:6px"><button class="btn sm ghost" data-addline="${i}">➕ Line</button></div>
      </div>`).join('');
    if (ex.qs.some((q, i) => !String(q.a).trim())) warn.push('A question has no answer.');
  }
  if (T === 'plines') {
    const used = new Set(ex.steps.map(s => s.n));
    body = `<div class="erow" style="align-items:flex-start"><span class="ew">Things</span><div class="grow" style="display:flex;flex-wrap:wrap;gap:8px">
      ${ex.objects.map((o, k) => `<span class="pslot"><input class="in emo-in" data-ef="objects.${k}.e" value="${esc(o.e)}" title="Picture (emoji)"><input class="in" style="width:110px" data-ef="objects.${k}.w" value="${esc(o.w)}" placeholder="word">${used.has(o.id) ? '' : `<button class="btn sm ghost" data-delpobj="${o.id}" title="Delete">🗑</button>`}</span>`).join('')}
      <button class="btn sm ghost" data-act="addpobj">➕ Thing</button></div></div>
      <p class="lbl" style="margin:0 0 8px">Things that are not in any question are extras, to make it harder. The places stay the same in the picture.</p>
      <div class="eh"><span></span><span>Sentence</span><span>Thing</span><span>Place</span></div>` +
      ex.steps.map((st, i) => `<div class="erow">${lbl(i)}${sayIn(`steps.${i}.say`, st.say)}<select class="in" data-ef="steps.${i}.n">${OPTS(ex.objects.map(o => [o.id, `${o.e} ${o.w}`]), st.n)}</select>
        <select class="in" data-ef="steps.${i}.to">${OPTS(ex.spots.map(sp => [sp.id, zoneLabel(sp.id)]), st.to)}</select>${del(i)}</div>`).join('');
    const ns = ex.steps.map(s => s.n), ps = ex.steps.map(s => s.to);
    if (new Set(ns).size !== ns.length) warn.push('The same thing is used in two questions.');
    if (new Set(ps).size !== ps.length) warn.push('The same place is used in two questions.');
  }
  if (isSc(T)) {
    head = `<label class="field"><span>Background</span><select class="in" data-ef="bg">${OPTS(Object.entries(BGS), ex.bg)}</select></label>`;
    const thName = th => `${SHAPE_NAME[th.k]} ${th.lbl}`;
    body = `<div class="erow" style="align-items:flex-start"><span class="ew">Things</span><div class="grow" style="display:grid;gap:6px">
      ${ex.things.map((th, k) => `<div class="row" style="gap:6px"><b class="lbl">${k + 1}</b><select class="in" data-ef="things.${k}.k">${OPTS(Object.keys(SHAPES).map(x => [x, SHAPE_NAME[x]]), th.k)}</select><input class="in grow" data-ef="things.${k}.lbl" value="${esc(th.lbl)}" placeholder="where it is, e.g. under the table"></div>`).join('')}
      <span class="lbl">Each thing stays in its place in the picture. You can change what it is, and the words that say where it is.</span></div></div>
      <div class="eh"><span></span><span>Sentence</span><span>Thing</span><span>Colour</span></div>` +
      ex.steps.map((st, i) => st.o ? `<div class="erow">${lbl(i)}${sayIn(`steps.${i}.say`, st.say)}<select class="in" data-ef="steps.${i}.o">${OPTS((ex.draws || []).map(d => [d.id, d.e + ' draw']), st.o)}</select><select class="in" data-ef="steps.${i}.z">${OPTS((ex.spots || []).map(sp => [sp.id, zoneLabel(sp.id)]), st.z)}</select>${del(i)}</div>` : `<div class="erow">${lbl(i)}${sayIn(`steps.${i}.say`, st.say)}<select class="in" data-ef="steps.${i}.s">${OPTS(ex.things.map(th => [th.id, thName(th)]), st.s)}</select>
        <select class="in" data-ef="steps.${i}.c">${OPTS(Object.keys(CLR).filter(c => c !== 'grey').map(c => [c, c]), st.c)}</select>${del(i)}</div>`).join('');
    const ss = ex.steps.filter(s => !s.o).map(s => s.s); if (new Set(ss).size !== ss.length) warn.push('Two questions colour the same thing.');
    if (T === 'cdraw') { body += `<div class="erow"><span class="ew">Things to draw</span>${ex.draws.map((d, k) => `<input class="in emo-in" data-ef="draws.${k}.e" value="${esc(d.e)}">`).join('')}</div><p class="lbl" style="margin:0 0 8px">Students draw these into the dotted circles. A row with a ✏️ thing and a place is a “draw” question; the others are “colour” questions.</p>`; const zs = ex.steps.filter(s => s.o).map(s => s.z); if (new Set(zs).size !== zs.length) warn.push('Two questions draw in the same place.'); }
  }
  if (T === 'number') {
    body = `<div class="erow" style="align-items:flex-start"><span class="ew">Pictures</span><div class="grow" style="display:flex;flex-wrap:wrap;gap:8px">
      ${ex.pics.map((p, k) => `<span class="pslot"><input class="in emo-in" style="width:84px" data-ef="pics.${k}.e" value="${esc(p.e)}"><input class="in" style="width:130px" data-ef="pics.${k}.t" value="${esc(p.t)}" placeholder="name (for you)"><button class="btn sm ghost" data-delpic="${p.id}">🗑</button></span>`).join('')}
      <button class="btn sm ghost" data-act="addpic">➕ Picture</button></div></div>
      <p class="lbl" style="margin:0 0 8px">The example is number 1, question 1 is number 2, and so on — start each sentence with “Number one…”, “Number two…”.</p>
      <div class="eh"><span></span><span>Sentence</span><span>Picture</span><span></span></div>` +
      ex.steps.map((st, i) => `<div class="erow">${lbl(i)}${sayIn(`steps.${i}.say`, st.say)}<select class="in" data-ef="steps.${i}.p">${OPTS(ex.pics.map(p => [p.id, `${p.e} ${p.t}`]), st.p)}</select>${del(i)}</div>`).join('');
    const ps = ex.steps.map(s => s.p); if (new Set(ps).size !== ps.length) warn.push('Two questions use the same picture.');
  }
  return `<div class="edit" id="lsEd"><h4>🧑‍🏫 Teacher tools · Edit this exercise</h4>
    <div class="erow"><label class="field grow"><span>Title</span><input class="in" data-ef="title" value="${esc(ex.title)}"></label>
      <label class="field"><span>Icon</span><input class="in emo-in" data-ef="icon" value="${esc(ex.icon)}"></label>
      <label class="field"><span>Section</span><input class="in" data-ef="group" list="lsGroupsEd" value="${esc(lsGroup(ex))}"><datalist id="lsGroupsEd">${lsGroups().map(g => `<option value="${esc(g)}">`).join('')}</datalist></label>${head}</div>
    ${body}
    <div class="row" style="margin-top:6px"><button class="btn sm" data-act="addstep">➕ Add question</button>${T === 'cdraw' ? '<button class="btn sm" data-act="adddraw">➕ Add “draw” question</button>' : ''}</div>
    ${warn.length ? `<div class="warn">⚠️ ${warn.join('<br>⚠️ ')}</div>` : ''}
    <p class="lbl" style="margin:10px 0 0">The Example row is already done for the students. Changes are saved automatically. Press ▶ to hear a sentence.</p>
  </div>`;
}
function bindLsEditor(ex, n) {
  const ed = $('#lsEd'); if (!ed) return;
  const done = async () => { await save(); LS_ = lsNew(n); const y = window.scrollY; renderListenEx(n); window.scrollTo(0, y); };
  const items = () => (ex.qs || ex.steps);
  ed.querySelectorAll('[data-ef]').forEach(el => el.onchange = () => { setPath(ex, el.dataset.ef, el.value.trim()); done(); });
  ed.querySelectorAll('[data-hear]').forEach(b => b.onclick = () => { const v = b.previousElementSibling.value.trim(); if (v) say(v, null, 0.85); });
  ed.querySelectorAll('[data-obj]').forEach(el => el.onchange = () => { const o = ex.objects.find(o => o.id === el.dataset.obj); if (o) o.e = el.value.trim() || '❓'; done(); });
  const nm = ed.querySelector('[data-names]'); if (nm) nm.onchange = () => { ex.names = [...new Set(nm.value.split(/[,،]+/).map(s => s.trim()).filter(Boolean))]; done(); };
  const sc = ed.querySelector('[data-scene]'); if (sc) sc.onchange = () => {
    const S = MOVE_SCENES[+sc.value]; if (!S) return;
    ex.bg = S.bg; ex.items = JSON.parse(JSON.stringify(S.items)); ex.zones = JSON.parse(JSON.stringify(S.zones));
    const used = new Set(); ex.steps.forEach(st => { if (!ex.zones.some(z => z.id === st.z) || used.has(st.z)) st.z = (ex.zones.find(z => !used.has(z.id)) || ex.zones[0]).id; used.add(st.z); });
    done(); toast('Picture changed — check the correct places');
  };
  ed.querySelectorAll('[data-otype]').forEach(el => el.onchange = () => { const [i, k] = el.dataset.otype.split('.').map(Number); ex.qs[i].o[k] = el.value === 'pic' ? '🍎' : {f: '🪑', o: '🐱', p: 'on'}; done(); });
  ed.querySelectorAll('[data-correct]').forEach(el => el.onchange = () => { ex.qs[+el.dataset.correct].a = +el.value; done(); });
  ed.querySelectorAll('[data-delstep]').forEach(b => b.onclick = () => {
    const i = +b.dataset.delstep; if (items().length <= exN(ex) + 1) return toast('An exercise needs the examples and at least one question');
    const [st] = items().splice(i, 1); if (ex.type === 'move') ex.objects = ex.objects.filter(o => o.id !== st.o); done();
  });
  ed.querySelectorAll('[data-addline]').forEach(b => b.onclick = () => { const q = ex.qs[+b.dataset.addline], last = q.say[q.say.length - 1]; q.say.push({w: last && last.w === 'w' ? 'g' : 'w', t: ''}); done(); });
  ed.querySelectorAll('[data-delline]').forEach(b => b.onclick = () => { const [i, k] = b.dataset.delline.split('.').map(Number); if (ex.qs[i].say.length <= 1) return toast('Keep at least one line'); ex.qs[i].say.splice(k, 1); done(); });
  ed.querySelectorAll('[data-delpobj]').forEach(b => b.onclick = () => { ex.objects = ex.objects.filter(o => o.id !== b.dataset.delpobj); done(); });
  ed.querySelectorAll('[data-delobj]').forEach(b => b.onclick = () => { ex.objects = ex.objects.filter(o => o.id !== b.dataset.delobj); done(); });
  ed.querySelectorAll('[data-delpic]').forEach(b => b.onclick = () => {
    if (ex.steps.some(st => st.p === b.dataset.delpic)) return toast('That picture is used in a question — change the question first');
    if (ex.pics.length <= 2) return toast('Keep at least 2 pictures');
    ex.pics = ex.pics.filter(p => p.id !== b.dataset.delpic); done();
  });
  ed.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
    const a = b.dataset.act;
    if (a === 'addobj') { ex.objects.push({id: uid(), e: '🍌'}); return done(); }
    if (a === 'addpic') { ex.pics.push({id: uid(), e: '🍎', t: 'new picture'}); return done(); }
    if (a === 'adddraw') { const o = ex.draws.find(d => !ex.steps.some(s => s.o === d.id)), z = ex.spots.find(z => !ex.steps.some(s => s.z === z.id)); if (!o || !z) return toast('There is no free thing or place left to draw'); ex.steps.push({say: `Draw ${o.e} ${zoneLabel(z.id)}.`, o: o.id, z: z.id}); return done(); }
    if (a === 'addpobj') { ex.objects.push({id: uid(), e: '🍌', w: 'banana'}); return done(); }
    if (a !== 'addstep') return;
    if (ex.type === 'move') {
      const z = ex.zones.find(z => !ex.steps.some(s => s.z === z.id)); if (!z) return toast('There are no free places left in this picture');
      const o = {id: uid(), e: '🍎'}; ex.objects.push(o); ex.steps.push({say: `Put the apple ${zoneLabel(z.id)}.`, o: o.id, z: z.id});
    }
    if (ex.type === 'lines') {
      const p = ex.people.find(p => !ex.steps.some(s => s.to === p.id)); if (!p) return toast('Every person is already used');
      const name = ex.names.find(x => !ex.steps.some(s => s.n === x)) || 'Name'; if (!ex.names.includes(name)) ex.names.push(name);
      ex.steps.push({say: `${name} is …`, n: name, to: p.id});
    }
    if (ex.type === 'tick') ex.qs.push({say: '', o: ['🍎', '🍌', '🍊'], a: 0});
    if (ex.type === 'colour') { const s = ex.shapes.find(x => !ex.steps.some(st => st.s === x)) || ex.shapes[0]; ex.steps.push({say: `Colour the ${SHAPE_NAME[s]} red.`, s, c: 'red'}); }
    if (ex.type === 'write') ex.qs.push({q: '', a: '', say: [{w: 'w', t: ''}, {w: 'g', t: ''}]});
    if (ex.type === 'plines') {
      const o = ex.objects.find(o => !ex.steps.some(s => s.n === o.id)), sp = ex.spots.find(z => !ex.steps.some(s => s.to === z.id));
      if (!o) return toast('Add a new thing first (➕ Thing)'); if (!sp) return toast('There are no free places left in this picture');
      ex.steps.push({say: `The ${o.w} is ${zoneLabel(sp.id)}.`, n: o.id, to: sp.id});
    }
    if (isSc(ex.type)) { const th = ex.things.find(t => !ex.steps.some(st => st.s === t.id)); if (!th) return toast('Every thing in the picture is already used');
      ex.steps.push({say: `Colour the ${SHAPE_NAME[th.k]} ${th.lbl} red.`, s: th.id, c: 'red'}); }
    if (ex.type === 'number') { const p = ex.pics.find(p => !ex.steps.some(st => st.p === p.id)) || ex.pics[0]; ex.steps.push({say: `Number ${['one','two','three','four','five','six','seven','eight','nine','ten'][ex.steps.length] || ex.steps.length + 1}. `, p: p.id}); }
    done();
  });
}

