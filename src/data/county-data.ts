// ===== ADAUGĂ AICI DETALII PENTRU FIECARE JUDEȚ =====
// Pentru fiecare județ, completează obiectul cu informații despre terenuri și proprietăți

export interface CountyProperty {
  name: string;
  location: string;
  area: string;
  price: string;
  description: string;
}

export interface CountyData {
  name: string;
  description: string;
  properties: CountyProperty[];
}

// ===== MODIFICĂ AICI - Adaugă detalii pentru fiecare județ =====
export const countyDetails: Record<string, CountyData> = {
  "Alba": {
    name: "Alba",
    description: "Județul Alba - zona central-vestică, cu Alba Iulia ca oraș principal",
    properties: [
      {
        name: "Teren construcții Alba Iulia",
        location: "Alba Iulia",
        area: "1000 mp",
        price: "50.000 EUR",
        description: "Teren intravilan, zona rezidențială, utilități complete"
      },
      {
        name: "Casă Sebeș",
        location: "Sebeș, Alba",
        area: "150 mp",
        price: "85.000 EUR",
        description: "Casă renovată, 3 camere, grădină 400 mp"
      },
    ]
  },
  
  "Arad": {
    name: "Arad",
    description: "Județul Arad - zona de vest a țării, aproape de graniță",
    properties: [
      {
        name: "Teren agricol Ineu",
        location: "Ineu, Arad",
        area: "5000 mp",
        price: "25.000 EUR",
        description: "Teren arabil, acces drum asfaltat, utilități în zonă"
      },
      {
        name: "Proprietatecentru Arad",
        location: "Centru, Arad",
        area: "300 mp",
        price: "120.000 EUR",
        description: "Casă renovată, 4 camere, curte amenajată"
      },
      {
        name: "Teren intravilan Lipova",
        location: "Lipova, Arad",
        area: "1200 mp",
        price: "35.000 EUR",
        description: "Ideal construcție, PUZ aprobat, toate utilitățile"
      },
    ]
  },

  // ===== ADAUGĂ RESTUL JUDEȚELOR AICI =====
  // Copiază structura de mai sus pentru fiecare județ
  // Lista completă județe: Alba, Arad, Argeș, Bacău, Bihor, Bistrița-Năsăud,
  // Botoșani, Brăila, Brașov, Buzău, Caraș-Severin, Călărași, Cluj, Constanța,
  // Covasna, Dâmbovița, Dolj, Galați, Giurgiu, Gorj, Harghita, Hunedoara,
  // Ialomița, Iași, Ilfov, Maramureș, Mehedinți, Mureș, Neamț, Olt, Prahova,
  // Sălaj, Satu Mare, Sibiu, Suceava, Teleorman, Timiș, Tulcea, Vâlcea, Vaslui,
  // Vrancea, București

  // Exemplu pentru alte județe:
  "București": {
    name: "București",
    description: "Capitala României - cel mai mare oraș și centru economic",
    properties: [
      {
        name: "Apartament Sector 1",
        location: "București, Sector 1",
        area: "80 mp",
        price: "150.000 EUR",
        description: "Apartament 3 camere, recent renovat, parcare inclusă"
      },
    ]
  },

  "Cluj": {
    name: "Cluj",
    description: "Județul Cluj - centru important al Transilvaniei",
    properties: [
      {
        name: "Teren Cluj-Napoca",
        location: "Cluj-Napoca",
        area: "800 mp",
        price: "120.000 EUR",
        description: "Teren intravilan, zonă rezidențială premium"
      },
    ]
  },

  "Timiș": {
    name: "Timiș",
    description: "Județul Timiș - vest, cu Timișoara ca reședință",
    properties: [
      {
        name: "Casă Timișoara",
        location: "Timișoara",
        area: "200 mp",
        price: "180.000 EUR",
        description: "Vilă modernă, 5 camere, finisaje premium"
      },
    ]
  },
};
