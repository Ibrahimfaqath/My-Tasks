ALTER TABLE "todos" ADD COLUMN IF NOT EXISTS "priority" varchar(20) NOT NULL DEFAULT 'none';
