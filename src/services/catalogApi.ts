import firestore from '@react-native-firebase/firestore';

export type CatalogCategory =
  | 'hotels'
  | 'jets'
  | 'flights'
  | 'yachts'
  | 'limousines'
  | 'esims'
  | 'visas'
  | 'airports';

export interface CatalogItem {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  images?: string[];
  tag1: string;
  tag2: string;
  price: string;
  pricePer: string;
  badge?: string;
  country?: string;
  description?: string;
  rating?: number;
}

export interface CatalogApiResponse {
  status: 'success';
  data: CatalogItem[];
  meta: {
    endpoint: string;
    fetchedAt: string;
    source: string;
    count: number;
  };
}

const MOCK_API_DELAY_MS = 250;

/**
 * 94 World-Class Curated Luxury Hotels & Palaces across the European Union, Greece, Turkey, and Global Destinations
 * Each hotel includes 4 distinct high-definition authentic photos and in-depth luxury descriptions.
 */
export const CURATED_LUXURY_HOTELS: CatalogItem[] = [
  {
    id: "hotel-dubai-movenpick-creek",
    name: "Mövenpick Dubai Creek",
    subtitle: "Banyas Street | 11.0 km from center",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/557691306.jpg?k=5a2974dae34fa907e3b9229079c9983c3409a32e35b5ca18a1786a1107646ffa",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914670241.jpg?k=2918b7cd65cc6a3c79a2fbbd8894975776d1b1e4dddf97e0eb4ae37dbc50a78d",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914670245.jpg?k=13dcb457885c0ec4298664a1e829f4ab957420f32c5ee6c6f3028234283fa6b2",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/930994170.jpg?k=71bd86cd214a78bbb0f8f0b5fa903213414a8722470914db260d8f206b40ef11",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914670239.jpg?k=ce19e83b1d010d863cc0a932167c047ffca42ea536a158706404a72ce80da786",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914670240.jpg?k=2c99d458f1f42c16efb47300f4704cc2567a22aec4cd02fa70c0b37cedc718af",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914670242.jpg?k=97ee1814ce6cbc7353771a9786275f31744a4c7bbed9f1aebc72beb7d12b3c86",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/857701596.jpg?k=162ba6c2d99db90a3bad24dfec14309d27171f32e6354b8a1ea8cfd7f8141a27",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914670250.jpg?k=1bd1aa99ef9ecbfbb8d67c09ac8cad0258057ac2e0951f8b66a5dc4aa9de576a",
    ],
    tag1: "Dubai, UAE 🇦🇪",
    tag2: "Creek Panorama & Luxury Suites",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Wonderful 9.3",
    country: "United Arab Emirates",
    description: "Luxurious waterfront accommodations overlooking historic Dubai Creek. Features panoramic floor-to-ceiling windows, rooftop infinity swimming pool, executive club lounge, signature gourmet dining options, and 24/7 dedicated concierge service.",
    rating: 9.3,
  },
  {
    id: "hotel-dubai-radisson-deira",
    name: "Radisson Blu Hotel, Dubai Deira Creek",
    subtitle: "Baniyas Road, Dubai, AE",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/232807306.jpg?k=9a5cb0bf77378a5e5ee4d95087effe18606e87aaae68a4977bb2eb46fc58cf14",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/485557349.jpg?k=1b53e39aba2f93ee1008cd281ea73aa33fa2b55fe8fe1d58b8a5d85fb8527978",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/485557366.jpg?k=69f4fa7913c978ab6f0f9e9779c2f0a8c37db385513a6e99327e8a8b341e3d3b",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/485557251.jpg?k=fe9925791f9eec849e5a25817b8bf659fbb8ca623cc6bb672ca13f7e13379887",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/485557300.jpg?k=52f4e3f04748de70be8397858f7f779425e0b36f2820ce33dd6226813bda40a7",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/485557335.jpg?k=95a31064235340d36bf88ccff8cb201e08027313181aa8d5786b5ba72cc42140",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/887418091.jpg?k=f8181659a5ee541b667d35a5443cef5d95a003ca93fc05e94f0ec1c434c216ad",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/485557293.jpg?k=1462dab276e7c3aeb75a340a68f4ce72a52c4e71def417016347b00550438d77",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/485557294.jpg?k=5fa772c3ceb8f6e95f87756a78377c9161ca52e9be2120f9344cd74084b99ece",
    ],
    tag1: "Dubai, UAE 🇦🇪",
    tag2: "Historic Creek Heritage & Fine Dining",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Excellent 8.4",
    country: "United Arab Emirates",
    description: "Legendary landmark hotel on Dubai Creek offering iconic waterfront views, 15 award-winning international restaurants, private balconies, an expansive health club, and personalized butler services.",
    rating: 8.4,
  },
  {
    id: "hotel-dubai-burj-al-arab",
    name: "Burj Al Arab Jumeirah",
    subtitle: "Umm Suqeim 3, Jumeirah Beach, Dubai",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/646595186.jpg?k=3eff038fbb2e97745c110ae0c97af41300fc6da3d7583c001146c827eef899a3",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/578658137.jpg?k=298500e1e853e92027d2578e52d03e51bc9dea60a528677064e5047a17453224",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/589257781.jpg?k=3a0c556ece3993f79dd07ef63db953954e7cf033309d7ea7de0d6defd35e2a23",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/504400495.jpg?k=25de192756bf1f419370b0353a8f03ec92597d475ca345082628b6312a22ab05",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/525350379.jpg?k=8322fd71217f4dcb8c8aebe4b433f9aef2f16dd4b0004672047269ea32d8a660",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/864426012.jpg?k=f58531e88f7ce5db7d5c609cf8ed9af7cf54bd6f8ee83e243906808fe89deded",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/542554187.jpg?k=5083e400e0ca25ce7e7d2e086de85371df1ef1cceb1397d813347741f6d6450d",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/414754064.jpg?k=5ab27c865fc80b661bd6c43551674e07cd51606ebac2ca0edcecf721127066b1",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/875945484.jpg?k=9263725094348cf96a37034f9360360281fe8f03ef9202d48482eb6bb693a9d8",
    ],
    tag1: "Dubai, UAE 🇦🇪",
    tag2: "Ultra-Luxury All-Suite Landmark",
    price: "$1,950",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.8",
    country: "United Arab Emirates",
    description: "The world-famous sail-shaped masterpiece rising from its own private island. Features duplex suites with 24-karat gold interiors, personal butler service, private beach cabanas, and the stunning Talise Spa perched 150 meters above the Arabian Gulf.",
    rating: 9.8,
  },
  {
    id: "hotel-dubai-atlantis-palm",
    name: "Atlantis, The Palm",
    subtitle: "Crescent Road, Palm Jumeirah, Dubai",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/680582913.jpg?k=5fd96a5d0ce5da3022369154bf305ccbaff0d2a7b2c5434f88f7fc9e5ed8bbb1",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/727476403.jpg?k=62b729fbc16a796086d0acb33a4bdc96e7a33cb594902ca44e7b34701265e51a",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/727476374.jpg?k=bdc4eb3974c2b70978b3b6a0a57553be4de8cb243a2894afbd4307373cc5ab1e",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/727476386.jpg?k=98c49c9e089f0026369d66c14cc6660189ca2580d909e25af47031b5b2d99c9f",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/727476357.jpg?k=4f82295313e426689155bdc5f54d544a9e432077769809ecbb18e7a1544e10fe",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/727476354.jpg?k=d1b5693a522b57dadb50372354077e637c8534c55780492dc91d6a16298147c1",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/727476358.jpg?k=aec126bb04f23b6b833361fd74d87bd9512216d5bc27827f96554dbe59602a31",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/727476364.jpg?k=2d6add8a35caabf866783a96f0276e5c7e47005403cad10b1968375cdb35177b",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/727476367.jpg?k=5da970dafbd3e86d9488e6a683d889ad35995f96a2fb46fa382e408b2a097fa9",
    ],
    tag1: "Dubai, UAE 🇦🇪",
    tag2: "Iconic Palm Island Ocean Resort",
    price: "$820",
    pricePer: "1 night, 1 room",
    badge: "Wonderful 9.2",
    country: "United Arab Emirates",
    description: "Premier oceanfront destination situated on the apex of Palm Jumeirah. Includes private sandy beaches, Aquaventure waterpark access, signature underwater suites, and fine dining by celebrity chefs including Nobu and Gordon Ramsay.",
    rating: 9.2,
  },
  {
    id: "hotel-sharm-sunrise-diamond",
    name: "SUNRISE Diamond Beach Resort -Grand Select-",
    subtitle: "Om El Seid Cliff, Sharm El Sheikh, Egypt",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/283315758.jpg?k=9e7a6ceee1bd9db60d7a2b0710bc2552a87098120d973e1d139e38c689a4927e",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/346566508.jpg?k=1cc2c949937e765113b45b6557d928c6dd5d77cdc9241ad5bed3fe6ebbc231ed",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/283319078.jpg?k=43e1cc610524df0a72bd716972bc785bd14a41bf3549465653a47c4ac4681b15",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/283317172.jpg?k=5974c09aa08e08bbf8d54a16fb1bcfa321cf70266076444809b286e28ef9e90c",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/283315760.jpg?k=d98ce239a2abbce31e19ce4719a297172f9b5d3b430fd697b6fbf74db47438ce",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/282543823.jpg?k=47c3393cfe62173338601004cd103ab7f6dcc726f0dd4972d3426a64ffe2a0f1",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/283317829.jpg?k=12dba4769acea9b242a11bbabe8cc0d08807b617dfb8dbc66adefd998a7a2bbb",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/282543839.jpg?k=8624ac7eb7d762cfab0e1e6328ea61b2ef67a29cae6f2e94cc7f00855a1a832a",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/283318142.jpg?k=2d7f1abd441b5def2558d0cd63b3df5127d11dc7432c339c3d2ca81c7e548b3f",
    ],
    tag1: "Sharm El Sheikh, Egypt 🇪🇬",
    tag2: "Red Sea Private Coral Beach & Aqua Park",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Wonderful 9.6",
    country: "Egypt",
    description: "Luxurious Red Sea clifftop resort with direct access to vibrant coral reefs. Features 4 swimming pools, comprehensive water park, 5 à-la-carte specialty restaurants, luxury family suites, and holistic Ayurvedic spa treatments.",
    rating: 9.6,
  },
  {
    id: "hotel-sharm-four-seasons",
    name: "Four Seasons Resort Sharm El Sheikh",
    subtitle: "1 Four Seasons Boulevard, Sharm El Sheikh",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/241890691.jpg?k=f30a16d1e61d7253ef29e45343f4ed294694b6a191219eb4293f23e0a83772cb",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/222474818.jpg?k=407301ea96d522c38c299932cad47a2d37e7afb91cc2018feb823341387ef709",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/657347592.jpg?k=b990278476d2d7980cd098d05dd7ba96da0e79df8ab0069bec6ffd381adaffe5",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/364781706.jpg?k=555a3a4496a175ae411f1f451582f1fba4cab1c31a4cca30986a3d0f3f7236b9",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/279326693.jpg?k=169607205272021dc957138e7ff61598712ff0239c0d3c1e1ab3974ac0eeda4b",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/351981947.jpg?k=2887cf12bc57fadd4a251029b9fc2eb1c2670952965ef59142f5e67eaa0039cc",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/252113618.jpg?k=8e69039279c6313f95811d903401d08119a8dc3becab3011066a1d93d4cf1625",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/343266118.jpg?k=8a8c286d836a0fec0d2682c4434e0ad0e78f99414045eb859aa97f473f1407d4",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/279326694.jpg?k=6ad0b8a26110bd990c757e47480a52b0df9b6f21e5c775627c571a1087856b54",
    ],
    tag1: "Sharm El Sheikh, Egypt 🇪🇬",
    tag2: "Arabian Palace by the Red Sea",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.7",
    country: "Egypt",
    description: "Arabesque hillside sanctuary cascading toward a 1-kilometer private beach and premier house reef. Features multi-bedroom royal villas with private plunge pools, five-star PADI dive center, tennis courts, and lavish seaside dining pavilions.",
    rating: 9.7,
  },
  {
    id: "hotel-cairo-nile-ritz",
    name: "The Nile Ritz-Carlton, Cairo",
    subtitle: "1113 Corniche El Nil, Tahrir Square, Cairo",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/818899760.jpg?k=230b17f3642c1c4d4dec913fe1e03e4acdc4fa969408942e715385893f8e16a6",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/456051785.jpg?k=ab367efe7938e4f53bbdc45d1b354fa16cfbf8202e8693f6d9946aa5ab537de5",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/566928161.jpg?k=67230f658d6c69053c7702be694d6219c1d0a2bc9e72caae6814bc0381ddaa2f",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/566928133.jpg?k=1278cec8b843f227b8afe9ce1e47898ea7e80c073657d01c6b4ae99818f8bf82",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/566928152.jpg?k=e7e2b3b2b355151a6bb8137e81463ceaad8a6e6a48a9e142eac7de8174caa5d9",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/456051763.jpg?k=bd88260ab35f7d27e99506a35f7aa22a00b91157df7bb427fd4faa59d34408fc",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/596195851.jpg?k=6c8ee193b1241eb3a2f99b43de9e99fcfe5eac77a5090e2333b78959c31fef4c",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/566928138.jpg?k=b007b38d48f4c1a8768bc0a003120d1bf2c01f61be102840356cc1bd1b11e971",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/566928098.jpg?k=8b306765402298cf9fa3974f8161c3ac9fc9aae97242a9f6569d936832205ae0",
    ],
    tag1: "Cairo, Egypt 🇪🇬",
    tag2: "Nile Panorama & Historic Heart",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Wonderful 9.1",
    country: "Egypt",
    description: "Prestigious riverside address nestled between the Nile and the Egyptian Museum. Offers breathtaking Nile views from private balconies, Olympic-sized heated pool with cabanas, and royal signature dining at Vivo and Bab El-Sharq.",
    rating: 9.1,
  },
  {
    id: "hotel-cairo-mena-house",
    name: "Marriott Mena House, Giza Pyramids",
    subtitle: "6 Pyramids Road, Giza, Cairo",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/628111247.jpg?k=55391a33d7b154c53543ddabfa7cf3d2bfc5da0ae69eef56816adb0586d4362e",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/590093029.jpg?k=1e81c330f413df762c002665fafb69761a63c9414961f9778928023dd7db1fb4",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/426572944.jpg?k=f671cdf2f3c543fc92491d861120a1216d2b634011dcd502e1bafc16ea2d4d37",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/628111249.jpg?k=d0692945701a9eec0ddbf2278904d3884fe19e71e38970b8aae23e57138fc694",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/895458333.jpg?k=46ed74960cbf0eef49eccb88e8cfad2713028f46a25a380daf68bba1268c81ff",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/683875788.jpg?k=3e057f909c4e9bd6d7bd9bca91effeb21d6e44505e5a88d9dbe2dd38806dd245",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/683875728.jpg?k=b9fa8fe61b74e122c7ce2f0776019b439aebf38857bf5affe31c4e755fb37663",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/683875807.jpg?k=6a0ce3cb0f258f7137eadf20cc85e0f2c83fcf826f704eb8b86ccd4ee9a57f0c",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/895458091.jpg?k=48d12c4c168ee551f8cba63fa8526398cddc184d4e03baacf54f64f7a1f66aca",
    ],
    tag1: "Giza Pyramids, Egypt 🇪🇬",
    tag2: "Historic Palace at the Pyramids",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Wonderful 9.4",
    country: "Egypt",
    description: "Historic royal palace set amidst 40 acres of fragrant landscaped gardens with unmatched views of the Great Pyramids of Giza. Features handcrafted arabesque furnishings, outdoor pool, and legendary 139 Pavilion terrace dining.",
    rating: 9.4,
  },
  {
    id: "hotel-athens-grandebretagne",
    name: "Hotel Grande Bretagne, A Luxury Collection Hotel, Athens",
    subtitle: "Syntagma Square, Athens, Greece",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/13254399.jpg?k=e868120a0aef3b08a2e190f09c49774f9747bf17a84af30c5db90bfc73530177",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/13254403.jpg?k=4dcb20c36764bb2c1a0f5bad9c4e1d65d98c281ebed6dc6f0d72810c93a2d3dd",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/68568261.jpg?k=a678efbaed31298b0a031d18499c5aa02a97279c5f5f11ea8f90c97d32833031",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/590140501.jpg?k=3150d2c0378e88c5cef72105efcf63ebe54348fde213076c00b5a6f66e45fdd6",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/14155029.jpg?k=3f74c99a9106536b763505d943bdf4f9cfd4ca3fd462c146211892e0ae5bb55a",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/13254368.jpg?k=76ef7631e4042704fd9655e8c16111bd2f21d46653f8ded459cc31e638c1271e",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/590140417.jpg?k=f1a6e611c352d94a053d336c3fc6fefe615487b2be7988a7f12744a8d96a0594",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/68569435.jpg?k=2a7db725533b03f8c2936c7a4bc4171002fe0955e6e19872977e8d5931720565",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/129128184.jpg?k=f252a9ded7629eb9d172fe65433379dcdab4483ef526e303c2a804fe6b7254c8",
    ],
    tag1: "Athens, Greece 🇬🇷",
    tag2: "Acropolis Panorama & Historic Splendor",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.5",
    country: "Greece",
    description: "Landmark 1874 neoclassical palace opposite Parliament and Syntagma Square. Offers rooftop dining overlooking the Acropolis and Parthenon, indoor and outdoor pools, bespoke Butler service, and an award-winning GB Spa.",
    rating: 9.5,
  },
  {
    id: "hotel-santorini-canaves-oia",
    name: "Canaves Oia Epitome, Santorini",
    subtitle: "Ammoudi, Oia, Santorini, Greece",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/907197896.jpg?k=6f70cdc4b7981fcb802c20a334cbd038d0e7c1c198ef9cdceae84de98062eb55",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/151354044.jpg?k=0a1618c1ee8f18e083c4d224ea97036caaa01a89ce1013c858836c9a601a2a6a",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/464320119.jpg?k=310f43b2bc6f5ca9cc7cab715e19fff9b1553d7e0743255f891b9533db896b89",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/464319191.jpg?k=ac1067a1bdbb2ae8252d01c107707ab69ada74d02012f4a114615504e7a3e02a",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/464319317.jpg?k=8cc12adec552c20ac2adf7b230fefdd6b60de99035ab24b665487aeb3295e970",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/461914647.jpg?k=01e1fe46a4a7f0c3d7626137babc2f222752022415c38b130418b31244e4d186",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/669476824.jpg?k=27ef8b726ffab04b82187a7af1906a0e915e38c41280d9a1573b3980d34bbe41",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/613892323.jpg?k=0b058f63db44168f566b9f30cea6b5fb5ab4a8f404bb4c4d755e49bb77ddf632",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/669476863.jpg?k=56dac1b7b4fa6303418d1a615251b21e9afdc408ee0c842aef876ad1361d9dc6",
    ],
    tag1: "Santorini, Greece 🇬🇷",
    tag2: "Sunset Caldera Clifftop Sanctuary",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.9",
    country: "Greece",
    description: "Ultra-exclusive clifftop retreat situated above Ammoudi fishing village. Features private sunset villas with infinity plunge pools, Cycladic stone architecture, fine Mediterranean dining, and uninterrupted Aegean Sea horizon views.",
    rating: 9.9,
  },
  {
    id: "hotel-turkey-ciragan",
    name: "Çırağan Palace Kempinski, Istanbul",
    subtitle: "Çırağan Caddesi 32, Beşiktaş, Istanbul",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/922789183.jpg?k=435b9abacbff62cfeeb4fe64d5d22c555d17d0496fd2282754235a4bdcda7308",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/915922447.jpg?k=c6a9e414ae684b2f1bfc21b7145c47df47e21266f737097af69d8ae0e31d4228",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/922789159.jpg?k=ae5867e0c4ce2c557c67bdb0822fddd8910e666204894f6941c1735b85adadf9",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/922789158.jpg?k=2b92ff72282dcaab153ced9cc9a1ecdae198189dae99b3be3c33c0500632de55",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/922789167.jpg?k=6acc9c60d244ba2f91fa1cd62d2e2d39d4512eaf5c9d925ba1d9cee75733bdc0",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/922789171.jpg?k=8893d4a8e99209152769a2ef96431db844ec5f16e927e08511c5bea90348f459",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/922789169.jpg?k=3d03767eb16102bc2ca4f4e7681cedad8449731c05a7a8b66c4b549950b4978d",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/922789180.jpg?k=6d92d968a2cfec18425c2a84457addfa9a436705f4ebce79dde2455a5e1c7e53",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/922789185.jpg?k=40ba0b39f907f7baf6ae7289ef6ece662163ff1b99c3c8bb0179550f310df75e",
    ],
    tag1: "Istanbul, Turkey 🇹🇷",
    tag2: "Ottoman Imperial Palace on the Bosphorus",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.6",
    country: "Turkey",
    description: "Authentic 19th-century Ottoman imperial palace directly on the shores of the Bosphorus strait. Features heated waterfront infinity pool, private helipad, palace suites with 24h butler service, and Michelin-recommended Tugra restaurant.",
    rating: 9.6,
  },
  {
    id: "hotel-turkey-mandarin",
    name: "Mandarin Oriental Bosphorus, Istanbul",
    subtitle: "Kuruçeşme, Muallim Naci Cad. 62, Istanbul",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/580158074.jpg?k=a6565e0445d199e23ec1a970055f9fea15495fe221401ec1456f82ed864ce797",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/909811652.jpg?k=fd294c20e08808abf5a8f7bccdcf739a2335d4f1dce4a686573ae1c01a113dde",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/909811533.jpg?k=404c05d20f21f4ab139cba399e60f74aa737ea074f631b0fe50de3c4c2153ae3",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/909811371.jpg?k=3a99e7293423f020d84a84603803578ec83737b974ec318a3ea002aca69b9a51",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/909058119.jpg?k=122f0571ed943c424fe06278748357712820a314c8955ec0e95c10ab76e5c473",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/909034327.jpg?k=b6c0fd7d4a8423093147d473e4e84c863f817f362258fa370358c6b42ce3379d",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/909034191.jpg?k=72ea716a8a020d09f3a974fc282997fa5e56f011e5df369c02a5e1002dc2c896",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/909031760.jpg?k=16316d5cf85dd9d5034db25ef4116cbf6b1c410968e8aadf01694369787c9525",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/660965707.jpg?k=569a7d48a8b91785aaff695f58a05a93c0c07369ab6d86362c877984cde7e618",
    ],
    tag1: "Istanbul, Turkey 🇹🇷",
    tag2: "Bosphorus Waterfront Luxury Oasis",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.7",
    country: "Turkey",
    description: "Contemporary luxury resort lining the shimmering European bank of the Bosphorus. Surrounded by pine groves and century-old trees, offering indoor and outdoor pools, lavish spa treatments, and Novikov Asian-Italian dining.",
    rating: 9.7,
  },
  {
    id: "hotel-istanbul-raffles",
    name: "Raffles Istanbul, Zorlu Center",
    subtitle: "Levazım, Koru Sokağı, Beşiktaş, Istanbul",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/882671396.jpg?k=dfeccc8e0d811ab775cbc00bab043d56e2e93cfb313882724b6f54e2c7c0ca82",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/811117431.jpg?k=dd0078c10905cfcd985011f7e2a5d8e17467e198b9213d86172a55de5e782798",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/874402771.jpg?k=4589f7b5ba998fa90991e7950db60878fc528e480f2694a7b41b7e4482b16ae8",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/880109509.jpg?k=9e0fa207df624b8d98a8f651feae13a84dc5cd14ee86b21ad6df8720a57ee7b6",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/847393959.jpg?k=7eec5fff4ea56211a7ba8e5bbd8b975505178c7c1b09a1932ca70da3704b1ed9",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/882671387.jpg?k=6f65a1cb5be50e7c39eb1ad95613f8f97c368c49ac552a2e1bdbd449dd665ff5",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/811117433.jpg?k=d54ec89e73b057b6b74ed0e1a86a7802c004b129d961092fe1afe35ff314e4dd",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/875748719.jpg?k=976e123da93a0bfe129610944554bb7c37cd4cd09902c36055da27b41686fb72",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/880109508.jpg?k=7ef3af1b5f4f3869ec752ab8a4cb1382d2ee3d0401e7ca57c313bedfc7e23aa2",
    ],
    tag1: "Istanbul, Turkey 🇹🇷",
    tag2: "Skyline Views & Zorlu Luxury Haven",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.6",
    country: "Turkey",
    description: "Modern architectural jewel perched high above the city at Zorlu Center. Showcases contemporary Turkish art, panoramic floor-to-ceiling balconies, signature Raffles Butler service, and a 3,000-sqm holistic wellness sanctuary.",
    rating: 9.6,
  },
  {
    id: "hotel-paris-crillon",
    name: "Hôtel de Crillon, Rosewood Hotel, Paris",
    subtitle: "10 Place de la Concorde, 75008 Paris",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/889065123.jpg?k=59a67327dd7f187c669c408d139857bb168820683b6d15c74c0482cf92def8a4",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/889065631.jpg?k=4574ba23d58033353fa35bc7082b82add13422d51141cc004873a2946851480c",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/269400097.jpg?k=fa139896b565112e7346e5fda8465d196737b91a718a7aed349cc58e45aea257",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/889066873.jpg?k=db3365211853dab760bcd0f9c92bcf61e195f0f77e32b2d0aeee7f4a52582b09",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/585020827.jpg?k=88ded95642459d59ffb5c3a5e0dea5741a461da2497f7ab73797e4d51903aa6a",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/889068483.jpg?k=958c9756d554b185ececbfd2fa79cd1ed94dccd244d08cfee5a9665d139f299d",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/68807905.jpg?k=9d54771660004a26d6ef11e95bca0069fe39a17c2864dfe6f933243def008d78",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/269400130.jpg?k=4fece8cea9e447bef985830d57b55a1d2df7115ee662c81f3a7346092776d9c2",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/889065871.jpg?k=2991c535419ceb7d948781b1ed4929662497a372de720b53dd8f461a727a46b4",
    ],
    tag1: "Paris, France 🇫🇷",
    tag2: "Historic Palace on Place de la Concorde",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.8",
    country: "France",
    description: "Legendary 18th-century French palace commissioned by King Louis XV. Masterfully restored with grands appartements designed by Karl Lagerfeld, Michelin-starred L’Écrin dining, subterranean swimming pool, and Sense Spa.",
    rating: 9.8,
  },
  {
    id: "hotel-paris-georgev",
    name: "Four Seasons Hotel George V, Paris",
    subtitle: "31 Avenue George V, 75008 Paris",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/232783611.jpg?k=70a6c58744856c165976306d8e3be5ec4c29435ea93147f644df677ed512f6e5",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/722089989.jpg?k=b527d9238e50a3bac1903e755a9892e70ba82a380425c2f1afefc9ac8f369237",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/232770227.jpg?k=af3ff627a2fcfb95d42bdf1a7fc90ecde1ad41a4370098cf0d161227301f24de",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/151791613.jpg?k=cfb4040eb52fa1b5664dd6077244e267bf76a58707333a495ff5d12491ff0d48",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/232783636.jpg?k=edbcfe70944e36829cc7d1115a8219137730933b4074138a1f0b0117019d86a5",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/151791609.jpg?k=00d766852c49fae46a90d0720b89f4377af199686d089467e2332a49ff92db7a",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/900901454.jpg?k=b4470f3865eab755d28d94bf3a67f46090527b20c652dc3d45bf0b444f52804c",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/232783603.jpg?k=ccfb96992bd8bdc4ec1916a48da9260db47cea754a128838d4652ea43531bab2",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/232783629.jpg?k=6d7027477d4c23249452bd243b890e70ac49784379f12a4706bfcabf48275a0d",
    ],
    tag1: "Paris, France 🇫🇷",
    tag2: "Champs-Élysées Golden Triangle Palace",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.9",
    country: "France",
    description: "Iconic Art Deco palace steps from the Champs-Élysées. Renowned for its world-famous floral artistic installations by Jeff Leatham, three Michelin-starred restaurants boasting 5 stars collectively, and bespoke Parisian spa retreats.",
    rating: 9.9,
  },
  {
    id: "hotel-paris-bristol",
    name: "Le Bristol Paris, Oetker Collection",
    subtitle: "112 Rue du Faubourg Saint-Honoré, Paris",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/715778144.jpg?k=680e998f69dcdbc3e97c96ee2a48bfd6363a6d0b5ba9c7fa36c2bc34427d6f3d",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/132497911.jpg?k=7a1f3b30aeeb0823468fbd6bf02fb2b0e4fed01d0bfcb30d11743feb185c0c25",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/222480749.jpg?k=d63d21209e15bb1d9f53c7fb009ad35915dbf84b7011ba94a8831f8368cb43ba",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/167067842.jpg?k=6fb1561a890c1818f0c9a876c66cad17d12d96d93069aed8c221bea711b4fe0c",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/500414108.jpg?k=df2f42e4889621554809fb1dadb0306129b1e8df1e120385e0276f292b2bc197",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/465333741.jpg?k=96a5e941a5bd2221bdc978494326c76dbd04dbdb37a72eefe0c597c83c4c7d22",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/465333758.jpg?k=f64b10240520468b38a748016a9c76e2fd3ba71212ba229073fe75e7c2f1a4fc",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/465333765.jpg?k=8c21c39394ef9d1c410288227bad530649fdee9e60d6060a82a3587d08f59a9d",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/465333771.jpg?k=b23b9f4406874b42ac05bb502d256109e92b96da103b9c5257db367e61065398",
    ],
    tag1: "Paris, France 🇫🇷",
    tag2: "Haute Couture Palace & French Gardens",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.8",
    country: "France",
    description: "First hotel in France designated official Palace status. Features an expansive 1,200-sqm courtyard French garden, rooftop indoor swimming pool resembling a yacht with views of Montmartre, and 3-Michelin-starred Epicure.",
    rating: 9.8,
  },
  {
    id: "hotel-monaco-paris",
    name: "Hôtel de Paris Monte-Carlo, Monaco",
    subtitle: "Place du Casino, 98000 Monaco",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/856861886.jpg?k=fd2fc5defc354404857a21b85b7b106e07687f0dd2f9990747ccccdcad58b049",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/243898523.jpg?k=f723da6654f4cf432a1b062da7b75a34a49e29f3b011aa4b6525772ad6461f8c",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/664900776.jpg?k=c8d6a77063898b8105a166b4b44bb99b712eaf69ad2690be84912711a27617d0",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/664900858.jpg?k=819a79c16321ba426653719352cf8a308e4a70485408e9e49cb9b984441247f9",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/325406607.jpg?k=77bd87af1efc1ed81a30bc80184394341c9b8cfb6aad6c3fcda4a3865cd1a177",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/664900672.jpg?k=66f607fd6e47461f45b315834fe437651dae51a8731e3a5165985bf6e227a5a9",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/664900723.jpg?k=a83b46a64c2ff743b4a16718a6a37ecedb51e1590367eaac9cf0c7c00f63bbd0",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/887725679.jpg?k=973244bd6d8ad9cefffd82061037f96596d3ca28edfaf24416d5784f20b32133",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/887726578.jpg?k=482de05678fb760c9b79069850b4284625ea94c817543f824de03ab311d565a3",
    ],
    tag1: "Monte-Carlo, Monaco 🇲🇨",
    tag2: "Casino Square Riviera Palace",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.7",
    country: "Monaco",
    description: "World-famous Belle Époque palace situated directly on Place du Casino in Monte-Carlo. Home to Alain Ducasse 3-Michelin-star Louis XV dining, legendary wine cellars carved into rock, and Thermes Marins Monte-Carlo spa.",
    rating: 9.7,
  },
  {
    id: "hotel-london-savoy",
    name: "The Savoy, Strand, London",
    subtitle: "Strand, Covent Garden, London WC2R 0EZ",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/735156576.jpg?k=927489b1299ca26fa9ddeb0021977e1010b75606c481ec4cfcea3c6c2102e6f4",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914960924.jpg?k=90e512a008ea11debf504a53bb30f9d3a581333c87cb73d5813a16d6fa544a1e",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914960865.jpg?k=13b0751c0ab67054cbfcc73450f955ab67aa8436d0e03be37b4446433c35cbdb",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/934178480.jpg?k=ed36d98faa9daad0159d3c6e407a174e6ca1bace22e04a0befa5224cb36febbf",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914960878.jpg?k=1dfa0d24c42148c4071c19b5dc1eabcd23934a10c17be5b96c8bc5de7897b51c",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914960861.jpg?k=1164145c568fc3a8d1cb68574963979d62b7026ae1b9747ed12fb6b47d542bb0",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914960863.jpg?k=cfbc86c38c5242991d962fc3323a0652680b209b9d51049ed907b1cb85972c05",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/934178472.jpg?k=c1b9b08f48ef5b3ceb5afad12f0a1dd411f67daf45713b82a054b0dd2d744ef9",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/934178473.jpg?k=f42e5f1825e48ff6d2f73e750fb4d5b9a1281242068cfb5a7ce4dbafe78a0356",
    ],
    tag1: "London, United Kingdom 🇬🇧",
    tag2: "Thames Riverside Historic Grandeur",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.5",
    country: "United Kingdom",
    description: "Historic British institution open since 1889 on the north bank of River Thames. Blends Edwardian elegance and Art Deco glamour, featuring the world-famous American Bar, Savoy Grill by Gordon Ramsay, and Savoy Tea.",
    rating: 9.5,
  },
  {
    id: "hotel-london-ritz",
    name: "The Ritz London, Piccadilly",
    subtitle: "150 Piccadilly, St. James’s, London W1J 9BR",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/870378716.jpg?k=9e1c75be9c57fcd49dfae4cedffacc34c75cddb9f536ad7776cd9419519e77b5",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/870380648.jpg?k=d7a4908d890d88fc82d4e6a1e0ddeaa286e61012ca80aa557f55e998444c82e2",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/106779100.jpg?k=d322f1b27f3467c4e1d8dfd47d892df4c87fba73e4d4b2da5f1da3c89b6a2866",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/449668736.jpg?k=acc6bd60b4059706419ec31481cc8a9e8bf3d8f77727299bc7f22c4b3dbdb7fb",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/391196713.jpg?k=3745c13185554578c8640eb1a217348770d3ef26ce3c2362a637294210fdb592",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/391196794.jpg?k=8f29776c21cc29bb99344072ed6600d1683dc820f4fbfee77a906410545ab617",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/391211807.jpg?k=a319ede7fe9be313af5d2b4141d72d8d0878f7ffd8b61015db20dbcd5f05cba4",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/391211761.jpg?k=d7fcb0c0323ce745d02fda9916d5e1e345c196944fe03762300b2b86094252eb",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/391211796.jpg?k=18d20c537d07f9822218e0f7bde5c44f4c2ffb15411b1d2699849537a6edde02",
    ],
    tag1: "London, United Kingdom 🇬🇧",
    tag2: "Neoclassical Royal Sovereign Grandeur",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.6",
    country: "United Kingdom",
    description: "Symbol of timeless British high society overlooking Green Park. Renowned for its world-famous Afternoon Tea in the Palm Court, Michelin-starred Ritz Restaurant with hand-painted fresco ceilings, and Rolls-Royce Phantom chauffeur fleet.",
    rating: 9.6,
  },
  {
    id: "hotel-madrid-fourseasons",
    name: "Four Seasons Hotel Madrid",
    subtitle: "Calle de Sevilla 3, Centro Canalejas, Madrid",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/277578371.jpg?k=568c86e0b7ce74d32fcaf459c12b313a77b7a25a70165755e234d43571c5a3fb",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/641214700.jpg?k=e154199cf04f9b497247af7f2bbf918a0042f172b48c06a9bf17d883b1829a69",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/277578367.jpg?k=6bfc0aa0744fde93fec5c1460451181388bedf15cf7c19fce54c5a2cb09c3a19",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/277578531.jpg?k=b4038545036875db761525ed5d5229dae1a16b55ee6986a2bfe05a3b13f3b443",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/302470911.jpg?k=69089a6a92cc4e88fe2e8f2e1a8746fdb87a05f95c21cfac01b31e912f7fcfcd",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/402846958.jpg?k=9e8f4df1f41ef96be21c5665353f612a979a98d3a59eb8e065ce204159077f9d",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/277578391.jpg?k=f825e844c1ad3c0292a1598f08a7743afd73e557a00699e80104dd78252e7ee2",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/277578363.jpg?k=7da9f1f81f4ac9a781a2b2292ce1a1b933cc89567b44d53600a230b1c9056120",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/277578513.jpg?k=7d18dad870299cd6477b7584b6833b1c6b4660736e40fa60a1d7295faa65d058",
    ],
    tag1: "Madrid, Spain 🇪🇸",
    tag2: "Centro Canalejas Landmark Palace",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.7",
    country: "Spain",
    description: "Seven historic buildings meticulously unified into Madrid’s most luxurious destination. Features rooftop Dani Brasserie by Michelin-chef Dani García, a four-story wellness spa with skylit pool, and a private collection of 1,500 art pieces.",
    rating: 9.7,
  },
  {
    id: "hotel-barcelona-arts",
    name: "Hotel Arts Barcelona, The Ritz-Carlton",
    subtitle: "Marina 19-21, Port Olímpic, Barcelona",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/836056401.jpg?k=d8e1d149d653c53e48c0d3cdd2a89803731b4f52d9b583110e338b5ace73cc2c",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/467640429.jpg?k=d98c098314df807fa0c454a406e9e75bcabe3552c41f6d77c9afbd7dedb89f74",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/794354139.jpg?k=30e192b669f550424d3f7664559e65573c869136f2892c43d6dcb364af15aafa",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/442673023.jpg?k=5776ad76c227d4d64ced54b543b0cde36c704b2da590ccea6ef4ef4f6022e89c",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/481761455.jpg?k=e3341e8a66cb3c7d4f57e30c88debe9646bd6154dd6bace87bc569aae2394fe5",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/444178144.jpg?k=1109191d9f1de5e7933f4028066b3831d0f0a6ddd2f65c3140baeac42f3d5ceb",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/481761442.jpg?k=36ccd20a2d69ac4f38c8190cd64175627b35771c6b910d7628d5c63081752f8a",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/481761366.jpg?k=2539b1bebf7d723c1fab31f02527de2aecc5e9725f916e71bf9a123e16400772",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/481761367.jpg?k=d166eb81dd2ae1c539ad84f02f1293d65a7aac9069d83b223c431d09c912f7cb",
    ],
    tag1: "Barcelona, Spain 🇪🇸",
    tag2: "Mediterranean Beachfront Skyline Tower",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Wonderful 9.3",
    country: "Spain",
    description: "Towering blue-glass and exposed-steel architectural icon overlooking the Mediterranean and Frank Gehry’s Fish sculpture. Features 2-Michelin-starred Enoteca Paco Pérez, infinity pool, 43 The Spa, and seaside gardens.",
    rating: 9.3,
  },
  {
    id: "hotel-rome-derussie",
    name: "Hotel de Russie, Rocco Forte, Rome",
    subtitle: "Via del Babuino 9, 00187 Rome, Italy",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/330188972.jpg?k=2bee510a085d103aed8b7d7c353d20441a5ddc434afea6e32fbccc4fe1f2c7a2",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/106740663.jpg?k=68814bd2edd2de429b1d8197e827a0019cc0765d033f2e30b70e17bb7745defd",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/79215557.jpg?k=3ed5896849e1f723cc7806f84563c0c92fae4b53cf31692f09ca0f0a8205fca4",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/487639652.jpg?k=11c0c851fe0e62a637b286f9671d27abe7f3adba29e52ef14a2e15ddaa5502ae",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/328770760.jpg?k=f6a5e2a1254e02a90d05dd9ef2c607eaa92bd4e6e0c360fe7d95e8a6da9e664b",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/451656015.jpg?k=2c9f7bce2d727d2f3a0e4f63b35d1fe96739f96d86fc1971379a9faa4515f3d1",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/278888032.jpg?k=cc1d0ba7ae941112d890984b1be89be546b76a5bb34dfdbf29bad14437bf49eb",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/278888034.jpg?k=a0c9a66636b119cb3b6be4da8cfc991b44a43ee67fe3880fc18f422a999b9832",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/278888036.jpg?k=28063ef4274341dae93ee69bcf292aa7b0b301180a44e4548a589cb15dbaf12b",
    ],
    tag1: "Rome, Italy 🇮🇹",
    tag2: "Piazza del Popolo Secret Terraced Gardens",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.6",
    country: "Italy",
    description: "Celebrated Roman palazzo nestled between the Spanish Steps and Piazza del Popolo. Famous for its terraced secret garden, outdoor Stravinskij Bar, De Russie Wellness Zone with saltwater hydrotherapy pool, and classical Italian cuisine.",
    rating: 9.6,
  },
  {
    id: "hotel-milan-mandarin",
    name: "Mandarin Oriental, Milan",
    subtitle: "Via Andegari 9, Brera, Milan, Italy",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/890121583.jpg?k=c9096a20612a7fd94d208d2902d9662b2ef361319cd8c828481a9069471c2092",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/581808750.jpg?k=7e6867f4994be0a5a354ba0faf0bf8cdf00b5acecbdfd163f401cecc33167f99",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/581808703.jpg?k=bf46ca32b9260c7d8a685edb9b1531c1527969d5768b7bef92a25dc76f33afc1",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/922880300.jpg?k=4876dd5f2bb9e4fb3f4a098b8e42e482e094123aa7bb3535a653ba74acd1af6d",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/856832943.jpg?k=618844ea95f580562cc9beb01bbfc15b7a11574559ccb59b139ea8bf1016e210",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/581808693.jpg?k=d08896d4b9576987b90717bebd1b84732d0aec1afbb5275a8da766dd81c743dc",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/820681858.jpg?k=dcfd686d090b70b1516168b385977484c9b4d62128033daa980d4bcaedf57753",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/922880294.jpg?k=409ff9c0685690415169554d6ff9c626d5837c69db5d5c893b9ed7f3d272e245",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/581808656.jpg?k=9ae09468780a6eb20937d22b068d17645635724fab185a096d9e8f9831300b3d",
    ],
    tag1: "Milan, Italy 🇮🇹",
    tag2: "Brera Fashion District 18th-Century Palazzos",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.7",
    country: "Italy",
    description: "An urban oasis occupying four elegant 18th-century palazzos in the heart of Brera. Steps from La Scala and Via Monte Napoleone, boasting 2-Michelin-starred Seta restaurant, indoor heated pool, and bespoke holistic treatments.",
    rating: 9.7,
  },
  {
    id: "hotel-firenze-fourseasons",
    name: "Four Seasons Hotel Firenze, Florence",
    subtitle: "Borgo Pinti 99, 50121 Florence, Italy",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/586851037.jpg?k=c166d46fac005c96096f4094e2262e12dad5e1558755e998d763db86c9e3d39d",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/881806603.jpg?k=25f8802f859428e350fe3ddf6606f8c90ade7458cb19744be3861f5273148189",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/586846992.jpg?k=d0e151725ded05204bc2cef3976ea2d2623180e37be93831ee7bef2a4bacda84",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/586846953.jpg?k=195ba04dc03c28df7d1cf6a2aacc4ab03de87be8687baa099ec93ce44d024d53",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/586854969.jpg?k=d180779b40ef77cb24542cc98be30a18319c2c452060d7764dd7701fd457a87e",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/229987983.jpg?k=cef2e2f2f70ed9c00c30048d8d03bf6390edf1b172cd43396e5c594aaac307b3",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/226506859.jpg?k=0e466485c05b8d5b8a3df129aa32699d13eee964a5b8b2d5b9be583f4751efb4",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/180495533.jpg?k=166637e6754bb8113d2cc05976b369e4ce6f47d27b7a76a5d7ea362f870a9dd6",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/17523008.jpg?k=03ff4486bb477c558f4e957cd859d769c1c71f6f1ea58dcd2f864fa08f8ed49d",
    ],
    tag1: "Florence, Italy 🇮🇹",
    tag2: "Renaissance Palace in Giardino della Gherardesca",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.8",
    country: "Italy",
    description: "15th-century Renaissance palace set within Florence’s largest private park, the Giardino della Gherardesca. Showcases original frescoes and relief sculptures, outdoor pool, Michelin-starred Il Palagio dining, and private spa sanctuary.",
    rating: 9.8,
  },
  {
    id: "hotel-prague-fourseasons",
    name: "Four Seasons Hotel Prague",
    subtitle: "Veleslavínova 1098/2a, Prague 1, Czech Republic",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/354495326.jpg?k=cd2ddc2db5fd4380dde7e61766ade9dcfd54f482c1fdf2d6de2b123fd150a30c",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/12867198.jpg?k=ad7277dff7969ee5750ead45c8cbc9410ad98348aacbd3fd82d68606d6603775",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/77294973.jpg?k=2f31023ddb8d744012e547fbbf72ff726e191ffde7409dd62757c3f84874b3b5",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/105494231.jpg?k=cf5e195da7ba1133599e02542362f71ab0753aeda44c6ea49981f21fc83ea2b0",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/332636819.jpg?k=2b30c7bf85874d99eff09c5fa0cf40083c3c37d03c74f7364de39ed0da3d9fe0",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/15307495.jpg?k=465176867efd960dbef6e2ac93d0b8d43e28a8c6eed8d4caa5430b2abc146a75",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/77291547.jpg?k=b85aa4a2641c08514f77c01ec0cc5127069cf2c4fbd0aad9ba2a9e6d155f9625",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/270681391.jpg?k=aebe5b1ae321ab8a093c15edc964c7b8b534cd8660a8ebae7a7f077323e8db0f",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/466927439.jpg?k=0676428242668f3b2d78bf594d025e62b6a581788ba0ddee440e64950b82a969",
    ],
    tag1: "Prague, Czech Republic 🇨🇿",
    tag2: "Vltava Riverfront & Charles Bridge Panorama",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.7",
    country: "Czech Republic",
    description: "Composed of three historic periods—Baroque, Classical, and Renaissance—interconnected directly on the Vltava River bank. Offers direct views of Prague Castle and Charles Bridge, CottoCrudo modern Italian dining, and AVA Spa.",
    rating: 9.7,
  },
  {
    id: "hotel-amsterdam-waldorf",
    name: "Waldorf Astoria Amsterdam",
    subtitle: "Herengracht 542-556, Amsterdam, Netherlands",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/637529941.jpg?k=df99dac82fea656c2ed7d1e92a723ccec19abde5128bfc08e7848412bb5d88c7",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/676242656.jpg?k=e73b5ce975af4cdc9011748b48046ceaf839fe5983b683054a44627f6bb721ad",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/677581892.jpg?k=569734454517180996086d09f85eb5e8421034965a4f96821c1a6bb3ba1bcbbe",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/666177629.jpg?k=e176dc1a6fa433eef72bc2019ba1457ccf364514b312565221eee2533efc4ea1",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/676242754.jpg?k=3d33d157b6a2e699cfc93ec567c3ff52d116ca521f35583a0456f9e4c8c9122a",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/666177613.jpg?k=7149cf762f265c9bc6464c272f3981dbae3050c2b876662c527a3e8a81dd56a2",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/666177631.jpg?k=521b86e08769880754010653003de0c20999dc65dc36a6cc09a4024a2de4ca13",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/677581882.jpg?k=a1670a23d0db68edfced3bf8b1c92a16c3a3e482abf96a225631d30db70dac87",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/666177728.jpg?k=6a8c3d61f0f64c94c46628644b92887faadda6ad27f94a900c73ad4b6bcbc722",
    ],
    tag1: "Amsterdam, Netherlands 🇳🇱",
    tag2: "UNESCO Herengracht Canal Palaces",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.8",
    country: "Netherlands",
    description: "Six monumental 17th-century canal palaces on the prestigious Herengracht canal. Features Amsterdam’s largest private courtyard garden, Guerlain Spa with heated indoor pool, and 2-Michelin-starred Spectrum dining.",
    rating: 9.8,
  },
  {
    id: "hotel-vienna-sacher",
    name: "Hotel Sacher Wien, Vienna",
    subtitle: "Philharmoniker Str. 4, 1010 Vienna, Austria",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/931109674.jpg?k=ceab66b00daec52cbded190ca7201b1fae25c0867decc0ddc9a8a0f9be24bd81",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/26951784.jpg?k=3ab1cb4e90bcd33a5c1ef2dfbfb31d0357e4b0b51a7d33329e4dacce29b2531e",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/211500653.jpg?k=5065fad75e5ce4803e0e9bac9a0b5fdc6e79a2160cac3ceca1bb57782adf7629",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/490277515.jpg?k=3df6725c85866e670e783c063efa48560968e5f511d78a7776e1f08db87da02f",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/535832131.jpg?k=7343f620385a4ee724793a2843c0eb0cdfda35945c4485c82bd0c6a5d9583e9a",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/535831977.jpg?k=60f434ab684112cb28e095f1c46a9d1ece16adbb85047120a3ceb4e6b1db1146",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/535831786.jpg?k=176936c11422931c0379c28f871e9023245b443f120d5265621126a5f03e5b78",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/535831414.jpg?k=f6b3f9190092a3593dee57aa7d43019592ba7f3c7fce11b9bf3fb72f99d3dcab",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/535831000.jpg?k=a838c4ef5529d5ab652d574647e28963d2923d7147e31fcfd42d1c0dc2d51c00",
    ],
    tag1: "Vienna, Austria 🇦🇹",
    tag2: "Imperial Opera Heritage & Original Sacher-Torte",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.6",
    country: "Austria",
    description: "Legendary Austrian cultural heritage landmark directly opposite the Vienna State Opera. Famously founded in 1876, home of the original Sacher-Torte, antique oil paintings, Sacher Boutique Spa, and imperial suites.",
    rating: 9.6,
  },
  {
    id: "hotel-zurich-dolder",
    name: "The Dolder Grand, Zurich",
    subtitle: "Kurhausstrasse 65, 8032 Zurich, Switzerland",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/295103799.jpg?k=5c70abbc799492a9f59146fd0136c6406fdeb97777b560501b8519729f32efed",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/334176274.jpg?k=7da272f5032fda9c14ef8fb206d069e6aa50f60b26a6ead03361ba6fb6dfff8a",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/334191531.jpg?k=4ebb759e6ab74f4947ec02cb37bd776596333dd5add2bd8183a249246debfdf0",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/305637189.jpg?k=f7789a774b7a1fdeac92d48465b67c3cda9dbd5fed072526221e557c3edb64f5",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/76891005.jpg?k=a32a1f5233065a52a4df2600aeca223284ab7b6bfe62407821337623990dd029",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/305637199.jpg?k=4f11c64e867f0ab6076ba3b11b326ad0e78275b59d44e47f209bb615f2fd330f",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/600632552.jpg?k=e968f8818de62271c983adf5202f49bb94c66336a74bb826657b1a5045da623f",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/334191590.jpg?k=b3d7109c5dffc242f9652d82ff75356d87e0b4e36983ffe06b62bb519d7a607a",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/305637185.jpg?k=02f8c12f05e5ef6b4a018cf6c6712a937002acbb15762668e7e566dcdd60e7ee",
    ],
    tag1: "Zurich, Switzerland 🇨🇭",
    tag2: "City-Overlooking Alpine Forest Retreat",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.7",
    country: "Switzerland",
    description: "Historic fairytale resort built in 1899 commanding panoramic views of Zurich, the lake, and the Swiss Alps. Showcases over 100 museum-grade artworks by Warhol and Dalí, 4,000-sqm Dolder Spa, and 2-Michelin-starred The Restaurant.",
    rating: 9.7,
  },
  {
    id: "hotel-riyadh-ritz",
    name: "The Ritz-Carlton, Riyadh",
    subtitle: "Al Hada Area, Makkah Road, Riyadh, Saudi Arabia",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/643508141.jpg?k=0c116e3c09bd8f65f2af1bcddfd2fd8425ad99ed8824f7cad8862b49304680bc",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/643508150.jpg?k=8865a6fefa47c987ebd0a744ab8fbc746da250364c81bdbb940853a491b2b6e6",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/643508166.jpg?k=b42bb069b263cf3db33c56560dac4b2f30edac560b266071018ccf6d0a637db4",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/434168873.jpg?k=c012c1d56501d5a47f5f2efc09efc48d39bd786a4eaef67fcde3e859db8a9be1",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/643508241.jpg?k=c969b6708ae7c10a9a5a64864527ed7ef6d1885162e2cd55d559cee9ef3ccff3",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/434168855.jpg?k=2a87f1b2f3f977b156f6b34c227d08770ec3c19383775a1acbb9a4fbe0cfeda7",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/711084930.jpg?k=f55a4365231a544072e3fef40626dcb1e6a8a9ea5d3723a832de6dd295d3d9b8",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/711084922.jpg?k=a7abd11cdeff2c0e3cb7c86c83eb9b9c7890783909c3da5d5da4c978378cdb87",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/711084939.jpg?k=ff678402d374e0d26ad1c8b63916a9290a98021b9095f896cca4b996348a93ac",
    ],
    tag1: "Riyadh, Saudi Arabia 🇸🇦",
    tag2: "Palatial Oasis & 600-Year-Old Olive Groves",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.5",
    country: "Saudi Arabia",
    description: "Majestic royal palace set within 52 acres of landscaped gardens featuring 600-year-old olive trees. Offers palatial suites with crystal chandeliers, an indoor heated garden swimming pool, strike bowling lounge, and Hong fine dining.",
    rating: 9.5,
  },
  {
    id: "hotel-jeddah-rosewood",
    name: "Rosewood Jeddah, Corniche",
    subtitle: "Corniche Street, Al Shatie District, Jeddah",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/918866794.jpg?k=8f48ae7f4d3300527250f158fc2cd8342afef61591666ca6493d4978c0fb8023",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/85704898.jpg?k=ed421b06730c5ba92f09d88158aecbeafcee07571dc163c6500c3be97d1d43fb",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/896078592.jpg?k=0e95ee1b044dde44c1c4ec021e057242deed165714651675576dc163463a5da3",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/896060446.jpg?k=76fd1fc1a10052430a108622c47a6bacb9f20f8bf96d3fd5a87a2020b9acfad9",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/896064978.jpg?k=ae9aee8e71936885aae0e7945b43041bd6a24fb5169614d960144c2dfc7d0c9e",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/896065407.jpg?k=c42aaed5ccee4858d995c5e61e63e93d8f590690d45428a375114e940f77d9e8",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/896068476.jpg?k=4319c2ab2aa66df6634e2bd708cf48e27f5062de38154aea14d11cef4edba588",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/896069543.jpg?k=89960e824d0510532a188ca6ab40f6bad2390391eddae523e718be625fba6570",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/177704879.jpg?k=53b5acd7bd2a51e5c320b419c7f9ab4b609cdda1762794fad06be39e9c426abb",
    ],
    tag1: "Jeddah, Saudi Arabia 🇸🇦",
    tag2: "Red Sea Panoramic Waterfront Tower",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Wonderful 9.3",
    country: "Saudi Arabia",
    description: "Striking 17-story modern tower on the northern Jeddah Corniche with sweeping Red Sea panoramas. Features 24-hour dedicated butler service on every floor, rooftop outdoor swimming pool, and renowned Habsburg dining.",
    rating: 9.3,
  },
  {
    id: "htl-raffles-doha",
    name: "Raffles Doha, Katara Towers",
    subtitle: "Marina East Street, Lusail, Doha, Qatar",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/899682515.jpg?k=482665c3b410cb5b8e34aee0556e50c459ef058b6d75b73657e2272df38eb677",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/915003328.jpg?k=7936da402dd598926e058c11b565661e8310375b7ceffcce03c770811ec3c688",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/915003325.jpg?k=0034f5e31be4a6c78968f7eb67712cb1dea23fe6a5c2565e01a37f79eebb52ce",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/915003324.jpg?k=0465a6ac86c6e7754f5600201ecb14e6edf163d12e2a94194c04d4a77c0cf15b",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/915003327.jpg?k=b1390181a677c38484cf92912d07a69854be5532ac65bb14a220a07804ce78fa",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/915003326.jpg?k=669886132d8c0abbf7c675321d9bdff1056019dcaed015c031e52b1c5e2bb9ef",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/915003329.jpg?k=a54c03587f928b1c8b3dc266bc345a82fc31facff07eb304b0cb4839792a881c",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/930972524.jpg?k=d74452266d46ac3dc4bebe9432a85c24e6260d6f2ad6bfa46ecaf8247d92e615",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/930972525.jpg?k=78cd9aec8177b83e8d53310f7ef5ace1fe05200d1ebaad3d6ed4d610186f7950",
    ],
    tag1: "Doha, Qatar 🇶🇦",
    tag2: "Katara Iconic Scimitar Towers Landmark",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.8",
    country: "Qatar",
    description: "Ultra-luxury all-suite masterpiece soaring within Lusail’s iconic scimitar-shaped Katara Towers. Features personal butler service for every suite, bespoke acoustic soundscapes, cinema, and three-star Michelin master chef Enrico Crippa’s ALBA.",
    rating: 9.8,
  },
  {
    id: "htl-royal-mansour",
    name: "Royal Mansour Marrakech",
    subtitle: "Rue Abou Abbas El Sebti, Marrakech, Morocco",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/88033122.jpg?k=c433ecc12a7d047a343b31fd407e0c9d8ac6d6274db4b5596fb3302ba39207cb",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/544048944.jpg?k=22c38f7f4690196a2def3c8f777bae536fb52af052db1d69eba2182045f72104",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/88033150.jpg?k=09e2784b46b6f833be15febef74be0c727eb974e5225dffff5d364cfd95322b2",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/88033127.jpg?k=13c4e95f56542616ddf65705c32f438dcc81305762a71c42a09e80fd622c986a",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/88033109.jpg?k=07cbd29172e9f5a38066d11159cba41f9eaee528e4a9331412cdbbf5045f57da",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/88033022.jpg?k=eea01057e48a861152d2dd1c939bf1110c25cbdf41b792519b84052fab903552",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/88033129.jpg?k=85931b2a10a6ce80780bb76af7c34b11037e8a1398e998527bb39b8ca242d511",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/544057236.jpg?k=212825fc1deed79a587b70b3a217ab4d8aac69ddb0fab5dd6b32e36534c4dd6f",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/88071342.jpg?k=6c6fdd32c308335947b2dba2e281b50612f575a7d470390dcde17c8ce7d85c10",
    ],
    tag1: "Marrakech, Morocco 🇲🇦",
    tag2: "Private Riads Oasis & Hidden Tunnel Network",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.9",
    country: "Morocco",
    description: "Commissioned by King Mohammed VI, a palace of 53 individual multi-story private riads connected by underground service tunnels. Features private rooftop plunge pools, open-air courtyards, and a majestic white wrought-iron birdcage spa.",
    rating: 9.9,
  },
  {
    id: "htl-peninsula-bangkok",
    name: "The Peninsula Bangkok",
    subtitle: "333 Charoen Nakhon Rd, Khlong San, Bangkok",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/434993345.jpg?k=7a729dd2f098e2ef7dbd892a06eb154ffdc2b4a58fda929327008148b7916ee5",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/668444590.jpg?k=1002dfb6dcb347b93e59108f78561f6cf3a3d36ae07096d8ae5308af46f0d3f9",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/668515492.jpg?k=d3141f475f0bb7282a0de3a37cac1ec868d86edcbc0784a91888d0a56f1621ca",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/668585391.jpg?k=24c9a19e20d0dd3fd6a44e4f8d83008f22f709f31406c37a2cbb96b25e641aaf",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/668437089.jpg?k=bd04f6eb1be64b8309335fc08b9bd4d29771495265d5e26af7406c0c6d5674e9",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/668418882.jpg?k=6d70f6e6d3c9164146b346067a6fe2b06bd8535be7a216186e801d7ac8446d93",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/668585442.jpg?k=2eaf8449ec207b1470de6089a8e62ab17ed9b18e66e671daac0c10d48138f77f",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/668418879.jpg?k=8f42fa51fad4e2984715c67c16c4e736346c1e429a99e622dd6a9dd867e3a93f",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/668418881.jpg?k=263209409c9b9ca29da837fd0cec7425e5d36f0d637f493d375c58317968b95c",
    ],
    tag1: "Bangkok, Thailand 🇹🇭",
    tag2: "Chao Phraya Riverfront Peninsula Style",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.5",
    country: "Thailand",
    description: "Wave-shaped luxury tower commanding panoramic views of the Chao Phraya River from every room. Features a three-tiered riverside infinity pool, private green Peninsula teakwood ferry boats, and classical Thai spa villas.",
    rating: 9.5,
  },
  {
    id: "hotel-tokyo-parkhyatt",
    name: "Park Hyatt Tokyo, Shinjuku",
    subtitle: "3-7-1-2 Nishi-Shinjuku, Shinjuku-ku, Tokyo",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/926388753.jpg?k=f282ae9975c363dd2f99809ec7b3455d030ecb2ce43170d58714e6f574bd7039",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/110318570.jpg?k=8fa7014fe35e58967b5eb12f0155a30540c73b5be48079cc2916ab6f77615a63",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/790355607.jpg?k=e3ae6adc3d41852bacc4cb329f9a8a812d62887291ac7db99e1b078f1699b26e",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/909749465.jpg?k=280935c77dbfe03ca57272ffc119c2dc6b10ad21556b54c353db357668108299",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/790354431.jpg?k=64e40c9a128c88f041f1dccc6f39910755c99e02269eff07d4b42eb3266c07b7",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/909678791.jpg?k=bd70c52af1180cbfa82618a22e8b6db4b822c98835618ea713199b0d4636b55f",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/909677947.jpg?k=0132e551e1b3f34b69767d6416d778dee86bfd324025f3d0a6d39a2b21e005ca",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/909677141.jpg?k=ccb38070e90fdadf1334877f2892a7d5bf799458a5318265bddf510dedbdce1b",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/909676999.jpg?k=888ca34b8227ae0ffccc48232ac6d8a1e04b6460b5b4576f6fb439f6062b5064",
    ],
    tag1: "Tokyo, Japan 🇯🇵",
    tag2: "Shinjuku Skyscraper Penthouse Oasis",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.7",
    country: "Japan",
    description: "Occupying the top 14 floors of the 52-story Shinjuku Park Tower with dramatic views of Mount Fuji and Tokyo skyline. Famous for its 47th-floor glass-atrium swimming pool, New York Grill, and peerless Japanese hospitality.",
    rating: 9.7,
  },
  {
    id: "hotel-ny-plaza",
    name: "The Plaza Hotel, Fifth Avenue New York",
    subtitle: "Fifth Avenue at Central Park South, New York",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914954799.jpg?k=162744612c9ec2e1e50f076b6cc96ef38758f66cd30a4b8be8d5776dd19d321f",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914954847.jpg?k=648bb10b4114f69b823f09a13539a9d2c883054ee108af1c0b3606d3bfcf783e",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914954802.jpg?k=111b20a3a421a1cdd08856a77dcdfdcee6477d99830d19919ab321b558c62c21",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914954800.jpg?k=8890fc64d4805a29dcc57972233a453cee01b6d7a6a204cf8f2f90263c906312",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914954798.jpg?k=4a885e64ea0fe756fd79b2468b91b8c6b10b97054baf09412fc1f751ef8b9963",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914954797.jpg?k=f6fea30c07e1132c45eacb12804feb9daf51b6d426c85a2cd11891e989b66417",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/933125070.jpg?k=877a8a584e611dfe164ad0d50b5d7b618a30126c3a189f5c18f4c8fc1039b8b5",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914954796.jpg?k=b3fe99323718f31db8ffdb584987d8c66a66b359a4be7a634af2c703a0b58e6e",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/914954804.jpg?k=09d072f60e74d4db14503e633dad970216b9b36bacec213e57c9d4ab17afdd98",
    ],
    tag1: "New York, USA 🇺🇸",
    tag2: "Central Park South Legendary Landmark",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.5",
    country: "United States",
    description: "Timeless 1907 French Renaissance château on Fifth Avenue and Central Park South. Host to world leaders, royalty, and Hollywood legends. Features The Palm Court, Champagne Bar, Guerlain Spa, and 24-karat gold-plated bathroom fixtures.",
    rating: 9.5,
  },
  {
    id: "hotel-maldives-waldorf",
    name: "Waldorf Astoria Maldives Ithaafushi",
    subtitle: "Ithaafushi Island, South Malé Atoll, Maldives",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/767816757.jpg?k=129bf788eb7b8fc8ca9a8bfb2ad58c9d84fda9b058830bec1f3a90558b3f3893",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/666107962.jpg?k=87dc0007c69322d41cd3c2a1c7f71cfa7b252e83a58886eac7924089491cf6cc",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/666107978.jpg?k=6195f4b47159d7f813d04c8c6cc040814d18c0204f2e4bcfa5227369ad5309a1",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/666107915.jpg?k=9d460c41be30ac55f30db1087adfed3e4638907d574c11e58f14f76f1b984940",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/666107919.jpg?k=89088cd1f63ec23ccaa55f32e7acf775f4bc2d892cebf40b6655a583ee04e3ed",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/666107918.jpg?k=e912439dc387354f0fa9d95a75c5ca943549bbc98a548724cb6f54667d960054",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/666107920.jpg?k=ada5e7e09add68eae9f72687e2c4960630eca8ffa0bdf6adf58b50fe397fbe9c",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/666107922.jpg?k=6dc0ab43f3e3ade558dd021efecf0fa87cdb857d93840dfa563b2d2f194a7dd1",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/666107924.jpg?k=913008f93c27421c0a2ce1aa11f9e9fe1919d076ba124cc41d259282afd3cbea",
    ],
    tag1: "Maldives 🇲🇻",
    tag2: "Three Private Coral Islands & Overwater Villas",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.9",
    country: "Maldives",
    description: "Spanning three pristine private islands in the South Malé Atoll reached by 40-minute luxury yacht transfer. Every beach, reef, and overwater villa boasts its own infinity pool and ocean hammock. Features treetop bamboo pod dining at Terra.",
    rating: 9.9,
  },
  {
    id: "hotel-maldives-sonevajani",
    name: "Soneva Jani, Maldives",
    subtitle: "Medhufaru Island, Noonu Atoll, Maldives",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1280x900/894888848.jpg?k=7fd79002bfe2c71664576c280d0f484007d7b1078f7a758215f3c7c276316ba3",
    images: [
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/816907995.jpg?k=b4340d74a738d0cefd1c3109446a6b15f1e6c40fa3429fab26bc6364ae715799",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/816891637.jpg?k=e6248d9af015da46d44cbbb0a0865d9b18c248547c78e673f44cc57be4c58d87",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/935161644.jpg?k=45f026d2f3ffbccab2d6ba4d4899aebd26ab83c4b114403d5e29fba92c6f0988",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/816896138.jpg?k=3ec8b33c08fa528791efab6e245b47fcf7bdba6ded3867ef047684610de96483",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/911346459.jpg?k=1a6011334df0b66f21a170224f5f7466be5512f73ab5030ff24c9726a25b9a00",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/935158885.jpg?k=c2adb35b98074fd9abaf8d5464910f7db1e437d004ccecc5310d2c6cd3690582",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/935161666.jpg?k=9bd340d9f138fdab3414f952d777ed7e256b3654de902fcf185bfd076f4b9db8",
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/935158313.jpg?k=7c480f680c70bfe038c9dac3aec17bff91f05d7615fe7902a23e96749e953775",
    ],
    tag1: "Maldives 🇲🇻",
    tag2: "Water Retreats with Slides & Retractable Roofs",
    price: "",
    pricePer: "1 night, 1 room",
    badge: "Exceptional 9.9",
    country: "Maldives",
    description: "Iconic overwater reserve located in a 5.6-kilometer private lagoon in Noonu Atoll. Famous for its master bedrooms with retractable roofs for stargazing, curved water slides leading directly into the ocean lagoon, and silent Cinema Paradiso.",
    rating: 9.9,
  },
];

