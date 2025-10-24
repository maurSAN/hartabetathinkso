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
    description: "Județul Alba - adaugă descriere generală aici",
    properties: [
      {
        name: "Teren exemplu 1",
        location: "Alba Iulia",
        area: "1000 mp",
        price: "50.000 EUR",
        description: "Descriere teren - modifică aici"
      },
      // Adaugă mai multe proprietăți aici
    ]
  },
  
  "Arad": {
    name: "Arad",
    description: "Județul Arad - adaugă descriere generală aici",
    properties: [
      {
        name: "Proprietate exemplu",
        location: "Arad",
        area: "500 mp",
        price: "30.000 EUR",
        description: "Descriere proprietate"
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
    description: "Capitala României - adaugă descriere",
    properties: []
  },
};
