ALTER TABLE categories ADD COLUMN icon VARCHAR(10);

-- Varsayilan ikonlar
UPDATE categories SET icon = '📦' WHERE icon IS NULL;
