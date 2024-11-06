import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const words = [
    { word: "apple", language: "EN", difficulty: 1 },
    { word: "banana", language: "EN", difficulty: 1 },
    { word: "cherry", language: "EN", difficulty: 2 },
    { word: "date", language: "EN", difficulty: 2 },
    { word: "elderberry", language: "EN", difficulty: 3 },
    { word: "fig", language: "EN", difficulty: 2 },
    { word: "grape", language: "EN", difficulty: 1 },
    { word: "honeydew", language: "EN", difficulty: 1 },
    { word: "kiwi", language: "EN", difficulty: 1 },
    { word: "lemon", language: "EN", difficulty: 1 },
    { word: "lime", language: "EN", difficulty: 1 },
    { word: "mango", language: "EN", difficulty: 2 },
    { word: "nectarine", language: "EN", difficulty: 2 },
    { word: "orange", language: "EN", difficulty: 1 },
    { word: "papaya", language: "EN", difficulty: 2 },
    { word: "peach", language: "EN", difficulty: 1 },
    { word: "pear", language: "EN", difficulty: 1 },
    { word: "pineapple", language: "EN", difficulty: 3 },
    { word: "plum", language: "EN", difficulty: 2 },
    { word: "pomegranate", language: "EN", difficulty: 3 },
    { word: "raspberry", language: "EN", difficulty: 2 },
    { word: "strawberry", language: "EN", difficulty: 1 },
    { word: "watermelon", language: "EN", difficulty: 1 },
    { word: "blueberry", language: "EN", difficulty: 2 },
    { word: "mela", language: "IT", difficulty: 1 },
    { word: "banana", language: "IT", difficulty: 1 },
    { word: "ciliegia", language: "IT", difficulty: 2 },
    { word: "dattero", language: "IT", difficulty: 2 },
    { word: "sambuco", language: "IT", difficulty: 3 },
    { word: "fragola", language: "IT", difficulty: 1 },
    { word: "uva", language: "IT", difficulty: 1 },
    { word: "lampone", language: "IT", difficulty: 2 },
    { word: "mirtillo", language: "IT", difficulty: 2 },
    { word: "pesca", language: "IT", difficulty: 1 },
    { word: "pera", language: "IT", difficulty: 1 },
    { word: "melograno", language: "IT", difficulty: 3 },
    { word: "albicocca", language: "IT", difficulty: 2 },
    { word: "anguria", language: "IT", difficulty: 1 },
    { word: "cocomero", language: "IT", difficulty: 1 },
    { word: "fico", language: "IT", difficulty: 2 },
    { word: "kiwi", language: "IT", difficulty: 1 },
    { word: "limone", language: "IT", difficulty: 1 },
    { word: "mandarino", language: "IT", difficulty: 2 },
    { word: "mango", language: "IT", difficulty: 2 },
    { word: "melone", language: "IT", difficulty: 1 },
    { word: "nespola", language: "IT", difficulty: 2 },
    { word: "pompelmo", language: "IT", difficulty: 2 },
    { word: "susina", language: "IT", difficulty: 1 }
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