/**
 * High-resolution fallback items for Jets, Flights, Yachts, Limousines with reliable Unsplash URLs
 */
const JETS_ITEMS: CatalogItem[] = [
  {
    id: 'jet-1',
    name: 'Bombardier Global 7500',
    subtitle: 'Ultra Long Range • 19 Passenger Executive Suite',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85',
      'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=85',
      'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&q=85',
      'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=1200&q=85',
    ],
    tag1: '7,700 nm Range',
    tag2: '19 VIP Seats',
    price: '$7,800',
    pricePer: 'per flight hour',
    badge: 'Flagship Jet',
    description: 'The world’s largest and longest-range purpose-built luxury business jet. Four true living spaces including a permanent private master bedroom, en-suite stand-up shower, and full gourmet kitchen.',
    rating: 4.99,
  },
  {
    id: 'jet-2',
    name: 'Gulfstream G650ER',
    subtitle: 'Non-stop Transatlantic & Transpacific Flight',
    image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=85',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85',
      'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&q=85',
      'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=1200&q=85',
    ],
    tag1: 'Mach 0.925',
    tag2: '16 VIP Seats',
    price: '$6,900',
    pricePer: 'per flight hour',
    badge: 'Ultra Long Range',
    description: 'Iconic ultra-long-range luxury jet capable of flying non-stop from Cairo or Dubai to London, New York, or Tokyo. Handcrafted leather club seats and private master stateroom.',
    rating: 4.98,
  },
  {
    id: 'jet-3',
    name: 'Dassault Falcon 8X',
    subtitle: 'Tri-Jet Performance & Short Runway Access',
    image: 'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=1200&q=85',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85',
      'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=85',
      'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&q=85',
    ],
    tag1: 'Tri-Jet Safety',
    tag2: '14 VIP Seats',
    price: '$5,800',
    pricePer: 'per flight hour',
    badge: 'Tri-Jet Speed',
    description: 'Tri-jet performance and unparalleled peace of mind over oceans. Special steep-approach certification for landing directly at Aspen, London City, and St. Moritz.',
    rating: 4.97,
  },
];

