import { config } from "dotenv"
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { categoriesTable } from "@/db/schema";

config({ path: path.resolve(process.cwd(), '.env.local') });

function initializeDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }

  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql);
}

const categoryNames = [
  "Cars and vehicles",
  "Comedy",
  "Education",
  "Gaming",
  "Entertainment",
  "Film and animation",
  "How-to and style",
  "Music",
  "News and politics",
  "People and bloggers",
  "Pets and animals",
  "Science and technology",
  "Sports",
  "Travel and events",
];

async function main() {
  console.log("Seeding categories...")

  try {
    const db = initializeDb();

    const values = categoryNames.map((name) => ({
      name,
      description: `Videos related to ${name.toLowerCase()}`
    }));

    await db.insert(categoriesTable).values(values);
    console.log("Categories seeded successfully!");

  } catch (error) {
    console.error("Error seeding categories", error);
    process.exit(1);
  }
}

main()