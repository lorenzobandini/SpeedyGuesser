import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const words = [
    // English words
    { word: "house", language: "EN", difficulty: 1 },
    { word: "river", language: "EN", difficulty: 1 },
    { word: "mountain", language: "EN", difficulty: 2 },
    { word: "whisper", language: "EN", difficulty: 2 },
    { word: "galaxy", language: "EN", difficulty: 3 },
    { word: "bicycle", language: "EN", difficulty: 1 },
    { word: "sunrise", language: "EN", difficulty: 2 },
    { word: "lightning", language: "EN", difficulty: 2 },
    { word: "harmony", language: "EN", difficulty: 3 },
    { word: "compass", language: "EN", difficulty: 2 },
    { word: "diamond", language: "EN", difficulty: 1 },
    { word: "journey", language: "EN", difficulty: 2 },
    { word: "ocean", language: "EN", difficulty: 1 },
    { word: "freedom", language: "EN", difficulty: 2 },
    { word: "quicksand", language: "EN", difficulty: 3 },
    { word: "eclipse", language: "EN", difficulty: 3 },
    { word: "fountain", language: "EN", difficulty: 2 },
    { word: "rocket", language: "EN", difficulty: 1 },
    { word: "synergy", language: "EN", difficulty: 3 },
    { word: "illusion", language: "EN", difficulty: 3 },
    { word: "backpack", language: "EN", difficulty: 2 },
    { word: "justice", language: "EN", difficulty: 2 },
    { word: "orchid", language: "EN", difficulty: 2 },
    { word: "aviation", language: "EN", difficulty: 3 },
    { word: "wisdom", language: "EN", difficulty: 2 },
    { word: "courage", language: "EN", difficulty: 2 },
    { word: "hurricane", language: "EN", difficulty: 4 },
    { word: "prosperity", language: "EN", difficulty: 3 },
    { word: "horizon", language: "EN", difficulty: 2 },
    { word: "astronomy", language: "EN", difficulty: 4 },
    { word: "landscape", language: "EN", difficulty: 2 },
    { word: "obstacle", language: "EN", difficulty: 3 },
    { word: "comet", language: "EN", difficulty: 3 },
    { word: "utopia", language: "EN", difficulty: 3 },
    { word: "valor", language: "EN", difficulty: 2 },
    { word: "evolution", language: "EN", difficulty: 4 },
    { word: "mechanism", language: "EN", difficulty: 4 },
    { word: "infinity", language: "EN", difficulty: 3 },
    { word: "algorithm", language: "EN", difficulty: 5 },
    { word: "paradigm", language: "EN", difficulty: 5 },
    { word: "phenomenon", language: "EN", difficulty: 5 },
    { word: "molecule", language: "EN", difficulty: 3 },
    { word: "galaxy", language: "EN", difficulty: 3 },
    { word: "tradition", language: "EN", difficulty: 2 },
    { word: "cosmos", language: "EN", difficulty: 3 },
    { word: "language", language: "EN", difficulty: 1 },
    { word: "intensity", language: "EN", difficulty: 3 },
    { word: "oasis", language: "EN", difficulty: 2 },
    { word: "victory", language: "EN", difficulty: 2 },
    { word: "labyrinth", language: "EN", difficulty: 4 },
  
    // Italian words
    { word: "casa", language: "IT", difficulty: 1 },
    { word: "fiume", language: "IT", difficulty: 1 },
    { word: "montagna", language: "IT", difficulty: 2 },
    { word: "sussurro", language: "IT", difficulty: 2 },
    { word: "galassia", language: "IT", difficulty: 3 },
    { word: "bicicletta", language: "IT", difficulty: 1 },
    { word: "alba", language: "IT", difficulty: 1 },
    { word: "fulmine", language: "IT", difficulty: 2 },
    { word: "armonia", language: "IT", difficulty: 2 },
    { word: "bussola", language: "IT", difficulty: 2 },
    { word: "diamante", language: "IT", difficulty: 1 },
    { word: "viaggio", language: "IT", difficulty: 1 },
    { word: "oceano", language: "IT", difficulty: 1 },
    { word: "libertà", language: "IT", difficulty: 2 },
    { word: "sabbie mobili", language: "IT", difficulty: 3 },
    { word: "eclissi", language: "IT", difficulty: 3 },
    { word: "fontana", language: "IT", difficulty: 1 },
    { word: "razzo", language: "IT", difficulty: 2 },
    { word: "sinergia", language: "IT", difficulty: 3 },
    { word: "illusione", language: "IT", difficulty: 3 },
    { word: "zaino", language: "IT", difficulty: 1 },
    { word: "giustizia", language: "IT", difficulty: 2 },
    { word: "orchidea", language: "IT", difficulty: 3 },
    { word: "avventura", language: "IT", difficulty: 2 },
    { word: "saggezza", language: "IT", difficulty: 2 },
    { word: "coraggio", language: "IT", difficulty: 1 },
    { word: "uragano", language: "IT", difficulty: 4 },
    { word: "prosperità", language: "IT", difficulty: 3 },
    { word: "orizzonte", language: "IT", difficulty: 2 },
    { word: "astronomia", language: "IT", difficulty: 4 },
    { word: "paesaggio", language: "IT", difficulty: 2 },
    { word: "ostacolo", language: "IT", difficulty: 2 },
    { word: "cometa", language: "IT", difficulty: 3 },
    { word: "utopia", language: "IT", difficulty: 3 },
    { word: "valore", language: "IT", difficulty: 2 },
    { word: "evoluzione", language: "IT", difficulty: 4 },
    { word: "meccanismo", language: "IT", difficulty: 4 },
    { word: "infinito", language: "IT", difficulty: 3 },
    { word: "algoritmo", language: "IT", difficulty: 5 },
    { word: "paradigma", language: "IT", difficulty: 5 },
    { word: "fenomeno", language: "IT", difficulty: 3 },
    { word: "molecola", language: "IT", difficulty: 3 },
    { word: "cosmo", language: "IT", difficulty: 2 },
    { word: "lingua", language: "IT", difficulty: 1 },
    { word: "intensità", language: "IT", difficulty: 3 },
    { word: "oasi", language: "IT", difficulty: 2 },
    { word: "vittoria", language: "IT", difficulty: 1 },
    { word: "labirinto", language: "IT", difficulty: 4 }
  ];
  
  for (const word of words) {
    await prisma.word.create({
      data: word,
    });
  }

  console.log("Database popolato con successo!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