const YACHTS_ITEMS: CatalogItem[] = [
  {
    id: 'yacht-1',
    name: 'Majesty 120 Superyacht',
    subtitle: 'Dubai Marina & Arabian Gulf • 5 Staterooms',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1000&q=80',
    tag1: 'Dubai Marina',
    tag2: 'Private Chef & Crew',
    price: '$950',
    pricePer: 'per hour',
    badge: 'Featured',
  },
  {
    id: 'yacht-2',
    name: 'Benetti Oasis 40M',
    subtitle: 'Red Sea & French Riviera Explorer',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1000&q=80',
    tag1: 'Beach Club Deck',
    tag2: 'Infinity Pool',
    price: '$4,800',
    pricePer: 'per day',
  },
];

const LIMOS_ITEMS: CatalogItem[] = [
  {
    id: 'limo-amg',
    name: 'Mercedes-AMG GT 63 S 4-Door',
    subtitle: 'Handcrafted 4.0L Bi-Turbo V8 • 630 HP • 4 Seats',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200&q=85',
    images: [
      'https://images.unsplash.com/photo-1547038577-da80abbc4f19?w=1200&q=85',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=1200&q=85',
      'https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=1200&q=85',
    ],
    tag1: 'Supercar Sedan',
    tag2: 'VIP Chauffeur',
    price: '$450',
    pricePer: 'per day',
    badge: 'AMG Performance',
    description: 'Handcrafted 4.0L V8 Biturbo powerhouse delivering 630 hp with four-door executive luxury in a metallic selenite finish. Equipped with AMG Performance seats, carbon fiber aerodynamic trim, and dedicated VIP performance-trained chauffeur.',
    rating: 5.0,
  },
  {
    id: 'limo-1',
    name: 'Mercedes-Maybach S 680',
    subtitle: 'First-Class Executive Rear Lounge • V12 Engine',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1622353219448-46a482b6c165?w=1000&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1000&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&q=80',
    ],
    tag1: 'First Class Sedan',
    tag2: 'Champagne Flutes',
    price: '$380',
    pricePer: 'per day',
    badge: 'Royal Class',
    description: 'The pinnacle of chauffeured luxury featuring twin-turbo V12 power, reclining rear first-class executive lounge seats, silver champagne flutes, and discreet security-trained driver.',
    rating: 4.99,
  },
  {
    id: 'limo-2',
    name: 'Rolls-Royce Phantom VIII',
    subtitle: 'Bespoke Starlight Headliner • Chauffeur Driven',
    image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=1000&q=80',
    images: [
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1000&q=80',
      'https://images.unsplash.com/photo-1541348263662-e0c86437da7b?w=1000&q=80',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1000&q=80',
    ],
    tag1: 'Prestige Chauffeur',
    tag2: 'Ultimate Prestige',
    price: '$650',
    pricePer: 'per day',
    badge: 'Prestige Chauffeur',
    description: 'The definitive luxury motor car. Whisper-quiet acoustic cabin, bespoke starlight fiber-optic headliner, refrigerated champagne bar, and discreet private chauffeur.',
    rating: 5.0,
  },
];

