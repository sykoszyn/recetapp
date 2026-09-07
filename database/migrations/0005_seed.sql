-- RecetApp — 0005: datos semilla (categorías del onboarding + tabla de
-- conversiones por ingrediente). Idempotente vía ON CONFLICT.

insert into categories (name, slug, emoji) values
  ('Comida argentina', 'comida-argentina', '🇦🇷'),
  ('Pastas', 'pastas', '🍝'),
  ('Pizza', 'pizza', '🍕'),
  ('Postres', 'postres', '🍰'),
  ('Panadería', 'panaderia', '🥖'),
  ('Comida saludable', 'comida-saludable', '🥗'),
  ('Comida vegetariana', 'comida-vegetariana', '🥦'),
  ('Comida vegana', 'comida-vegana', '🌱'),
  ('Carnes', 'carnes', '🥩'),
  ('Parrilla', 'parrilla', '🔥'),
  ('Comida asiática', 'comida-asiatica', '🍜'),
  ('Comida mexicana', 'comida-mexicana', '🌮'),
  ('Comida rápida', 'comida-rapida', '🍔'),
  ('Desayunos', 'desayunos', '🍳'),
  ('Meriendas', 'meriendas', '🧇'),
  ('Bebidas', 'bebidas', '🥤'),
  ('Cócteles', 'cocteles', '🍹'),
  ('Recetas fáciles', 'recetas-faciles', '⚡'),
  ('Recetas económicas', 'recetas-economicas', '💸'),
  ('Air Fryer', 'air-fryer', '🍟'),
  ('Sin gluten', 'sin-gluten', '🌾')
on conflict (name) do nothing;

with seed_ingredients (name, slug, grams_per_cup, grams_per_tbsp, grams_per_tsp, notes) as (
  values
    ('Harina', 'harina', 125.0, 8.0, 2.6, 'Harina de trigo común, sin cernir'),
    ('Azúcar', 'azucar', 200.0, 12.5, 4.2, 'Azúcar blanca granulada'),
    ('Manteca', 'manteca', 227.0, 14.0, 4.7, 'Manteca/mantequilla a temperatura ambiente'),
    ('Leche', 'leche', 244.0, 15.3, 5.1, 'Leche entera líquida'),
    ('Agua', 'agua', 240.0, 15.0, 5.0, null),
    ('Aceite', 'aceite', 218.0, 13.6, 4.5, 'Aceite neutro (girasol/maíz)'),
    ('Arroz', 'arroz', 185.0, 12.0, 4.0, 'Arroz blanco crudo')
)
insert into ingredients (name, slug)
select name, slug from seed_ingredients
on conflict (name) do nothing;

insert into ingredient_conversions (ingredient_id, grams_per_cup, grams_per_tablespoon, grams_per_teaspoon, notes)
select i.id, s.grams_per_cup, s.grams_per_tbsp, s.grams_per_tsp, s.notes
from (
  values
    ('Harina', 125.0, 8.0, 2.6, 'Harina de trigo común, sin cernir'),
    ('Azúcar', 200.0, 12.5, 4.2, 'Azúcar blanca granulada'),
    ('Manteca', 227.0, 14.0, 4.7, 'Manteca/mantequilla a temperatura ambiente'),
    ('Leche', 244.0, 15.3, 5.1, 'Leche entera líquida'),
    ('Agua', 240.0, 15.0, 5.0, null),
    ('Aceite', 218.0, 13.6, 4.5, 'Aceite neutro (girasol/maíz)'),
    ('Arroz', 185.0, 12.0, 4.0, 'Arroz blanco crudo')
) as s(name, grams_per_cup, grams_per_tbsp, grams_per_tsp, notes)
join ingredients i on i.name = s.name
on conflict (ingredient_id) do update set
  grams_per_cup = excluded.grams_per_cup,
  grams_per_tablespoon = excluded.grams_per_tablespoon,
  grams_per_teaspoon = excluded.grams_per_teaspoon,
  notes = excluded.notes;
