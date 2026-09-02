import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});
const prisma = new PrismaClient({ adapter });

interface WordData {
  word: string;
  difficulty: number;
}

interface WordWithLanguage extends WordData {
  language: string;
}

function loadWordsFromFile(
  filename: string,
  language: string,
): WordWithLanguage[] {
  try {
    const filePath = join(__dirname, 'data', filename);
    const fileContent = readFileSync(filePath, 'utf-8');
    const words = JSON.parse(fileContent) as WordData[];

    return words.map(word => ({
      ...word,
      language,
    }));
  } catch (error) {
    console.error(`Errore nel caricamento del file ${filename}:`, error);
    return [];
  }
}

async function clearDatabase() {
  console.log('🗑️  Pulizia database in corso...');
  await prisma.word.deleteMany();
  console.log('✅ Database pulito');
}

async function seedWords() {
  const languageFiles = [
    { filename: 'words-en.json', language: 'EN' },
    { filename: 'words-it.json', language: 'IT' },
  ];

  let totalWords = 0;

  for (const { filename, language } of languageFiles) {
    console.log(`📚 Caricamento parole ${language}...`);
    const words = loadWordsFromFile(filename, language);

    if (words.length > 0) {
      // Batch insert per migliori performance
      await prisma.word.createMany({
        data: words,
      });

      console.log(`✅ Aggiunte ${words.length} parole in ${language}`);
      totalWords += words.length;
    }
  }

  return totalWords;
}

async function main() {
  console.log('🚀 Inizializzazione database...');

  try {
    // Opzionale: pulire il database prima del seed
    await clearDatabase();

    // Seed delle parole
    const totalWords = await seedWords();

    console.log(
      `🎉 Database popolato con successo! Totale parole: ${totalWords}`,
    );
  } catch (error) {
    console.error('❌ Errore durante il seed:', error);
    throw error;
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
