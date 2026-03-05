-- SQL Schema for Fundación JUAN DE DIOS Inventory Management
-- Actualizado con políticas de permisos totales y triggers de reversión de stock

-- 1. Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

-- 2. Subcategories
CREATE TABLE IF NOT EXISTS subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE(category_id, name)
);

-- 3. Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subcategory_id UUID REFERENCES subcategories(id),
    name TEXT NOT NULL,
    description TEXT,
    current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0)
);

-- 4. Donors
CREATE TABLE IF NOT EXISTS donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact TEXT
);

-- 5. Beneficiaries
CREATE TABLE IF NOT EXISTS beneficiaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    id_number TEXT UNIQUE NOT NULL, -- Cédula/ID
    contact TEXT
);

-- 6. Donations In (Entradas)
CREATE TABLE IF NOT EXISTS donations_in (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    donor_id UUID REFERENCES donors(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Donations Out (Salidas/Entregas)
CREATE TABLE IF NOT EXISTS donations_out (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    beneficiary_id UUID REFERENCES beneficiaries(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    delivered_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers to update stock automatically (INSERT, UPDATE, DELETE)

-- Function for Inward Donations
CREATE OR REPLACE FUNCTION handle_stock_donation_in()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE products SET current_stock = current_stock + NEW.quantity WHERE id = NEW.product_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE products SET current_stock = current_stock - OLD.quantity + NEW.quantity WHERE id = NEW.product_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE products SET current_stock = current_stock - OLD.quantity WHERE id = OLD.product_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_stock_in ON donations_in;
CREATE TRIGGER tr_update_stock_in
AFTER INSERT OR UPDATE OR DELETE ON donations_in
FOR EACH ROW
EXECUTE FUNCTION handle_stock_donation_in();

-- Function for Outward Donations
CREATE OR REPLACE FUNCTION handle_stock_donation_out()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE products SET current_stock = current_stock - NEW.quantity WHERE id = NEW.product_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE products SET current_stock = current_stock + OLD.quantity - NEW.quantity WHERE id = NEW.product_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE products SET current_stock = current_stock + OLD.quantity WHERE id = OLD.product_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_stock_out ON donations_out;
CREATE TRIGGER tr_update_stock_out
AFTER INSERT OR UPDATE OR DELETE ON donations_out
FOR EACH ROW
EXECUTE FUNCTION handle_stock_donation_out();

-- Row Level Security (RLS) Policies
-- Habilitar RLS y permitir todo para todas las tablas
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow All" ON %I', t);
        EXECUTE format('CREATE POLICY "Allow All" ON %I FOR ALL USING (true) WITH CHECK (true)', t);
    END LOOP;
END $$;
