export type Drill = {
  /** what the learner is asked to write */
  prompt: string;
  /** the chord that answers it, in dictionary notation */
  stroke: string;
  /** set when the stroke should translate to this exact dictionary entry */
  word?: string;
};

export type ChartEntry = {
  label: string;
  stroke: string;
};

export type Section = {
  heading: string;
  paragraphs: string[];
  /** small labelled boards shown under the text */
  chart?: ChartEntry[];
};

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  sections: Section[];
  drills: Drill[];
};

function words(list: string): Drill[] {
  return list.split(" ").map((pair) => {
    const [word, stroke] = pair.split("=") as [string, string];
    return { prompt: word, stroke, word };
  });
}

function keys(list: [string, string][]): Drill[] {
  return list.map(([prompt, stroke]) => ({ prompt, stroke }));
}

export const lessons: Lesson[] = [
  {
    id: "machine",
    title: "the machine",
    summary: "how a steno board works and where your fingers rest",
    sections: [
      {
        heading: "chords, not letters",
        paragraphs: [
          "On a normal keyboard you press one key per letter. In steno you press several keys at the same time, like a piano chord, and let go together. One chord is called a stroke, and one stroke usually writes a whole syllable or a whole word.",
          "Nothing happens while keys are going down. The stroke is read at the moment you release, so you never need to press keys in any particular order or at exactly the same instant.",
        ],
      },
      {
        heading: "three zones",
        paragraphs: [
          "The board has only 22 keys plus a number bar. Your left hand writes the sound a syllable starts with, your thumbs write the vowel in the middle, and your right hand writes the sound it ends with.",
          "Steno is spelled by sound, not by letters. Cat and kat are the same thing to a steno machine: a K sound, an A, and a T sound.",
        ],
        chart: [
          { label: "left hand: starting sounds", stroke: "STKPWHR" },
          { label: "thumbs: vowels", stroke: "AOEU" },
          { label: "right hand: ending sounds", stroke: "-FRPBLGTSDZ" },
        ],
      },
      {
        heading: "home position",
        paragraphs: [
          "Rest your fingers on the gap between the top and bottom rows so each finger can reach both keys in its column. On a normal keyboard that means the left hand sits on Q W E R over A S D F, and the right hand on U I O P over J K L ;. Thumbs sit on C V and N M.",
          "The left pinky has one tall S key (Q or A both work). The asterisk in the middle is reached by either index finger (T, G, Y or H).",
        ],
        chart: [
          { label: "left fingers", stroke: "STPH" },
          { label: "right fingers", stroke: "-FPLT" },
        ],
      },
      {
        heading: "steno order",
        paragraphs: [
          "A stroke is always written down by reading the board left to right: S T K P W H R A O * E U F R P B L G T S D Z. That is why the chord for cat is written KAT, and why a letter can appear twice: the first T is the left-hand one, the second is the right-hand one.",
          "When a stroke has no vowel, a hyphen shows which side the keys are on. -T means the right-hand T on its own.",
        ],
      },
    ],
    drills: keys([
      ["left S", "S"],
      ["left T", "T"],
      ["left K", "K"],
      ["left P", "P"],
      ["left W", "W"],
      ["left H", "H"],
      ["left R", "R"],
      ["A", "A"],
      ["O", "O"],
      ["E", "E"],
      ["U", "U"],
      ["right F", "-F"],
      ["right R", "-R"],
      ["right P", "-P"],
      ["right B", "-B"],
      ["right L", "-L"],
      ["right G", "-G"],
      ["right T", "-T"],
      ["right S", "-S"],
      ["right D", "-D"],
      ["right Z", "-Z"],
    ]),
  },
  {
    id: "first-words",
    title: "first words",
    summary: "start sound, vowel, end sound, all in one stroke",
    sections: [
      {
        heading: "one syllable, one stroke",
        paragraphs: [
          "To write a short word, hold its starting sound with the left hand, its vowel with the thumbs and its ending sound with the right hand, then release everything together.",
          "Sat is S on the left, A in the middle, T on the right. Press all three at once.",
        ],
        chart: [
          { label: "sat", stroke: "SAT" },
          { label: "top", stroke: "TOP" },
          { label: "her", stroke: "HER" },
        ],
      },
      {
        heading: "blends are just more keys",
        paragraphs: [
          "Sounds that run together stack up in the same stroke. Stop is S and T on the left, O, and P on the right. Strap uses three left-hand keys at once.",
          "Remember it is the sound that counts: cat starts with a K sound, so it is written KAT. A short U as in cut is the U key.",
        ],
        chart: [
          { label: "stop", stroke: "STOP" },
          { label: "strap", stroke: "STRAP" },
          { label: "cat", stroke: "KAT" },
        ],
      },
    ],
    drills: words(
      "sat=SAT pat=PAT tap=TAP hat=HAT rat=RAT wet=WET pet=PET set=SET top=TOP hot=HOT pop=POP put=PUT cat=KAT cap=KAP cut=KUT her=HER war=WAR car=KAR tell=TEL well=WEL art=ART part=PART star=STAR start=START stop=STOP step=STEP spot=SPOT trap=TRAP strap=STRAP",
    ),
  },
  {
    id: "left-hand",
    title: "missing starting sounds",
    summary: "D, B, L, F, M, N, G and friends, built from two or more keys",
    sections: [
      {
        heading: "seven keys, every consonant",
        paragraphs: [
          "The left hand only has S, T, K, P, W, H and R, so the other starting sounds are made by pressing combinations. These are the heart of steno theory and are worth drilling until they are automatic.",
          "Many of them have a shape you can remember: D is the two keys T and K stacked in one column, B is P and W stacked, L is H and R stacked.",
        ],
        chart: [
          { label: "D", stroke: "TK" },
          { label: "B", stroke: "PW" },
          { label: "L", stroke: "HR" },
          { label: "F", stroke: "TP" },
          { label: "M", stroke: "PH" },
          { label: "N", stroke: "TPH" },
          { label: "G", stroke: "TKPW" },
          { label: "J", stroke: "SKWR" },
          { label: "Y", stroke: "KWR" },
          { label: "V", stroke: "SR" },
          { label: "Q (kw)", stroke: "KW" },
          { label: "X", stroke: "KP" },
          { label: "Z", stroke: "STKPW" },
        ],
      },
      {
        heading: "two-letter sounds",
        paragraphs: [
          "Sh and th are written the way they are spelled. Ch is K and H, because C is a K sound.",
        ],
        chart: [
          { label: "SH", stroke: "SH" },
          { label: "TH", stroke: "TH" },
          { label: "CH", stroke: "KH" },
        ],
      },
    ],
    drills: [
      ...keys([
        ["D sound", "TK"],
        ["B sound", "PW"],
        ["L sound", "HR"],
        ["F sound", "TP"],
        ["M sound", "PH"],
        ["N sound", "TPH"],
        ["G sound", "TKPW"],
        ["J sound", "SKWR"],
        ["Y sound", "KWR"],
        ["V sound", "SR"],
        ["CH sound", "KH"],
      ]),
      ...words(
        "dot=TKOT bat=PWAT let=HRET fat=TPAT map=PHAP net=TPHET get=TKPWET jet=SKWRET yet=KWRET vet=SRET shop=SHOP chat=KHAT lot=HROT mat=PHAT not=TPHOT got=TKPWOT job=SKWROB bed=PWED dog=TKOG shell=SHEL",
      ),
    ],
  },
  {
    id: "right-hand",
    title: "missing ending sounds",
    summary: "N, M, K, CH, SH, TH and more on the right hand",
    sections: [
      {
        heading: "the right hand has its own combinations",
        paragraphs: [
          "The right hand has F, R, P, B, L, G, T, S, D and Z. Ending sounds that are not on the board are again made from combinations, and they are different from the left-hand ones.",
          "N is P and B stacked, M is P and L side by side, and K is B and G side by side.",
        ],
        chart: [
          { label: "-N", stroke: "-PB" },
          { label: "-M", stroke: "-PL" },
          { label: "-K", stroke: "-BG" },
          { label: "-NG", stroke: "-PBG" },
          { label: "-CH", stroke: "-FP" },
          { label: "-SH", stroke: "-RB" },
          { label: "-J (dge)", stroke: "-PBLG" },
          { label: "-X (ks)", stroke: "-BGS" },
        ],
      },
      {
        heading: "the asterisk changes a sound",
        paragraphs: [
          "There is no room for an ending TH, so it is written with the asterisk plus T. Path is P, A, asterisk and T, written PA*T.",
          "An ending V sound uses the F key, since the two are so close.",
        ],
        chart: [{ label: "-TH", stroke: "*T" }],
      },
    ],
    drills: [
      ...keys([
        ["ending N", "-PB"],
        ["ending M", "-PL"],
        ["ending K", "-BG"],
        ["ending NG", "-PBG"],
        ["ending CH", "-FP"],
        ["ending SH", "-RB"],
        ["ending TH", "*T"],
      ]),
      ...words(
        "ten=TEPB hen=HEPB ham=HAPL ram=RAPL pack=PABG sock=SOBG sang=SAPBG cash=KARB tax=TABGS fox=TPOBGS edge=EPBLG path=PA*T bath=PWA*T van=SRAPB fun=TPUPB",
      ),
    ],
  },
  {
    id: "vowels",
    title: "vowels",
    summary: "short I, long vowels and vowel pairs from four thumb keys",
    sections: [
      {
        heading: "short I is two keys",
        paragraphs: [
          "The thumbs have A, O, E and U. There is no I key: a short I, as in sit, is E and U pressed together.",
        ],
        chart: [{ label: "short I", stroke: "EU" }],
      },
      {
        heading: "long vowels",
        paragraphs: [
          "Long vowels say their own name, and each has a fixed thumb shape. Long A as in pay adds E and U to the A. Long E as in see is A, O and E. Long I as in high is all four keys. Long O as in show is O and E. Long U as in rule is A, O and U.",
        ],
        chart: [
          { label: "long A (pay)", stroke: "AEU" },
          { label: "long E (see)", stroke: "AOE" },
          { label: "long I (high)", stroke: "AOEU" },
          { label: "long O (show)", stroke: "OE" },
          { label: "long U (rule)", stroke: "AOU" },
        ],
      },
      {
        heading: "other vowel sounds",
        paragraphs: [
          "A few more sounds round out the set: aw as in saw, ow as in how, oy as in toy, and the oo of soon.",
        ],
        chart: [
          { label: "aw (saw)", stroke: "AU" },
          { label: "ow (how)", stroke: "OU" },
          { label: "oy (toy)", stroke: "OEU" },
          { label: "oo (soon)", stroke: "AO" },
        ],
      },
    ],
    drills: [
      ...keys([
        ["short I", "EU"],
        ["long A", "AEU"],
        ["long E", "AOE"],
        ["long I", "AOEU"],
        ["long O", "OE"],
        ["long U", "AOU"],
        ["aw", "AU"],
        ["ow", "OU"],
        ["oy", "OEU"],
      ]),
      ...words(
        "sit=SEUT hit=HEUT pay=PAEU day=TKAEU see=SAOE tree=TRAOE free=TPRAOE high=HAOEU tie=TAOEU light=HRAOEUT show=SHOE low=HROE rule=RAOUL saw=SAU law=HRAU out=OUT how=HOU now=TPHOU toy=TOEU boy=PWOEU too=TAO soon=SAOPB food=TPAOD",
      ),
    ],
  },
  {
    id: "briefs",
    title: "briefs",
    summary: "one-stroke shortcuts for the most common words",
    sections: [
      {
        heading: "the words you write all day",
        paragraphs: [
          "A brief is a shortened stroke for a common word. A handful of tiny words make up a large share of everything written in English, so their briefs are often just one or two keys.",
          "Briefs do not follow the sound rules, they are simply memorised. Learn these and ordinary sentences speed up straight away.",
        ],
        chart: [
          { label: "the", stroke: "-T" },
          { label: "of", stroke: "-F" },
          { label: "and", stroke: "SKP" },
          { label: "is", stroke: "S" },
          { label: "it", stroke: "T" },
          { label: "you", stroke: "U" },
          { label: "I", stroke: "EU" },
          { label: "be", stroke: "-B" },
        ],
      },
      {
        heading: "one key, one word",
        paragraphs: [
          "Most single left-hand keys are words by themselves, and so are many of the two-key starting sounds you already know: H is had, R is are, W is with, K is can, the L sound is will and the V sound is have.",
        ],
        chart: [
          { label: "had", stroke: "H" },
          { label: "are", stroke: "R" },
          { label: "with", stroke: "W" },
          { label: "can", stroke: "K" },
          { label: "will", stroke: "HR" },
          { label: "have", stroke: "SR" },
          { label: "this", stroke: "TH" },
          { label: "if", stroke: "TP" },
        ],
      },
    ],
    drills: words(
      "the=-T of=-F to=TO and=SKP a=AEU in=TPH is=S it=T that=THA you=U he=E was=WA for=TP-R are=R with=W be=-B have=SR this=TH will=HR can=K what=WHA we=WE I=EU they=THE had=H from=TPR do=TKO if=TP but=PWUT by=PWEU or=OR an=APB were=WR not=TPHOT",
    ),
  },
  {
    id: "punctuation",
    title: "punctuation and fixing mistakes",
    summary: "full stops, commas, capitals and the asterisk",
    sections: [
      {
        heading: "punctuation is a stroke too",
        paragraphs: [
          "Punctuation marks have their own symmetrical chords, using the same shape on both hands. A full stop also capitalises the next word for you, and it attaches to the word before it without a space.",
        ],
        chart: [
          { label: "full stop", stroke: "TP-PL" },
          { label: "comma", stroke: "KW-BG" },
          { label: "question mark", stroke: "KW-PL" },
          { label: "exclamation mark", stroke: "TP-BG" },
        ],
      },
      {
        heading: "capitals",
        paragraphs: [
          "To capitalise a word that does not follow a full stop, write the cap-next stroke first and then the word.",
        ],
        chart: [{ label: "capitalise next word", stroke: "KPA" }],
      },
      {
        heading: "the asterisk fixes mistakes",
        paragraphs: [
          "Pressing the asterisk on its own is the steno backspace. In Monkeysteno it clears the word you are on so you can start it again; if the word is already empty it steps back and clears the previous one.",
          "Reach for it the moment a stroke comes out wrong. Fixing straight away is always faster than carrying on and ending up a word out of step.",
        ],
        chart: [{ label: "start the word over", stroke: "*" }],
      },
    ],
    drills: keys([
      ["full stop", "TP-PL"],
      ["comma", "KW-BG"],
      ["question mark", "KW-PL"],
      ["exclamation mark", "TP-BG"],
      ["capitalise next word", "KPA"],
      ["start the word over", "*"],
    ]),
  },
  {
    id: "endings",
    title: "endings and longer words",
    summary: "-ing, -s, -ed, and writing words one syllable at a time",
    sections: [
      {
        heading: "endings attach by themselves",
        paragraphs: [
          "Common endings are single right-hand keys written as a second stroke: G for -ing, S for a plural, D for -ed. The ending joins onto the previous word and the spelling is fixed for you, so run followed by -ing comes out as running.",
          "When there is room, the ending can also be folded into the same stroke as the word: cats can be written KATS in one go.",
        ],
        chart: [
          { label: "-ing", stroke: "-G" },
          { label: "-s", stroke: "-S" },
          { label: "-ed", stroke: "-D" },
        ],
      },
      {
        heading: "longer words",
        paragraphs: [
          "A word with several syllables is written as several strokes, one after another, usually one per syllable. The dictionary joins them up: the text may change as you go, which is normal, since it only knows the whole word once you have finished it.",
          "Very common long words usually have a brief as well. The hint diagram under the test always shows a way to write the next word, with one board per stroke.",
        ],
      },
    ],
    drills: [
      ...keys([
        ["add -ing", "-G"],
        ["add -s", "-S"],
        ["add -ed", "-D"],
      ]),
      ...words(
        "make=PHAEUBG time=TAOEUPL like=HRAOEUBG people=PAOEPL work=WORBG good=TKPWAOD keep=KAOEP",
      ),
    ],
  },
];
