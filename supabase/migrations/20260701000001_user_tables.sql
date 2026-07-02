-- watchlist_items: one row per card a user is watching.
CREATE TABLE public.watchlist_items (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           text          NOT NULL,
  legacy_catalog_id int,
  catalog_card_id   uuid          REFERENCES public.cards(id) ON DELETE SET NULL,
  player            text          NOT NULL,
  card_name         text          NOT NULL,
  set_name          text,
  year              int,
  card_number       text,
  parallel          text          NOT NULL DEFAULT 'Base',
  grading_service   text          CHECK (grading_service IS NULL OR grading_service IN ('PSA','BGS','SGC','CGC')),
  grade             numeric(3,1),
  sport             text          NOT NULL,
  alert_enabled     boolean       NOT NULL DEFAULT false,
  created_at        timestamptz   NOT NULL DEFAULT now(),
  UNIQUE (user_id, legacy_catalog_id)
);

CREATE INDEX idx_watchlist_items_user ON public.watchlist_items (user_id);

-- collection_items: one row per card a user owns. Duplicates allowed.
CREATE TABLE public.collection_items (
  id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          text          NOT NULL,
  catalog_card_id  uuid          REFERENCES public.cards(id) ON DELETE SET NULL,
  player           text          NOT NULL,
  card_name        text          NOT NULL,
  set_name         text,
  year             int,
  card_number      text,
  parallel         text          NOT NULL DEFAULT 'Base',
  grading_service  text          CHECK (grading_service IS NULL OR grading_service IN ('PSA','BGS','SGC','CGC')),
  grade            numeric(3,1),
  sport            text          NOT NULL,
  cert_number      text,
  price_paid       numeric(10,2),
  est_value        numeric(10,2),
  quantity         int           NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  already_sold     boolean       NOT NULL DEFAULT false,
  purchase_date    date,
  sale_price       numeric(10,2),
  sale_date        date,
  created_at       timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_collection_items_user ON public.collection_items (user_id);

-- Defense in depth: block the anon/public key entirely. Only the service-role
-- backend (which bypasses RLS) can read/write these tables.
ALTER TABLE public.watchlist_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