export async function fetchHotels(): Promise<CatalogApiResponse> {
  const hotelMap = new Map<string, CatalogItem>();
  // 1. Pre-populate with all 20 curated 5-star luxury hotels
  for (const h of CURATED_LUXURY_HOTELS) {
    hotelMap.set(h.id, h);
  }

  // 2. Override with any live edits or additions from Firestore
  try {
    const snap = await firestore().collection('hotels').get();
    if (!snap.empty) {
      snap.forEach(doc => {
        const d = doc.data();
        if (d.status !== 'draft') {
          const imagesList: string[] = Array.isArray(d.images)
            ? d.images.map((img: any) => (typeof img === 'string' ? img : img?.url || '')).filter(Boolean)
            : [];
          const existing = hotelMap.get(doc.id);
          const primaryImage =
            imagesList[0] ||
            d.image ||
            existing?.image ||
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=80';

          hotelMap.set(doc.id, {
            id: doc.id,
            name: d.propertyName || d.name || existing?.name || 'Luxury Hotel',
            subtitle: d.cityDestination || d.subtitle || existing?.subtitle || '',
            image: primaryImage,
            images: imagesList.length > 0 ? imagesList : (existing?.images || [primaryImage]),
            tag1: d.suiteType || d.tag1 || existing?.tag1 || (d.cityDestination ? d.cityDestination.split(',')[0].trim() : 'Vanir Luxury'),
            tag2: d.viewType ? `${d.viewType.charAt(0).toUpperCase() + d.viewType.slice(1)} View` : (d.tag2 || existing?.tag2 || 'VIP Suite'),
            price: typeof d.nightlyRate === 'number' ? `$${d.nightlyRate}` : (d.price || existing?.price || '$750'),
            pricePer: d.pricePer || existing?.pricePer || 'per night',
            badge: d.badge || (d.butlerService ? 'Butler Service' : (existing?.badge || 'Curated')),
            country: d.country || existing?.country || (d.cityDestination && d.cityDestination.includes(',') ? d.cityDestination.split(',')[1].trim() : d.cityDestination || ''),
            description: d.description || existing?.description || '',
            rating: typeof d.rating === 'number' ? d.rating : (existing?.rating || 4.96),
          });
        }
      });
    }
  } catch {
    // Fallback to curated luxury hotels catalog
  }

  const allHotels = Array.from(hotelMap.values());
  return {
    status: 'success',
    data: allHotels,
    meta: {
      endpoint: '/api/v1/catalog/hotels',
      fetchedAt: new Date().toISOString(),
      source: 'firestore_and_curated_merged',
      count: allHotels.length,
    },
  };
}

