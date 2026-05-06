#!/usr/bin/env node

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templatesDir = resolve(root, 'templates');
const imagePromptsFile = resolve(root, 'scripts', 'product-image-prompts.json');

const products = [
  {
    handle: 'tallowcreme',
    seoTitle: 'Tallowcrème | MOURÃO Organics',
    eyebrow: 'MOURÃO balm',
    title: 'Tallowcrème voor een rustige, gevoede huid',
    lead: 'Een volle maar toegankelijke balm voor droge, gevoelige of snel reagerende huid. Handgemaakt met een pure basis en zonder onnodige poespas.',
    ratingText: '4.8/5 door klanten die zachtheid en eenvoud zoeken',
    galleryCaption: 'Kleine batch, zachte textuur, pure basis.',
    thumbLabels: ['Original', 'Calming', 'Sensitive', 'Starter size'],
    benefits: [
      'Voedende tallowbasis voor droge of gevoelige huid',
      'Trekt rustig in zonder onnodig vettig gevoel',
      'Handgemaakt in kleine batches met een heldere samenstelling',
      'Ontwikkeld voor een simpele routine die zacht blijft aanvoelen'
    ],
    formulas: [
      {
        title: 'Original',
        text: 'De puurste basis, zonder extra geur of drukke toevoegingen.'
      },
      {
        title: 'Calming',
        text: 'Voor huid die sneller onrustig aanvoelt en iets zachter benaderd mag worden.'
      },
      {
        title: 'Sensitive',
        text: 'Een milde richting voor dagelijks gebruik wanneer comfort voorop staat.'
      }
    ],
    sizes: [
      { title: '120 ml', text: 'Meest gekozen • €39' },
      { title: '60 ml', text: 'Starter size • €29' }
    ],
    shippingNote: 'Voor 21:00 besteld = meestal dezelfde dag verwerkt | Gratis verzending vanaf €30',
    stockNote: 'Kleine batches betekenen ook beperkte voorraad. Populaire varianten kunnen sneller uitverkopen.',
    proofs: [
      { value: '12.000+', label: 'potjes met zorg gemaakt' },
      { value: '4.8/5', label: 'op zachte, eerlijke verzorging' },
      { value: 'Kleine batch', label: 'meer controle op textuur en kwaliteit' }
    ],
    detailsEyebrow: 'Niet uit een fabriek',
    detailsTitle: 'Waarom deze balm prettig voelt in gebruik',
    detailsCopy: 'De basis is rijk en voedend, maar de formule blijft helder: alleen ingrediënten die bijdragen aan zachtheid, comfort en een rustige huidbeleving.',
    details: [
      {
        title: 'Écht natuurlijk',
        text: 'Geen overbodige geurstoffen, geen drukke mix van toevoegingen. Alleen ingrediënten die functioneel aanvoelen.'
      },
      {
        title: 'Trekt rustig in',
        text: 'Rijk genoeg voor droge zones, maar bedoeld om comfortabel te dragen in je dagelijkse routine.'
      },
      {
        title: 'Met de hand gemaakt',
        text: 'Iedere batch wordt klein gehouden zodat textuur, consistentie en afwerking dicht bij het product blijven.'
      },
      {
        title: 'Voor gevoelige momenten',
        text: 'Ontworpen voor huid die vooral rust, voeding en een eenvoudige benadering nodig heeft.'
      }
    ],
    faqEyebrow: 'Veelgestelde vragen',
    faqTitle: 'Alles wat je wilt weten, zonder kleine lettertjes',
    faqs: [
      {
        title: 'Hoe gebruik ik deze balm?',
        text: 'Gebruik een kleine hoeveelheid op een schone, droge huid. Warm kort op tussen je vingers en masseer rustig in op gezicht, handen of droge zones.'
      },
      {
        title: 'Welke formule past het best bij mij?',
        text: 'Original is de meest pure basis. Sensitive is bedoeld voor dagelijks comfort. Calming voelt passend voor huid die sneller uit balans raakt en meer rust zoekt.'
      },
      {
        title: 'Hoe zit het met verzending en retour?',
        text: 'Bestellingen worden vanuit Nederland verwerkt. Vanaf €30 verzenden we gratis. Je krijgt 30 dagen om rustig te kijken of het product in je routine past.'
      }
    ],
    reviewsEyebrow: 'Klanten aan het woord',
    reviewsTitle: 'Rustige verzorging wordt meestal ook zo omschreven',
    reviewsCopy: 'Geen medische claims. Wel reacties van mensen die vooral zachtheid, comfort en eenvoud ervaren in dagelijks gebruik.',
    reviews: [
      {
        author: 'Femke',
        context: 'Reactieve huid',
        text: 'Wat me vooral opviel is hoe rustig het product aanvoelt. Geen overdaad, wel een zachter huidgevoel en minder trekkerigheid gedurende de dag.'
      },
      {
        author: 'Mara',
        context: 'Onrustige, droge huid',
        text: 'Ik merkte vooral comfort. De formule voelt vol, maar toch draagbaar. Daardoor pak ik het sneller dagelijks dan andere rijkere balms.'
      },
      {
        author: 'Noor',
        context: 'Gevoelige routine',
        text: 'Fijn dat het zo simpel is. Ik hoef niet na te denken over lagen of stappen, alleen een kleine hoeveelheid en mijn huid voelt weer gevoed.'
      }
    ],
    imagePrompt: 'Ultra photoreal editorial skincare product photo of a handcrafted tallow face balm in a low amber glass jar with a matte beige lid, soft whipped cream texture visible, placed on warm travertine stone with natural linen folds, earthy beige and light brown palette, calm handmade natural skincare mood, soft morning window light, shallow depth of field, no text, no logo, no watermark.'
  },
  {
    handle: 'gezichtscreme',
    seoTitle: 'Gezichtscrème | MOURÃO Organics',
    eyebrow: 'MOURÃO face',
    title: 'Gezichtscrème voor dagelijks comfort en een rustige glow',
    lead: 'Een zachte dagelijkse crème voor huid die soepel wil aanvoelen zonder zwaar laagje. Licht genoeg voor iedere ochtend, voedend genoeg om ook ’s avonds prettig te blijven.',
    ratingText: '4.7/5 door klanten die licht en rustig willen smeren',
    galleryCaption: 'Lichte textuur, zachte finish, dagelijkse stap.',
    thumbLabels: ['Daily', 'Rich', 'Sensitive', '30 ml'],
    benefits: [
      'Lichte finish die prettig draagt onder SPF of make-up',
      'Geeft comfort aan huid die snel trekkerig aanvoelt',
      'Handgemaakt met een eenvoudige mix van milde ingrediënten',
      'Ontworpen voor ochtend en avond zonder extra gedoe'
    ],
    formulas: [
      {
        title: 'Daily',
        text: 'De meest lichte variant voor wie een eenvoudige basis zoekt die snel prettig aanvoelt.'
      },
      {
        title: 'Rich',
        text: 'Voor drogere dagen of avonden waarop je huid iets meer voeding vraagt.'
      },
      {
        title: 'Sensitive',
        text: 'Een milde versie voor routines waarin zachtheid en rust voorop staan.'
      }
    ],
    sizes: [
      { title: '50 ml', text: 'Dagelijks formaat • €24' },
      { title: '30 ml', text: 'Starter size • €18' }
    ],
    shippingNote: 'Past makkelijk in je dagelijkse routine | Gratis verzending vanaf €30',
    stockNote: 'Omdat iedere batch klein is, kunnen de populairste formules soms tijdelijk uitverkocht raken.',
    proofs: [
      { value: '4.7/5', label: 'op licht comfort zonder gedoe' },
      { value: '50 ml', label: 'dagelijks formaat voor ochtend en avond' },
      { value: '1 stap', label: 'gemakkelijk in een korte routine' }
    ],
    detailsEyebrow: 'Dagelijkse eenvoud',
    detailsTitle: 'Waarom deze crème prettig draagt',
    detailsCopy: 'Deze formule is gemaakt voor mensen die hun gezicht willen verzorgen zonder een volle of drukke finish. Zacht, toegankelijk en logisch in gebruik.',
    details: [
      {
        title: 'Licht op de huid',
        text: 'De crème voelt zacht en soepel aan zonder een zware film achter te laten.'
      },
      {
        title: 'Fijn in de ochtend',
        text: 'Draagt prettig onder SPF, make-up of gewoon als enige verzorgingsstap.'
      },
      {
        title: 'Ook voor avonden',
        text: 'Voor een eenvoudige avondroutine hoef je niets te stapelen of te combineren.'
      },
      {
        title: 'Kleine batch gemaakt',
        text: 'Iedere batch blijft klein zodat textuur en afwerking constant en vertrouwd aanvoelen.'
      }
    ],
    faqEyebrow: 'Veelgestelde vragen',
    faqTitle: 'Over gebruik, finish en dagelijkse routines',
    faqs: [
      {
        title: 'Kan ik deze crème overdag gebruiken?',
        text: 'Ja. De Daily- en Sensitive-varianten zijn juist bedoeld voor dagelijks gebruik, ook onder een SPF.'
      },
      {
        title: 'Welke formule kies ik bij drogere huid?',
        text: 'Rich voelt vaak prettiger wanneer je huid meer voeding vraagt. Voor een lichtere finish is Daily een logische eerste stap.'
      },
      {
        title: 'Is dit een ingewikkelde routinecrème?',
        text: 'Nee. Het idee is juist dat je met één milde stap al veel comfort kunt creëren.'
      }
    ],
    reviewsEyebrow: 'Klanten aan het woord',
    reviewsTitle: 'Dagelijkse verzorging die eenvoudig blijft voelen',
    reviewsCopy: 'Mensen kiezen deze crème vooral omdat hij makkelijk in gebruik is en zacht blijft aanvoelen, ook wanneer de routine kort moet blijven.',
    reviews: [
      {
        author: 'Lotte',
        context: 'Ochtendroutines',
        text: 'Fijn dat hij licht aanvoelt maar toch voldoende doet. Ik gebruik hem iedere ochtend zonder na te denken.'
      },
      {
        author: 'Nina',
        context: 'Gemengde huid',
        text: 'Mijn huid voelt rustiger en soepeler aan, zonder dat ik een vettig laagje ervaar.'
      },
      {
        author: 'Iris',
        context: 'Gevoelige wangen',
        text: 'Prettig hoe eenvoudig deze crème is. Geen drukke geur, geen ingewikkelde stappen, gewoon comfort.'
      }
    ],
    imagePrompt: 'Ultra realistic luxury-but-accessible natural skincare photo of a daily face cream in a clean ceramic jar with a soft airy cream swirl, set on warm stone beside folded muslin cloth, minimal bathroom editorial styling, beige and oat tones, diffused daylight, authentic handmade feel, high detail, no text, no logo, no watermark.'
  },
  {
    handle: 'calming-skin-balm',
    seoTitle: 'Calming Skin Balm | MOURÃO Organics',
    eyebrow: 'MOURÃO rescue',
    title: 'Calming Skin Balm voor plekken die snel onrustig worden',
    lead: 'Een gerichte balm voor droge, rode of gevoelige zones die niet om veel stappen vragen, maar wel om iets zachts en voedends dat blijft liggen waar jij het nodig hebt.',
    ratingText: '4.9/5 door klanten met gevoelige zones en droge plekjes',
    galleryCaption: 'Gerichte verzorging voor zones die extra rust zoeken.',
    thumbLabels: ['Spot balm', 'Overnight', 'Barrier', '25 ml'],
    benefits: [
      'Fijn voor neusvleugels, wangen, mondhoeken of droge plekjes',
      'Blijft iets langer liggen waar je huid extra comfort nodig heeft',
      'Milde samenstelling voor routines die rustig moeten blijven',
      'Met een kleine hoeveelheid kom je al ver'
    ],
    formulas: [
      {
        title: 'Spot Balm',
        text: 'Voor gerichte zones die overdag een klein beetje extra zachtheid kunnen gebruiken.'
      },
      {
        title: 'Overnight',
        text: 'Iets voller voor avonden waarop je huid echt tot rust mag komen.'
      },
      {
        title: 'Barrier',
        text: 'Voor plekken die sneller reageren op kou, wind, veel wassen of droge lucht.'
      }
    ],
    sizes: [
      { title: '60 ml', text: 'Volledige routine • €27' },
      { title: '25 ml', text: 'Gerichte care • €19' }
    ],
    shippingNote: 'Compact en zuinig in gebruik | Gratis verzending vanaf €30',
    stockNote: 'Door de kleine batches zijn vooral de kleine potjes vaak als eerste weg.',
    proofs: [
      { value: '4.9/5', label: 'voor droge of gevoelige zones' },
      { value: '25 ml', label: 'compact formaat voor gerichte verzorging' },
      { value: 'Klein beetje', label: 'is vaak al genoeg per gebruik' }
    ],
    detailsEyebrow: 'Gerichte verzorging',
    detailsTitle: 'Waarom deze balm fijn is bij gevoelige zones',
    detailsCopy: 'Calming Skin Balm is niet bedoeld als drukke allrounder, maar als rustige helper voor momenten waarop je huid nét wat meer aandacht wil.',
    details: [
      {
        title: 'Doelgericht',
        text: 'Je gebruikt hem precies waar je huid trekkerig, ruw of gevoelig aanvoelt.'
      },
      {
        title: 'Comfort blijft langer',
        text: 'De balm blijft prettig aanwezig zonder onnodig zwaar te worden.'
      },
      {
        title: 'Rustige formulering',
        text: 'Alleen ingrediënten die bijdragen aan zachtheid, textuur en huidcomfort.'
      },
      {
        title: 'Fijn naast andere basics',
        text: 'Werkt goed naast je gewone crème wanneer je op enkele zones iets extra’s nodig hebt.'
      }
    ],
    faqEyebrow: 'Veelgestelde vragen',
    faqTitle: 'Over zones, momenten en combinatiegebruik',
    faqs: [
      {
        title: 'Waar gebruik ik Calming Skin Balm voor?',
        text: 'Voor droge plekjes, rode zones, schrale mondhoeken, wangen of huid die na weer of wassen sneller onrustig voelt.'
      },
      {
        title: 'Gebruik ik dit overdag of alleen ’s nachts?',
        text: 'Beide kan. Overdag is een klein beetje vaak genoeg. ’s Avonds kiezen veel mensen voor een iets vollere laag.'
      },
      {
        title: 'Kan ik hem naast een gezichtscrème gebruiken?',
        text: 'Ja. Veel klanten gebruiken eerst hun lichte basis en werken daarna gerichte zones af met een kleine hoeveelheid balm.'
      }
    ],
    reviewsEyebrow: 'Klanten aan het woord',
    reviewsTitle: 'Precies het soort rust waar gevoelige zones om vragen',
    reviewsCopy: 'Vooral mensen met droge plekjes of een reactieve huid noemen deze balm hun vaste kleine redder in huis of tas.',
    reviews: [
      {
        author: 'Mila',
        context: 'Rode wangen',
        text: 'Ik gebruik hem op mijn wangen en neusvleugels. Het voelt meteen zachter en minder schraal.'
      },
      {
        author: 'Eva',
        context: 'Winterhuid',
        text: 'In koud weer is dit het eerste potje waar ik naar grijp. Klein beetje, groot verschil in comfort.'
      },
      {
        author: 'Roos',
        context: 'Korte routine',
        text: 'Fijn dat het geen ingewikkeld product is. Ik gebruik het alleen waar het nodig is en dat werkt juist goed.'
      }
    ],
    imagePrompt: 'Super high resolution photoreal product photo of a calming skin balm in a small matte glass jar with a smooth rich balm surface, styled with soft cotton cloth and a warm beige ceramic dish, soothing earthy skincare scene, gentle natural window light, quiet minimal composition, realistic texture, no text, no logo, no watermark.'
  },
  {
    handle: 'bodylotion',
    seoTitle: 'Bodylotion | MOURÃO Organics',
    eyebrow: 'MOURÃO body',
    title: 'Bodylotion die soepel smeert en rustig intrekt',
    lead: 'Een toegankelijke bodylotion voor huid die na het douchen of aan het einde van de dag gewoon zacht en verzorgd wil aanvoelen, zonder plakkerig of zwaar resultaat.',
    ratingText: '4.7/5 door klanten die bodycare eenvoudig willen houden',
    galleryCaption: 'Soepele bodycare voor iedere dag.',
    thumbLabels: ['Daily Soft', 'Extra Nourish', 'Unscented', '100 ml'],
    benefits: [
      'Smeert makkelijk uit op benen, armen en droge plekken',
      'Trekt rustig in zonder een plakkerige finish',
      'Prettig na het douchen of wanneer huid trekkerig voelt',
      'Gemaakt voor dagelijks gebruik in een eenvoudige routine'
    ],
    formulas: [
      {
        title: 'Daily Soft',
        text: 'De meest toegankelijke bodylotion voor dagelijks comfort en een zachte finish.'
      },
      {
        title: 'Extra Nourish',
        text: 'Voor drogere huid of seizoenen waarin je net wat meer voeding prettig vindt.'
      },
      {
        title: 'Unscented',
        text: 'Een milde variant voor wie vooral rust in geur en gevoel belangrijk vindt.'
      }
    ],
    sizes: [
      { title: '250 ml', text: 'Volledig formaat • €22' },
      { title: '100 ml', text: 'Reisvriendelijk • €15' }
    ],
    shippingNote: 'Een dagelijkse essential voor badkamer of slaapkamer | Gratis verzending vanaf €30',
    stockNote: 'De 100 ml maat is vaak snel weg door travel en cadeaugebruik.',
    proofs: [
      { value: '250 ml', label: 'voor dagelijkse bodyverzorging' },
      { value: '4.7/5', label: 'op comfort zonder plakkerigheid' },
      { value: 'Na douche', label: 'meest gekozen gebruiksmoment' }
    ],
    detailsEyebrow: 'Eenvoudige bodycare',
    detailsTitle: 'Waarom deze lotion prettig blijft in gebruik',
    detailsCopy: 'De beste bodyverzorging is vaak degene die je ook echt blijft pakken. Daarom ligt de focus hier op smeerbaarheid, comfort en een rustige finish.',
    details: [
      {
        title: 'Soepele textuur',
        text: 'De lotion verdeelt makkelijk zodat je niet veel product nodig hebt voor armen of benen.'
      },
      {
        title: 'Geen zwaar laagje',
        text: 'Na het smeren voelt huid zacht, zonder dat kleding meteen oncomfortabel wordt.'
      },
      {
        title: 'Voor iedere dag',
        text: 'Ontworpen voor normale dagen, droge seizoenen en korte routines waarin gemak belangrijk is.'
      },
      {
        title: 'Rustige samenstelling',
        text: 'Geen onnodige drukte, wel een formule die logisch voelt in dagelijks gebruik.'
      }
    ],
    faqEyebrow: 'Veelgestelde vragen',
    faqTitle: 'Over finish, gebruik en droge huid',
    faqs: [
      {
        title: 'Wanneer gebruik ik deze bodylotion het liefst?',
        text: 'Veel klanten gebruiken hem na het douchen of voor het slapen, wanneer huid het snelst trekkerig aanvoelt.'
      },
      {
        title: 'Is hij geschikt voor drogere benen of armen?',
        text: 'Ja. Voor normale droogte is Daily Soft vaak genoeg. Bij meer behoefte aan voeding voelt Extra Nourish logischer.'
      },
      {
        title: 'Trekt hij snel genoeg in voor overdag?',
        text: 'Ja. De formule is gemaakt om comfortabel in te trekken zonder plakkerig na te voelen.'
      }
    ],
    reviewsEyebrow: 'Klanten aan het woord',
    reviewsTitle: 'Bodycare die vooral praktisch en prettig voelt',
    reviewsCopy: 'Klanten beschrijven deze lotion vooral als makkelijk, zacht en betrouwbaar genoeg om echt dagelijks te blijven gebruiken.',
    reviews: [
      {
        author: 'Jill',
        context: 'Na het douchen',
        text: 'Fijn dat hij snel prettig aanvoelt. Ik gebruik hem na iedere douche zonder tegenzin.'
      },
      {
        author: 'Sophie',
        context: 'Droge benen',
        text: 'Mijn huid voelt zachter aan en ik heb niet het idee dat ik in een zwaar laagje zit.'
      },
      {
        author: 'Anne',
        context: 'Korte routine',
        text: 'Precies wat ik zocht: geen gedoe, wel dagelijks comfort en een rustige huid.'
      }
    ],
    imagePrompt: 'Ultra photoreal body lotion product image of a soft matte bottle with natural lotion ribbon beside it, styled on warm travertine with beige towel and subtle clay shadows, approachable handmade natural skincare aesthetic, bright diffused daylight, editorial ecommerce quality, no text, no logo, no watermark.'
  },
  {
    handle: 'handcreme',
    seoTitle: 'Handcrème | MOURÃO Organics',
    eyebrow: 'MOURÃO hands',
    title: 'Handcrème voor handen die vaak wassen en snel droog voelen',
    lead: 'Een voedende maar draagbare handcrème voor momenten waarop je handen droog, trekkerig of ruw aanvoelen. Gemaakt om vaak te gebruiken zonder plakkerige tegenzin.',
    ratingText: '4.8/5 door klanten die iets voedends zonder plakkerigheid zoeken',
    galleryCaption: 'Bescherming en comfort voor handen die veel doen.',
    thumbLabels: ['Everyday', 'Rich Rescue', 'On The Go', '30 ml'],
    benefits: [
      'Prettig na handen wassen, schoonmaken of werken in droge lucht',
      'Voelt voedend zonder te zwaar of glibberig te blijven',
      'Compacte maat past makkelijk in tas of jaszak',
      'Fijn voor handen, knokkels en droge nagelriemen'
    ],
    formulas: [
      {
        title: 'Everyday',
        text: 'De meest praktische formule voor dagelijkse verzorging na wassen of werken.'
      },
      {
        title: 'Rich Rescue',
        text: 'Rijker voor avonden of periodes waarin handen sneller schraal aanvoelen.'
      },
      {
        title: 'On The Go',
        text: 'Een lichtere routineversie voor in je tas, auto of op je bureau.'
      }
    ],
    sizes: [
      { title: '75 ml', text: 'Volledig formaat • €16' },
      { title: '30 ml', text: 'Tasformaat • €11' }
    ],
    shippingNote: 'Past makkelijk in badkamer, keuken of handtas | Gratis verzending vanaf €30',
    stockNote: 'Vooral de 30 ml maat is vaak snel op door onderweg-gebruik en cadeaus.',
    proofs: [
      { value: '4.8/5', label: 'voor voedende handverzorging' },
      { value: '30 ml', label: 'ideaal formaat voor onderweg' },
      { value: 'Vaak gebruikt', label: 'na wassen of schoonmaken' }
    ],
    detailsEyebrow: 'Voor werkende handen',
    detailsTitle: 'Waarom deze handcrème makkelijk een vaste plek krijgt',
    detailsCopy: 'Een handcrème wordt alleen echt onderdeel van je dag als hij snel prettig voelt. Daarom is deze formule gemaakt voor herhaald gebruik zonder weerstand.',
    details: [
      {
        title: 'Voedt zonder plak',
        text: 'Je handen voelen verzorgd, maar je hoeft niet lang te wachten voordat je weer verder kunt.'
      },
      {
        title: 'Fijn na wassen',
        text: 'Gebruik hem na zeep, water of buitenlucht wanneer huid sneller droog aanvoelt.'
      },
      {
        title: 'Ook voor nagelriemen',
        text: 'Een klein beetje werkt prettig op ruwe randjes of droge knokkels.'
      },
      {
        title: 'Compact en logisch',
        text: 'Het kleinere formaat nodigt uit om hem echt mee te nemen en ook echt te gebruiken.'
      }
    ],
    faqEyebrow: 'Veelgestelde vragen',
    faqTitle: 'Over gebruiksmomenten, finish en tasformaten',
    faqs: [
      {
        title: 'Hoe vaak kan ik deze handcrème gebruiken?',
        text: 'Zo vaak als nodig. Veel klanten gebruiken hem na ieder wasmoment of aan het einde van de dag.'
      },
      {
        title: 'Kan ik hem ook op nagelriemen gebruiken?',
        text: 'Ja. Een klein beetje werkt prettig op droge randjes, knokkels en nagelriemen.'
      },
      {
        title: 'Welke maat is handig voor onderweg?',
        text: '30 ml is gemaakt voor tas, auto of bureau. 75 ml ligt prettiger vast in badkamer of keuken.'
      }
    ],
    reviewsEyebrow: 'Klanten aan het woord',
    reviewsTitle: 'Handverzorging die je echt vaker gaat gebruiken',
    reviewsCopy: 'De reacties gaan vooral over gebruiksgemak: voedend genoeg om verschil te voelen, licht genoeg om hem steeds opnieuw te pakken.',
    reviews: [
      {
        author: 'Britt',
        context: 'Veel handen wassen',
        text: 'Mijn handen voelen minder strak na het wassen en ik kan daarna gewoon weer verder zonder plakkerig gevoel.'
      },
      {
        author: 'Elise',
        context: 'Bureau en tas',
        text: 'Ik heb er één thuis en één in mijn tas. Dat zegt genoeg over hoe vaak ik hem daadwerkelijk gebruik.'
      },
      {
        author: 'Nora',
        context: 'Droge knokkels',
        text: 'Fijn hoe snel hij zachter aanvoelt op ruwe plekjes zonder vettig te blijven.'
      }
    ],
    imagePrompt: 'Ultra realistic close product photo of a nourishing hand cream in a soft matte aluminum tube with a small cream dab near the cap, placed on warm beige stone with linen and subtle shadows, earthy natural skincare palette, handcrafted trustworthy feeling, soft side light, crisp texture detail, no text, no logo, no watermark.'
  },
  {
    handle: 'lipbalm',
    seoTitle: 'Lipbalm | MOURÃO Organics',
    eyebrow: 'MOURÃO lips',
    title: 'Lipbalm die droogte verzacht zonder zwaar laagje',
    lead: 'Een eenvoudige balsem voor droge lippen die prettig aanvoelt, makkelijk mee te nemen is en zonder glibberige overdaad net genoeg comfort geeft door de dag heen.',
    ratingText: '4.8/5 door klanten die een eenvoudige balsem willen meenemen',
    galleryCaption: 'Kleine essential voor zachtere lippen door de dag.',
    thumbLabels: ['Bare', 'Soft Shine', 'Night Repair', 'Mini duo'],
    benefits: [
      'Verzacht droge lippen met een rustige, draagbare finish',
      'Handig voor jaszak, tas of nachtkastje',
      'Fijn overdag, maar ook geschikt als vollere avondlaag',
      'Gemaakt om vaak te pakken zonder gedoe'
    ],
    formulas: [
      {
        title: 'Bare',
        text: 'De meest pure balsem voor wie alleen zachtheid en comfort zoekt.'
      },
      {
        title: 'Soft Shine',
        text: 'Een subtiel gladdere finish voor overdag, zonder plakkerige gloss-feel.'
      },
      {
        title: 'Night Repair',
        text: 'Iets voller voor avonden of nachten waarin lippen extra comfort kunnen gebruiken.'
      }
    ],
    sizes: [
      { title: '15 ml', text: 'Dagelijks formaat • €12' },
      { title: 'Mini duo', text: '2 x 7 ml • €14' }
    ],
    shippingNote: 'Een kleine essential die makkelijk overal mee naartoe gaat | Gratis verzending vanaf €30',
    stockNote: 'De mini duo’s zijn populair als tas-set en verdwijnen daardoor vaak als eerste.',
    proofs: [
      { value: '4.8/5', label: 'voor dagelijks lipcomfort' },
      { value: '15 ml', label: 'compact formaat voor iedere tas' },
      { value: 'Dag & nacht', label: 'bruikbaar in korte routines' }
    ],
    detailsEyebrow: 'Klein maar vast',
    detailsTitle: 'Waarom deze lipbalm makkelijk een gewoonte wordt',
    detailsCopy: 'Lippen vragen vaak om iets eenvoudigs dat je snel pakt. Daarom draait deze balm om comfort, draagbaarheid en een zachte finish die je niet zat wordt.',
    details: [
      {
        title: 'Geen zwaar laagje',
        text: 'De balsem voelt verzorgend zonder te glibberen of onnodig dik te blijven zitten.'
      },
      {
        title: 'Makkelijk mee te nemen',
        text: 'Door het compacte formaat ligt hij net zo logisch op je nachtkastje als in je jaszak.'
      },
      {
        title: 'Ook voor de avond',
        text: 'Night Repair geeft net wat meer comfort voor lippen die ’s nachts sneller droog worden.'
      },
      {
        title: 'Rustige samenstelling',
        text: 'Eenvoudige ingrediënten en een heldere formule maken hem prettig voor dagelijks gebruik.'
      }
    ],
    faqEyebrow: 'Veelgestelde vragen',
    faqTitle: 'Over finish, mee-nemen en gebruiksmomenten',
    faqs: [
      {
        title: 'Is deze lipbalm alleen voor overdag?',
        text: 'Nee. Bare en Soft Shine zijn fijn overdag, terwijl Night Repair juist prettig voelt voor de avond of nacht.'
      },
      {
        title: 'Voelt hij zwaar of plakkerig aan?',
        text: 'Nee. De finish is bewust rustig gehouden zodat je hem gemakkelijk vaker pakt.'
      },
      {
        title: 'Welke maat is handig voor onderweg?',
        text: '15 ml is het standaardformaat. De mini duo is handig als je één thuis en één in je tas wilt houden.'
      }
    ],
    reviewsEyebrow: 'Klanten aan het woord',
    reviewsTitle: 'De soort lipbalm die je niet steeds hoeft te herontdekken',
    reviewsCopy: 'Klanten beschrijven hem vooral als een kleine, betrouwbare basic die altijd ergens in de buurt blijft liggen.',
    reviews: [
      {
        author: 'Fleur',
        context: 'Altijd in tas',
        text: 'Eindelijk een lipbalm die zacht aanvoelt zonder plakkerige gloss-vibe. Ik neem hem overal mee naartoe.'
      },
      {
        author: 'Yara',
        context: 'Droge lippen',
        text: 'Ik gebruik hem overdag en ’s avonds. Mijn lippen voelen rustiger en minder strak aan.'
      },
      {
        author: 'Lisa',
        context: 'Mini routine',
        text: 'Precies het soort product dat simpel genoeg is om ook echt onderdeel van mijn dag te blijven.'
      }
    ],
    imagePrompt: 'Super realistic editorial lip balm product photo of a small natural balm pot with a smooth balm swipe, styled on warm beige ceramic with soft pocket cloth, earthy minimal skincare aesthetic, gentle daylight, highly detailed texture, handmade and honest mood, no text, no logo, no watermark.'
  }
];

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const renderItems = (items, renderer) => items.map(renderer).join('\n');

