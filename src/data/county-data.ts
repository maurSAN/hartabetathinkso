// ===== ADAUGĂ AICI DETALII PENTRU FIECARE JUDEȚ =====
// Pentru fiecare județ, completează obiectul cu informații despre orașe și proprietăți

export interface CountyProperty {
  name: string;
  location: string;
  area: string;
  price: string;
  description: string;
}

export interface City {
  name: string;
  coordinates: [number, number]; // [lng, lat]
  properties: CountyProperty[];
}

export interface CountyData {
  name: string;
  description: string;
  center: [number, number]; // [lng, lat] - pentru zoom pe județ
  cities: City[];
}

// ===== MODIFICĂ AICI - Adaugă detalii pentru fiecare județ =====
// IMPORTANT: Cheile trebuie să fie în MAJUSCULE (ex: "ARAD", "ALBA")
export const countyDetails: Record<string, CountyData> = {
  "ALBA": {
    name: "Alba",
    description: "Județul Alba - zona central-vestică, cu Alba Iulia ca oraș principal",
    center: [23.5719, 46.0666],
    cities: [
      {
        name: "Alba Iulia",
        coordinates: [23.5719, 46.0666],
        properties: [
          {
            name: "Teren construcții Alba Iulia",
            location: "Alba Iulia",
            area: "1000 mp",
            price: "50.000 EUR",
            description: "Teren intravilan, zona rezidențială, utilități complete"
          }
        ]
      },
      {
        name: "Sebeș",
        coordinates: [23.5694, 45.9603],
        properties: [
          {
            name: "Casă Sebeș",
            location: "Sebeș, Alba",
            area: "150 mp",
            price: "85.000 EUR",
            description: "Casă renovată, 3 camere, grădină 400 mp"
          }
        ]
      }
    ]
  },
  
  "ARAD": {
    name: "Arad",
    description: "Județul Arad - zona de vest a țării, aproape de graniță",
    center: [21.3190, 46.1866],
    cities: [
      {
        name: "Arad",
        coordinates: [21.3190, 46.1866],
        properties: [
          {
            name: "Proprietate centru Arad",
            location: "Centru, Arad",
            area: "300 mp",
            price: "120.000 EUR",
            description: "Casă renovată, 4 camere, curte amenajată"
          }
        ]
      },
      {
        name: "Ineu",
        coordinates: [21.8381, 46.4264],
        properties: [
          {
            name: "Teren agricol Ineu",
            location: "Ineu, Arad",
            area: "5000 mp",
            price: "25.000 EUR",
            description: "Teren arabil, acces drum asfaltat, utilități în zonă"
          }
        ]
      },
      {
        name: "Lipova",
        coordinates: [21.6944, 46.0899],
        properties: [
          {
            name: "Teren intravilan Lipova",
            location: "Lipova, Arad",
            area: "1200 mp",
            price: "35.000 EUR",
            description: "Ideal construcție, PUZ aprobat, toate utilitățile"
          }
        ]
      }
    ]
  },

  "BIHOR": {
    name: "Bihor",
    description: "Județul Bihor - vestul României, cu Oradea ca reședință",
    center: [21.9211, 47.0465],
    cities: [
      {
        name: "Oradea",
        coordinates: [21.9211, 47.0465],
        properties: [
          {
            name: "Teren Oradea",
            location: "Oradea, Bihor",
            area: "1500 mp",
            price: "75.000 EUR",
            description: "Teren intravilan, zonă centrală, ideal investiție"
          }
        ]
      }
    ]
  },

  "CLUJ": {
    name: "Cluj",
    description: "Județul Cluj - centru important al Transilvaniei",
    center: [23.6236, 46.7712],
    cities: [
      {
        name: "Cluj-Napoca",
        coordinates: [23.6236, 46.7712],
        properties: [
          {
            name: "Teren Cluj-Napoca",
            location: "Cluj-Napoca",
            area: "800 mp",
            price: "120.000 EUR",
            description: "Teren intravilan, zonă rezidențială premium"
          }
        ]
      }
    ]
  },

  "HUNEDOARA": {
    name: "Hunedoara",
    description: "Județul Hunedoara - zona central-vestică",
    center: [22.9027, 45.7489],
    cities: [
      {
        name: "Deva",
        coordinates: [22.9027, 45.7489],
        properties: [
          {
            name: "Casă Deva",
            location: "Deva, Hunedoara",
            area: "180 mp",
            price: "95.000 EUR",
            description: "Casă individuală, 4 camere, renovată complet"
          }
        ]
      }
    ]
  },

  "SALAJ": {
    name: "Sălaj",
    description: "Județul Sălaj - nord-vestul României",
    center: [23.0561, 47.1925],
    cities: [
      {
        name: "Zalău",
        coordinates: [23.0561, 47.1925],
        properties: [
          {
            name: "Teren Zalău",
            location: "Zalău, Sălaj",
            area: "1000 mp",
            price: "40.000 EUR",
            description: "Teren intravilan, utilități disponibile"
          }
        ]
      }
    ]
  },

  // ===== ADAUGĂ RESTUL JUDEȚELOR AICI =====
  // Lista completă județe în MAJUSCULE:
  // ALBA, ARAD, ARGEȘ, BACĂU, BIHOR, BISTRIȚA-NĂSĂUD, BOTOȘANI, BRĂILA, 
  // BRAȘOV, BUZĂU, CARAȘ-SEVERIN, CĂLĂRAȘI, CLUJ, CONSTANȚA, COVASNA,
  // DÂMBOVIȚA, DOLJ, GALAȚI, GIURGIU, GORJ, HARGHITA, HUNEDOARA, IALOMIȚA,
  // IAȘI, ILFOV, MARAMUREȘ, MEHEDINȚI, MUREȘ, NEAMȚ, OLT, PRAHOVA, SĂLAJ,
  // SATU MARE, SIBIU, SUCEAVA, TELEORMAN, TIMIȘ, TULCEA, VÂLCEA, VASLUI,
  // VRANCEA, BUCUREȘTI

  "BUCUREȘTI": {
    name: "București",
    description: "Capitala României - cel mai mare oraș și centru economic",
    center: [26.1025, 44.4268],
    cities: [
      {
        name: "Sector 1",
        coordinates: [26.0972, 44.4792],
        properties: [
          {
            name: "Apartament Sector 1",
            location: "București, Sector 1",
            area: "80 mp",
            price: "150.000 EUR",
            description: "Apartament 3 camere, recent renovat, parcare inclusă"
          }
        ]
      }
    ]
  },

  "TIMIȘ": {
    name: "Timiș",
    description: "Județul Timiș - vest, cu Timișoara ca reședință",
    center: [21.2272, 45.7489],
    cities: [
      {
        name: "Timișoara",
        coordinates: [21.2272, 45.7489],
        properties: [
          {
            name: "Casă Timișoara",
            location: "Timișoara",
            area: "200 mp",
            price: "180.000 EUR",
            description: "Vilă modernă, 5 camere, finisaje premium"
          }
        ]
      }
    ]
  },
};
