// Approximate centres of Portuguese municipalities, used to place shelters on the
// directory map without geocoding addresses. Shelters only declare a locality, so a
// pin marks the town, never the exact address.
const coordinates: Record<string, [number, number]> = {
  abrantes: [39.4636, -8.1977],
  albufeira: [37.0891, -8.2479],
  almada: [38.679, -9.1569],
  amadora: [38.7538, -9.2308],
  aveiro: [40.6405, -8.6538],
  barcelos: [41.5388, -8.6151],
  barreiro: [38.6631, -9.0724],
  beja: [38.0151, -7.8632],
  braga: [41.5454, -8.4265],
  braganca: [41.8061, -6.7567],
  "caldas da rainha": [39.4036, -9.1386],
  cascais: [38.6979, -9.4215],
  "castelo branco": [39.8222, -7.4909],
  chaves: [41.7403, -7.4706],
  coimbra: [40.2033, -8.4103],
  covilha: [40.2806, -7.5044],
  elvas: [38.8811, -7.1631],
  evora: [38.5714, -7.9135],
  faro: [37.0194, -7.9322],
  "figueira da foz": [40.1508, -8.8618],
  funchal: [32.6669, -16.9241],
  gondomar: [41.1444, -8.5322],
  guarda: [40.5373, -7.2675],
  guimaraes: [41.4425, -8.2918],
  lagos: [37.1028, -8.6742],
  leiria: [39.7436, -8.8071],
  lisboa: [38.7223, -9.1393],
  loule: [37.1377, -8.0197],
  loures: [38.8309, -9.1685],
  maia: [41.2357, -8.6199],
  matosinhos: [41.1844, -8.6963],
  mafra: [38.9369, -9.3271],
  odivelas: [38.7927, -9.1838],
  oeiras: [38.691, -9.3108],
  olhao: [37.026, -7.8411],
  "ponta delgada": [37.7412, -25.6756],
  portalegre: [39.2967, -7.4285],
  portimao: [37.1366, -8.5377],
  porto: [41.1579, -8.6291],
  "povoa de varzim": [41.3804, -8.7609],
  santarem: [39.2362, -8.6859],
  seixal: [38.6406, -9.1015],
  setubal: [38.5244, -8.8882],
  sintra: [38.8029, -9.3817],
  tavira: [37.1271, -7.6486],
  "torres vedras": [39.0911, -9.2587],
  "viana do castelo": [41.6932, -8.8329],
  "vila do conde": [41.3517, -8.7479],
  "vila franca de xira": [38.9553, -8.9897],
  "vila nova de gaia": [41.1239, -8.6118],
  "vila real": [41.3006, -7.7441],
  viseu: [40.661, -7.9097],
};

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Coordinates for a shelter's locality, or null when the town is not known. */
export function localityCoordinates(locality: string): [number, number] | null {
  const key = normalize(locality);
  if (coordinates[key]) return coordinates[key];
  // Accept values such as "Lisboa, Alvalade" or "Porto (centro)".
  const match = Object.keys(coordinates).find((town) =>
    new RegExp(`(^|[^a-z])${town}([^a-z]|$)`).test(key),
  );
  return match ? coordinates[match] : null;
}