export async function fetchJets(): Promise<CatalogApiResponse> {
  try {
    const snap = await firestore().collection('jets').get();
    if (!snap.empty) {
      const items: CatalogItem[] = [];
      snap.forEach(doc => {
        const d = doc.data();
        if (d.status !== 'draft') {
          const imagesList: string[] = Array.isArray(d.images)
            ? d.images.map((img: any) => (typeof img === 'string' ? img : img?.url || '')).filter(Boolean)
            : [];
          const primaryImage = imagesList[0] || d.image || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1000&q=80';
          const rangeStr = d.flightRange ? `${d.flightRange.toLocaleString()} nm Range` : d.rangeKm ? `${d.rangeKm.toLocaleString()} km Range` : 'Intercontinental';
          const paxStr = d.guestCapacity ? `${d.guestCapacity} VIP Seats` : d.capacitySeats ? `${d.capacitySeats} VIP Seats` : '19 VIP Seats';
          items.push({
            id: doc.id,
            name: d.name || d.model || 'Private Jet',
            subtitle: `${paxStr} • ${rangeStr}`,
            image: primaryImage,
            images: imagesList.length > 0 ? imagesList : [primaryImage],
            tag1: rangeStr,
            tag2: paxStr,
            price: typeof d.hourlyRate === 'number' ? `$${d.hourlyRate.toLocaleString()}` : '$18,500',
            pricePer: 'per flight hour',
            badge: 'VIP Flagship',
            description: d.description || '',
            rating: typeof d.rating === 'number' ? d.rating : 4.99,
          });
        }
      });
      if (items.length > 0) {
        const mergedJets = [...items];
        JETS_ITEMS.forEach(mock => {
          if (!mergedJets.some(j => j.id === mock.id || j.name.toLowerCase() === mock.name.toLowerCase())) {
            mergedJets.push(mock);
          }
        });
        return {
          status: 'success',
          data: mergedJets,
          meta: { endpoint: '/api/v1/catalog/jets', fetchedAt: new Date().toISOString(), source: 'firestore_live', count: mergedJets.length },
        };
      }
    }
  } catch {
    // Fallback to mock jets
  }

  return {
    status: 'success',
    data: JETS_ITEMS,
    meta: {
      endpoint: '/api/v1/catalog/jets',
      fetchedAt: new Date().toISOString(),
      source: 'mock',
      count: JETS_ITEMS.length,
    },
  };
}

