import { pgTable, serial, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  date: timestamp('date').defaultNow(),
  userId: uuid('user_id').notNull(),
});

export const dietEntries = pgTable('diet_entries', {
  id: serial('id').primaryKey(),
  foodItem: text('food_item').notNull(),
  calories: integer('calories').notNull(),
  date: timestamp('date').defaultNow(),
  userId: uuid('user_id').notNull(),
});

export const routines = pgTable('routines', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  userId: uuid('user_id').notNull(),
});