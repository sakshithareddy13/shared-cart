
-- =========================
-- PROFILES
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Shopper',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'Shopper'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- PRODUCTS (public catalog)
-- =========================
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  rating NUMERIC(3,2) NOT NULL DEFAULT 4.5,
  reviews INTEGER NOT NULL DEFAULT 0,
  discount INTEGER,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.products (id,name,price,category,rating,reviews,discount,image,description,features) VALUES
('aurora-lamp','Aurora Ceramic Lamp',129,'Home',4.8,214,15,'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop','A hand-thrown ceramic table lamp with a warm linen shade. Casts a soft, sunset glow that transforms any corner into a moment.','["Hand-glazed ceramic base","Linen drum shade","Dimmable LED bulb included","1.8m braided cord"]'::jsonb),
('field-tote','Field Canvas Tote',68,'Bags',4.7,512,NULL,'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop','Heavyweight 18oz canvas tote with saddle-stitched leather handles. Built for market runs, weekend hauls, and everything between.','["18oz waxed canvas","Vegetable-tanned leather handles","Interior zip pocket","Fits a 15\" laptop"]'::jsonb),
('mineral-mug','Mineral Stoneware Mug',24,'Kitchen',4.9,890,20,'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&auto=format&fit=crop','Speckled stoneware mug with a rounded, hand-friendly silhouette. Holds 12oz of your morning ritual.','["Reactive glaze — each is unique","12oz capacity","Microwave & dishwasher safe","Set of 2"]'::jsonb),
('trailrunner-sneaker','Trailrunner Low',158,'Footwear',4.6,341,NULL,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop','A city sneaker with trail DNA. Grippy Vibram outsole, breathable knit upper, and a cork footbed that molds to you.','["Vibram Megagrip outsole","Recycled knit upper","Cork + latex footbed","Weighs 260g"]'::jsonb),
('linen-throw','Washed Linen Throw',89,'Home',4.8,176,NULL,'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop','Stone-washed European linen throw, softer than the day you got it. Drapes beautifully over a sofa or the foot of a bed.','["100% European flax linen","Stone-washed for softness","130 x 180 cm","Oeko-Tex certified"]'::jsonb),
('pocket-notebook','Pocket Field Notebook',18,'Stationery',4.9,1204,NULL,'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&auto=format&fit=crop','Pack of three pocket notebooks with dot-grid pages and a stitched spine. For lists, sketches, and half-formed ideas.','["3-pack","Dot-grid, 64 pages each","Stitched spine, lies flat","Recycled kraft cover"]'::jsonb),
('brass-kettle','Brass Pour-Over Kettle',96,'Kitchen',4.7,298,10,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop','A gooseneck kettle in solid brass. Precision pour, patina that gets better with age.','["Solid brass body","Gooseneck for control","0.9L capacity","Stovetop compatible"]'::jsonb),
('wool-cardigan','Weekday Wool Cardigan',184,'Apparel',4.5,402,NULL,'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop','Chunky merino cardigan knit in Portugal. The one you''ll reach for from October through April.','["100% merino wool","Horn buttons","Ribbed cuffs & hem","Unisex fit"]'::jsonb);

-- =========================
-- SHARED CARTS
-- =========================
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Shared Cart',
  share_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.cart_members (
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  color TEXT NOT NULL DEFAULT 'oklch(0.65 0.18 40)',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (cart_id, user_id)
);

CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id),
  added_by UUID NOT NULL REFERENCES auth.users(id),
  qty INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cart_id, product_id, added_by)
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  order_code TEXT NOT NULL UNIQUE,
  subtotal INTEGER NOT NULL,
  tax INTEGER NOT NULL,
  total INTEGER NOT NULL,
  placed_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.order_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  items INTEGER NOT NULL DEFAULT 0
);

-- Membership helper (SECURITY DEFINER avoids policy recursion)
CREATE OR REPLACE FUNCTION public.is_cart_member(_cart UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cart_members WHERE cart_id = _cart AND user_id = _user
    UNION
    SELECT 1 FROM public.carts WHERE id = _cart AND owner_id = _user
  );
$$;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.cart_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT SELECT, INSERT ON public.order_splits TO authenticated;
GRANT ALL ON public.carts, public.cart_members, public.cart_items, public.orders, public.order_splits TO service_role;

-- RLS
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_splits ENABLE ROW LEVEL SECURITY;

-- carts
CREATE POLICY "carts: member or owner can view" ON public.carts FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_cart_member(id, auth.uid()));
CREATE POLICY "carts: owner creates" ON public.carts FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "carts: owner updates" ON public.carts FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "carts: owner deletes" ON public.carts FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- cart_members
CREATE POLICY "members: view if in same cart" ON public.cart_members FOR SELECT TO authenticated
  USING (public.is_cart_member(cart_id, auth.uid()));
CREATE POLICY "members: self-join" ON public.cart_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "members: self-leave or owner removes" ON public.cart_members FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_id AND c.owner_id = auth.uid()));

-- cart_items
CREATE POLICY "items: members view" ON public.cart_items FOR SELECT TO authenticated
  USING (public.is_cart_member(cart_id, auth.uid()));
CREATE POLICY "items: members add own" ON public.cart_items FOR INSERT TO authenticated
  WITH CHECK (added_by = auth.uid() AND public.is_cart_member(cart_id, auth.uid()));
CREATE POLICY "items: members update in cart" ON public.cart_items FOR UPDATE TO authenticated
  USING (public.is_cart_member(cart_id, auth.uid())) WITH CHECK (public.is_cart_member(cart_id, auth.uid()));
CREATE POLICY "items: members delete in cart" ON public.cart_items FOR DELETE TO authenticated
  USING (public.is_cart_member(cart_id, auth.uid()));

-- orders
CREATE POLICY "orders: members view" ON public.orders FOR SELECT TO authenticated
  USING (public.is_cart_member(cart_id, auth.uid()));
CREATE POLICY "orders: members insert" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (placed_by = auth.uid() AND public.is_cart_member(cart_id, auth.uid()));

-- order_splits
CREATE POLICY "splits: members view" ON public.order_splits FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND public.is_cart_member(o.cart_id, auth.uid())));
CREATE POLICY "splits: members insert" ON public.order_splits FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND public.is_cart_member(o.cart_id, auth.uid())));