export async function fetchFlights(): Promise<CatalogApiResponse> {
  return fetchJets();
}

export async function fetchYachts(): Promise<CatalogApiResponse> {
  try {
    const snap = await firestore().collection('yachts').get();
    if (!snap.empty) {
      const items: CatalogItem[] = [];
      snap.forEach(doc => {
        const d = doc.data();
        if (d.status !== 'draft') {
          const imagesList: string[] = Array.isArray(d.images)
            ? d.images.map((img: any) => (typeof img === 'string' ? img : img?.url || '')).filter(Boolean)
            : [];
          const primaryImage =
            imagesList[0] ||
            d.image ||
            'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?w=1200&q=85';

          const lengthDisplay = d.lengthFt ? `${d.lengthFt}ft Superyacht` : d.lengthMeters ? `${d.lengthMeters}m Mega Yacht` : (d.tag1 || '50m Superyacht');
          const crewDisplay = d.crewSize ? `${d.crewSize} Dedicated Crew` : d.crewCount ? `${d.crewCount} Dedicated Crew` : (d.tag2 || 'Full Crew & Chef');

          items.push({
            id: doc.id,
            name: d.name || d.vesselName || 'Luxury Superyacht',
            subtitle: d.marinaLocation || d.subtitle || `${d.guestCapacity || 12} Guests • ${crewDisplay}`,
            image: primaryImage,
            images: imagesList.length > 0 ? imagesList : [primaryImage],
            tag1: lengthDisplay,
            tag2: crewDisplay,
            price: typeof d.dailyRate === 'number'
              ? `$${d.dailyRate.toLocaleString()}`
              : typeof d.dailyCharterRate === 'number'
              ? `$${d.dailyCharterRate.toLocaleString()}`
              : (d.price || '$15,000'),
            pricePer: 'per day',
            badge: d.badge || 'Superyacht VIP',
            description: d.description || '',
            rating: typeof d.rating === 'number' ? d.rating : 4.98,
          });
        }
      });
      if (items.length > 0) {
        return {
          status: 'success',
          data: items,
          meta: { endpoint: '/api/v1/catalog/yachts', fetchedAt: new Date().toISOString(), source: 'firestore_live', count: items.length },
        };
      }
    }
  } catch {
    // Fallback to mock yachts
  }

  return {
    status: 'success',
    data: YACHTS_ITEMS,
    meta: {
      endpoint: '/api/v1/catalog/yachts',
      fetchedAt: new Date().toISOString(),
      source: 'mock',
      count: YACHTS_ITEMS.length,
    },
  };
}