const pageFileFor = (handle) => (handle === 'tallowcreme' ? 'product.html' : `${handle}.html`);
const templateFileFor = (handle) => (handle === 'tallowcreme' ? 'product.json' : `product.${handle}.json`);
const cardAssetFor = (handle) => `mourao-product-${handle}-card.jpg`;
const heroAssetFor = (handle) => `mourao-product-${handle}-hero.jpg`;
const thumbAssetFor = (handle, index) => `mourao-product-${handle}-thumb-${index}.jpg`;

function renderWordmark({ href, hero = false }) {
  const tag = href ? 'a' : 'div';
  const modifier = hero ? ' mourao-wordmark--hero' : '';
  const ringModifier = hero ? ' mourao-ring-o--hero' : '';
  const sublineModifier = hero ? ' mourao-wordmark__subline--hero' : '';
  const subModifier = hero ? ' mourao-wordmark__sub--hero' : '';
  const hrefAttribute = href ? ` href="${href}" aria-label="MOURÃO Organics"` : ' aria-hidden="true"';

  return `<${tag} class="mourao-wordmark${modifier}"${hrefAttribute}>
            <span class="mourao-wordmark__text-wrap" aria-hidden="true">
              <span class="mourao-wordmark__line">
                <span class="mourao-wordmark__text mourao-wordmark__text--ringed">
                  <span>MOURÃ</span>
                  <span class="mourao-ring-o${ringModifier}"></span>
                </span>
              </span>
              <span class="mourao-wordmark__subline${sublineModifier}">Organics</span>
              <span class="mourao-wordmark__sub${subModifier}">Handmade natural skincare</span>
            </span>
          </${tag}>`;
}

