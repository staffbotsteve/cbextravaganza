-- Add temp_id bridge column
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS temp_id INTEGER UNIQUE;

-- Clear all CRM tables
TRUNCATE TABLE activities, documents, participation, contacts, organizations RESTART IDENTITY CASCADE;