export async function fetchLimousines(): Promise<CatalogApiResponse> {
  try {
    const snap = await firestore().collection('transfers').get();
    if (!snap.empty) {
      const items: CatalogItem[] = [];
      snap.forEach(doc => {
        const d = doc.data();
        if (d.status !== 'draft') {
          const imagesList: string[] = Array.isArray(d.images)
            ? d.images.map((img: any) => (typeof img === 'string' ? img : img?.url || '')).filter(Boolean)
            : [];
          const primaryImage =
            imagesList[0] ||
            d.image ||
            'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85';

          const categoryDisplay =
            d.category === 'sedan'
              ? 'Executive Sedan'
              : d.category === 'suv'
              ? 'Ultra Luxury SUV'
              : d.category === 'van'
              ? 'VIP Executive Van'
              : (d.category || d.vehicleType || 'VIP Chauffeur');

          items.push({
            id: doc.id,
            name: d.vehicleMakeModel || d.vehicleModel || d.name || 'Rolls-Royce Phantom VIII',
            subtitle: d.subtitle || `${categoryDisplay} • Max ${d.passengerCapacity || 4} Passengers • ${d.luggageCapacity || 3} Bags`,
            image: primaryImage,
            images: imagesList.length > 0 ? imagesList : [primaryImage],
            tag1: categoryDisplay,
            tag2: d.englishChauffeur ? 'Uniformed Chauffeur' : (d.tag2 || 'Professional Driver'),
            price: typeof d.airportTransferRate === 'number'
              ? `$${d.airportTransferRate.toLocaleString()}`
              : typeof d.hourlyRate === 'number'
              ? `$${d.hourlyRate.toLocaleString()}/hr`
              : (d.price || '$350'),
            pricePer: 'per transfer',
            badge: d.armored ? 'Armored VIP' : (d.badge || 'VIP Chauffeur'),
            description: d.description || '',
            rating: typeof d.rating === 'number' ? d.rating : 4.97,
          });
        }
      });
      if (items.length > 0) {
        return {
          status: 'success',
          data: items,
          meta: { endpoint: '/api/v1/catalog/limousines', fetchedAt: new Date().toISOString(), source: 'firestore_live', count: items.length },
        };
      }
    }
  } catch {
    // Fallback to mock limos
  }

  return {
    status: 'success',
    data: LIMOS_ITEMS,
    meta: {
      endpoint: '/api/v1/catalog/limousines',
      fetchedAt: new Date().toISOString(),
      source: 'mock',
      count: LIMOS_ITEMS.length,
    },
  };
}


