-- cards: one row per specific graded card version
CREATE TABLE public.cards (
  id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name      text          NOT NULL,
  sport            text          NOT NULL CHECK (sport IN ('football', 'basketball', 'baseball')),
  year             int           NOT NULL,
  set_name         text          NOT NULL,
  card_number      text          NOT NULL,
  parallel         text          NOT NULL DEFAULT 'Base',
  grading_service  text          NOT NULL CHECK (grading_service IN ('PSA', 'BGS', 'SGC', 'CGC')),
  grade            numeric(3,1)  NOT NULL,
  ebay_search_query text         NOT NULL,
  is_active        boolean       NOT NULL DEFAULT true,
  created_at       timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_cards_is_active ON public.cards (is_active);

-- sold_listings: every eBay sold listing we've ever fetched
CREATE TABLE public.sold_listings (
  id             uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  ebay_item_id   text          UNIQUE NOT NULL,
  card_id        uuid          REFERENCES public.cards(id) ON DELETE SET NULL,
  title          text          NOT NULL,
  sale_price     numeric(10,2) NOT NULL,
  currency       text          NOT NULL DEFAULT 'USD',
  sale_date      timestamptz   NOT NULL,
  ebay_url       text          NOT NULL,
  source         text          NOT NULL CHECK (source IN ('catalog_refresh', 'search')),
  created_at     timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX idx_sold_listings_card_id   ON public.sold_listings (card_id);
CREATE INDEX idx_sold_listings_sale_date ON public.sold_listings (sale_date);
CREATE INDEX idx_sold_listings_ebay_item ON public.sold_listings (ebay_item_id);

-- price_snapshots: daily aggregate per catalog card
CREATE TABLE public.price_snapshots (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id       uuid          NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  snapshot_date date          NOT NULL,
  median_price  numeric(10,2) NOT NULL,
  avg_price     numeric(10,2) NOT NULL,
  low_price     numeric(10,2) NOT NULL,
  high_price    numeric(10,2) NOT NULL,
  sale_count    int           NOT NULL,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  UNIQUE (card_id, snapshot_date)
);

CREATE INDEX idx_price_snapshots_card_date ON public.price_snapshots (card_id, snapshot_date DESC);
