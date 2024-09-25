import { dietEntries } from '../drizzle/schema.js';
import { authenticateUser } from "./_apiUtils.js";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const user = await authenticateUser(req);

    const { foodItem, calories, date } = req.body;

    if (!foodItem || !calories) {
      return res.status(400).json({ error: 'Food item and calories are required' });
    }

    const sql = neon(process.env.NEON_DB_URL);
    const db = drizzle(sql);

    const result = await db.insert(dietEntries).values({
      foodItem,
      calories: parseInt(calories, 10),
      date: date ? new Date(date) : undefined,
      userId: user.id,
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error saving diet entry:', error);
    if (error.message.includes('Authorization') || error.message.includes('token')) {
      res.status(401).json({ error: 'Authentication failed' });
    } else {
      res.status(500).json({ error: 'Error saving diet entry' });
    }
  }
}