function renderProductPage(product) {
  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#F6F1EB">
    <title>${escapeHtml(product.seoTitle)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/mourao-home.css">
  </head>
  <body class="mourao-theme">
    <a class="visually-hidden" href="#MainContent">Ga naar de inhoud</a>

    <div class="mourao-announcement" aria-label="Winkelmeldingen">
      <div class="mourao-announcement__track">
        <div class="mourao-announcement__group">
          <span>Handgemaakt in kleine batches</span>
          <span>Gratis verzending vanaf €30</span>
          <span>30 dagen rustig proberen</span>
          <span>Pure ingrediënten zonder overbodige toevoegingen</span>
        </div>
        <div class="mourao-announcement__group" aria-hidden="true">
          <span>Handgemaakt in kleine batches</span>
          <span>Gratis verzending vanaf €30</span>
          <span>30 dagen rustig proberen</span>
          <span>Pure ingrediënten zonder overbodige toevoegingen</span>
        </div>
      </div>
    </div>

    <div class="mourao-site-shell">
      <header class="mourao-site-header">
        <div class="page-width mourao-site-header__inner">
          <nav class="mourao-header-nav" aria-label="Hoofdmenu">
            <a class="mourao-header-nav__link" href="index.html">Home</a>
            <a class="mourao-header-nav__link" href="index.html#producten">Shop</a>
            <a class="mourao-header-nav__link" href="index.html#waarom">Waarom Mourão</a>
            <a class="mourao-header-nav__link" href="index.html#verhaal">Ons verhaal</a>
            <a class="mourao-header-nav__link" href="#contact">Contact</a>
          </nav>

          ${renderWordmark({ href: 'index.html' })}

          <div class="mourao-header-meta">
            <a class="mourao-header-link" href="#faq">Veelgestelde vragen</a>
            <a class="mourao-button mourao-button--ghost" href="#shop">Voeg toe aan routine</a>
          </div>
        </div>
      </header>

      <main id="MainContent" role="main">
        <section class="mourao-section mourao-section--spacious mourao-product-page">
          <div class="page-width">
            <div class="mourao-product-layout">
              <div class="mourao-gallery mourao-reveal" style="--animation-order: 1;">
                <div class="mourao-gallery__main">
                  <div class="mourao-gallery__hero" style="--mourao-gallery-image: url('${heroAssetFor(product.handle)}');">
                    <div class="mourao-gallery__hero-glow"></div>
                  </div>
                  <p class="mourao-gallery__caption">${escapeHtml(product.galleryCaption)}</p>
                </div>

                <div class="mourao-gallery__thumbs" aria-hidden="true">
                  ${renderItems(
                    product.thumbLabels,
                    (label, index) =>
                      `<span class="mourao-gallery__thumb" style="--mourao-thumb-image: url('${thumbAssetFor(product.handle, index + 1)}');">${escapeHtml(label)}</span>`
                  )}
                </div>
              </div>

              <div class="mourao-product-box mourao-reveal" style="--animation-order: 2;">
                <div class="mourao-rating">
                  <span class="mourao-stars" aria-hidden="true">★★★★★</span>
                  <span>${escapeHtml(product.ratingText)}</span>
                </div>

                <p class="mourao-eyebrow">${escapeHtml(product.eyebrow)}</p>
                <h1 class="mourao-product-title">${escapeHtml(product.title)}</h1>
                <p class="mourao-product-lead">${escapeHtml(product.lead)}</p>

                <ul class="mourao-bullet-list mourao-bullet-list--compact">
                  ${renderItems(product.benefits, (benefit) => `<li>${escapeHtml(benefit)}</li>`)}
                </ul>

                <div class="mourao-option-group">
                  <p class="mourao-option-group__label">Kies je formule</p>
                  <div class="mourao-option-list">
                    ${renderItems(
                      product.formulas,
                      (formula) => `<div class="mourao-option">
                      <strong>${escapeHtml(formula.title)}</strong>
                      <span>${escapeHtml(formula.text)}</span>
                    </div>`
                    )}
                  </div>
                </div>

                <div class="mourao-option-group">
                  <p class="mourao-option-group__label">Kies je formaat</p>
                  <div class="mourao-option-list mourao-option-list--sizes">
                    ${renderItems(
                      product.sizes,
                      (size) => `<div class="mourao-option mourao-option--size">
                      <strong>${escapeHtml(size.title)}</strong>
                      <span>${escapeHtml(size.text)}</span>
                    </div>`
                    )}
                  </div>
                </div>

                <a id="shop" class="mourao-button mourao-button--full" href="#">Voeg toe aan routine</a>

                <div class="mourao-product-notes">
                  <p>${escapeHtml(product.shippingNote)}</p>
                  <p>${escapeHtml(product.stockNote)}</p>
                </div>
              </div>
            </div>

            <div class="mourao-proof-strip">
              ${renderItems(
                product.proofs,
                (proof) => `<div class="mourao-proof-card">
                <strong>${escapeHtml(proof.value)}</strong>
                <span>${escapeHtml(proof.label)}</span>
              </div>`
              )}
            </div>

            <div class="mourao-section-header">
              <p class="mourao-eyebrow">${escapeHtml(product.detailsEyebrow)}</p>
              <h2 class="mourao-section-title">${escapeHtml(product.detailsTitle)}</h2>
              <p class="mourao-section-copy">${escapeHtml(product.detailsCopy)}</p>
            </div>

            <div class="mourao-detail-grid">
              ${renderItems(
                product.details,
                (detail) => `<article class="mourao-detail-card">
                <h3>${escapeHtml(detail.title)}</h3>
                <p>${escapeHtml(detail.text)}</p>
              </article>`
              )}
            </div>

            <div class="mourao-section-header" id="faq">
              <p class="mourao-eyebrow">${escapeHtml(product.faqEyebrow)}</p>
              <h2 class="mourao-section-title">${escapeHtml(product.faqTitle)}</h2>
            </div>

            <div class="mourao-faq-list">
              ${renderItems(
                product.faqs,
                (faq, index) => `<details class="mourao-faq-item" ${index === 0 ? 'open' : ''}>
                <summary>${escapeHtml(faq.title)}</summary>
                <div class="mourao-faq-item__content">
                  <p>${escapeHtml(faq.text)}</p>
                </div>
              </details>`
              )}
            </div>

            <div class="mourao-section-header">
              <p class="mourao-eyebrow">${escapeHtml(product.reviewsEyebrow)}</p>
              <h2 class="mourao-section-title">${escapeHtml(product.reviewsTitle)}</h2>
              <p class="mourao-section-copy">${escapeHtml(product.reviewsCopy)}</p>
            </div>

            <div class="mourao-grid mourao-grid--reviews">
              ${renderItems(
                product.reviews,
                (review, index) => `<article class="mourao-review-card mourao-reveal" style="--animation-order: ${index + 1};">
                <div class="mourao-review-card__quote" aria-hidden="true">“</div>
                <p class="mourao-review-card__text">${escapeHtml(review.text)}</p>
                <div class="mourao-review-card__meta">
                  <p class="mourao-review-card__author">${escapeHtml(review.author)}</p>
                  <p class="mourao-review-card__context">${escapeHtml(review.context)}</p>
                </div>
              </article>`
              )}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" class="mourao-site-footer">
        <div class="page-width">
          <div class="mourao-site-footer__top">
            <div class="mourao-site-footer__brand">
              <p class="mourao-eyebrow">MOURÃO Organics</p>
              <h2 class="mourao-site-footer__title">Handgemaakte verzorging die zacht blijft, ook in je routine.</h2>
              <p class="mourao-site-footer__text">MOURÃO maakt pure verzorgingsproducten in kleine batches. Eenvoudige formules, aardse ingrediënten en een rustige benadering voor huid die comfort zoekt.</p>
            </div>

            <form class="mourao-footer-form" action="#" method="post">
              <label class="mourao-footer-form__label" for="FooterEmailProduct">Blijf op de hoogte van nieuwe batches en rustige lanceringen.</label>
              <div class="mourao-footer-form__row">
                <input id="FooterEmailProduct" class="mourao-input" type="email" name="email" placeholder="E-mailadres">
                <button class="mourao-button" type="submit">Inschrijven</button>
              </div>
              <p class="mourao-site-footer__meta">Geen ruis. Alleen nieuwe drops, formules en praktische updates.</p>
            </form>
          </div>

          <div class="mourao-site-footer__grid">
            <div class="mourao-site-footer__column">
              <h3 class="mourao-site-footer__heading">Collectie</h3>
              <a href="product.html">Tallowcrème</a>
              <a href="gezichtscreme.html">Gezichtscrème</a>
              <a href="calming-skin-balm.html">Calming Skin Balm</a>
            </div>

            <div class="mourao-site-footer__column">
              <h3 class="mourao-site-footer__heading">Waarom Mourão</h3>
              <a href="index.html#waarom">Ingrediënten</a>
              <a href="index.html#verhaal">Ons verhaal</a>
              <a href="index.html#reviews">Reviews</a>
            </div>

            <div class="mourao-site-footer__column">
              <h3 class="mourao-site-footer__heading">Service</h3>
              <a href="#faq">Veelgestelde vragen</a>
              <a href="#shop">Verzending & retour</a>
              <a href="#contact">Hulp nodig?</a>
            </div>

            <div class="mourao-site-footer__column">
              <h3 class="mourao-site-footer__heading">Contact</h3>
              <p>hello@mouraoorganics.com</p>
              <p>Atelier in Nederland</p>
              <p>Klantenservice op werkdagen</p>
            </div>
          </div>

          <div class="mourao-site-footer__bottom">
            <p>© 2026 MOURÃO Organics. Cosmetische verzorging voor uitwendig gebruik.</p>
            <p>Bij gevoelige huid of twijfel: altijd eerst rustig testen op een klein stukje huid.</p>
          </div>
        </div>
      </footer>
    </div>
  </body>
</html>
`;
}

function renderProductTemplate(product) {
  const blocks = {};
  const blockOrder = [];

  product.benefits.forEach((text, index) => {
    const key = `benefit_${index + 1}`;
    blocks[key] = { type: 'benefit', settings: { text } };
    blockOrder.push(key);
  });

  product.formulas.forEach((formula, index) => {
    const key = `formula_${index + 1}`;
    blocks[key] = { type: 'formula', settings: formula };
    blockOrder.push(key);
  });

  product.sizes.forEach((size, index) => {
    const key = `size_${index + 1}`;
    blocks[key] = { type: 'size', settings: size };
    blockOrder.push(key);
  });

  product.faqs.forEach((faq, index) => {
    const key = `faq_${index + 1}`;
    blocks[key] = { type: 'faq', settings: faq };
    blockOrder.push(key);
  });

  product.reviews.forEach((review, index) => {
    const key = `testimonial_${index + 1}`;
    blocks[key] = { type: 'testimonial', settings: review };
    blockOrder.push(key);
  });

  const template = {
    sections: {
      main: {
        type: 'mourao-product-main',
        settings: {
          image_key: product.handle,
          eyebrow: product.eyebrow,
          title: product.title,
          subtitle: product.lead,
          rating_text: product.ratingText,
          gallery_caption: product.galleryCaption,
          button_label: 'Voeg toe aan routine',
          button_link: 'shopify://collections/all',
          shipping_note: product.shippingNote,
          stock_note: product.stockNote,
          proof_one_value: product.proofs[0].value,
          proof_one_label: product.proofs[0].label,
          proof_two_value: product.proofs[1].value,
          proof_two_label: product.proofs[1].label,
          proof_three_value: product.proofs[2].value,
          proof_three_label: product.proofs[2].label,
          details_eyebrow: product.detailsEyebrow,
          details_title: product.detailsTitle,
          details_copy: product.detailsCopy,
          detail_one_title: product.details[0].title,
          detail_one_text: product.details[0].text,
          detail_two_title: product.details[1].title,
          detail_two_text: product.details[1].text,
          detail_three_title: product.details[2].title,
          detail_three_text: product.details[2].text,
          detail_four_title: product.details[3].title,
          detail_four_text: product.details[3].text,
          faq_eyebrow: product.faqEyebrow,
          faq_title: product.faqTitle,
          reviews_eyebrow: product.reviewsEyebrow,
          reviews_title: product.reviewsTitle,
          reviews_copy: product.reviewsCopy
        },
        blocks,
        block_order: blockOrder
      }
    },
    order: ['main']
  };

  return `${JSON.stringify(template, null, 2)}\n`;
}

function renderProductImagePrompts() {
  return `${JSON.stringify(
    products.map((product) => ({
      handle: product.handle,
      title: product.title,
      heroAsset: heroAssetFor(product.handle),
      cardAsset: cardAssetFor(product.handle),
      thumbAssets: product.thumbLabels.map((_, index) => thumbAssetFor(product.handle, index + 1)),
      prompt: product.imagePrompt
    })),
    null,
    2
  )}\n`;
}

mkdirSync(templatesDir, { recursive: true });

for (const product of products) {
  writeFileSync(resolve(root, pageFileFor(product.handle)), renderProductPage(product));
  writeFileSync(resolve(templatesDir, templateFileFor(product.handle)), renderProductTemplate(product));
}

writeFileSync(imagePromptsFile, renderProductImagePrompts());

console.log(`Generated ${products.length} product pages, ${products.length} product templates, and image prompts.`);
