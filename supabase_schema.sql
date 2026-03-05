-- SQL Schema for Fundación JUAN DE DIOS Inventory Management

-- 1. Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Subcategories
CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, name)
);

-- 3. Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category_id UUID REFERENCES categories(id),
    subcategory_id UUID REFERENCES subcategories(id),
    sku TEXT UNIQUE,
    description TEXT,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    unit TEXT DEFAULT 'unidades',
    low_stock_threshold INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Donors
CREATE TABLE donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Beneficiaries
CREATE TABLE beneficiaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    id_number TEXT UNIQUE NOT NULL, -- Cédula/ID
    contact_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Donations In (Entradas)
CREATE TABLE donations_in (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES donors(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Donations Out (Salidas/Entregas)
CREATE TABLE donations_out (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beneficiary_id UUID REFERENCES beneficiaries(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    delivered_by TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers to update stock automatically

-- Function for Inward Donations
CREATE OR REPLACE FUNCTION update_stock_on_donation_in()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET stock = stock + NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_stock_in
AFTER INSERT ON donations_in
FOR EACH ROW
EXECUTE FUNCTION update_stock_on_donation_in();

-- Function for Outward Donations
CREATE OR REPLACE FUNCTION update_stock_on_donation_out()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if enough stock exists (Postgres CHECK constraint on products.stock also handles this)
    UPDATE products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_stock_out
AFTER INSERT ON donations_out
FOR EACH ROW
EXECUTE FUNCTION update_stock_on_donation_out();

-- Enable Row Level Security (RLS) - Optional but recommended
-- For this demo, we assume the user will handle auth or keep it simple.
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ... and so on for other tables.