export async function fetchEsims(): Promise<CatalogApiResponse> {
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY_MS));
  return {
    status: 'success',
    data: [
      {
        id: 'esim-global-1',
        name: 'VANIR Global Unlimited eSIM',
        subtitle: '180+ Countries • High-Speed 5G Roaming',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80',
        tag1: 'Instant QR Activation',
        tag2: 'Unlimited Data',
        price: '$45',
        pricePer: '30 Days',
        badge: 'Top Seller',
      },
      {
        id: 'esim-gcc-1',
        name: 'GCC & Middle East VIP Pass',
        subtitle: 'UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman',
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
        tag1: '5G Low-Latency',
        tag2: '30 GB Data',
        price: '$35',
        pricePer: '15 Days',
      },
    ],
    meta: {
      endpoint: '/api/v1/catalog/esims',
      fetchedAt: new Date().toISOString(),
      source: 'mock',
      count: 2,
    },
  };
}

export async function fetchVisas(): Promise<CatalogApiResponse> {
  return {
    status: 'success',
    data: [],
    meta: {
      endpoint: '/api/v1/catalog/visas',
      fetchedAt: new Date().toISOString(),
      source: 'mock',
      count: 0,
    },
  };
}

export async function fetchAirports(): Promise<CatalogApiResponse> {
  return {
    status: 'success',
    data: [],
    meta: {
      endpoint: '/api/v1/catalog/airports',
      fetchedAt: new Date().toISOString(),
      source: 'mock',
      count: 0,
    },
  };
}
