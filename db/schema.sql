-- Esquema de Samai (Postgres / Supabase).
-- Idempotente: se puede correr varias veces sin romper nada.

create extension if not exists "pgcrypto";

-- Categorías de producto (papas, gomitas, cacahuates, frutas)
create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  instruccion text,
  limite_default int not null default 2,
  orden int not null default 0,
  activa boolean not null default true
);

-- Productos dentro de cada categoría
create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references categorias(id) on delete cascade,
  slug text not null,
  nombre text not null,
  emoji text,
  precio_extra numeric(10,2) not null default 0,
  disponible boolean not null default true,
  orden int not null default 0,
  unique (categoria_id, slug)
);

-- Paquetes base
create table if not exists paquetes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  descripcion text,
  precio_base numeric(10,2) not null default 0,
  precio_por_invitado numeric(10,2) not null default 0,
  recipientes int not null default 0,
  servicios jsonb not null default '[]',
  destacado boolean not null default false,
  activo boolean not null default true,
  orden int not null default 0
);

-- Límite de selección por paquete y categoría
create table if not exists paquete_limites (
  id uuid primary key default gen_random_uuid(),
  paquete_id uuid not null references paquetes(id) on delete cascade,
  categoria_id uuid not null references categorias(id) on delete cascade,
  limite int not null,
  unique (paquete_id, categoria_id)
);

-- Extras opcionales con precio
create table if not exists extras (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  emoji text,
  precio numeric(10,2) not null default 0,
  disponible boolean not null default true,
  orden int not null default 0
);

-- Clientes
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  correo text,
  telefono text,
  creado_en timestamptz not null default now()
);

-- Cotizaciones (guardamos el precio recalculado en el servidor + la selección completa)
create table if not exists cotizaciones (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete set null,
  paquete_id uuid references paquetes(id) on delete set null,
  invitados int,
  subtotal numeric(10,2) not null default 0,
  iva numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  estado text not null default 'nueva',   -- nueva | proceso | ganada | perdida
  canal text,                             -- whatsapp | correo
  seleccion jsonb,                        -- snapshot completo de lo elegido
  fecha_evento date,
  hora text,
  lugar text,
  comentarios text,
  creada_en timestamptz not null default now()
);

-- Ajustes del negocio (una sola fila, id=1)
create table if not exists ajustes (
  id int primary key default 1,
  whatsapp text,
  correo text,
  iva_aplica boolean not null default true,
  iva_tasa numeric(4,3) not null default 0.16,
  moneda text not null default 'MXN'
);
