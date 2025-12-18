export interface CarImage {
  image_url?: string;
  file_path?: string;
}

export interface Car {
  id: number;
  asofix_id: string;
  title: string;
  content?: string;
  year?: number;
  kilometres: number;
  license_plate?: string;
  price_usd?: number;
  price_ars?: number;
  featured_image_path?: string;
  featured_image_url?: string;
  images?: CarImage[];
  created_at?: string;
  updated_at?: string;
  taxonomies?: {
    brand?: string[];
    model?: string[];
    condition?: string[];
    transmission?: string[];
    fuel_type?: string[];
    color?: string[];
    segment?: string[];
  };
}

export interface CarFilters {
  page?: number;
  limit?: number;
  brand?: string;
  model?: string;
  condition?: string;
  transmission?: string;
  fuel_type?: string;
  color?: string;
  segment?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minKilometres?: number;
  maxKilometres?: number;
  search?: string;
  sortBy?: 'created_at' | 'price' | 'year' | 'kilometres' | 'title';
  sortOrder?: 'ASC' | 'DESC';
  currency?: 'ARS' | 'USD';
}

export interface FilterOption {
  name: string;
  count: number;
}

export interface FilterOptions {
  conditions: FilterOption[];
  brands: FilterOption[];
  models: FilterOption[];
  segments?: FilterOption[];
  transmissions?: FilterOption[];
  fuelTypes?: FilterOption[];
  colors?: FilterOption[];
  ranges: {
    min_price_usd?: number;
    max_price_usd?: number;
    min_price_ars?: number;
    max_price_ars?: number;
    min_year?: number;
    max_year?: number;
    min_kilometres?: number;
    max_kilometres?: number;
  };
}

