import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, PointerEvent } from 'react';
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { foodImages } from './data/foodImages';
import { menus, products } from './data/products';
import type { Product } from './data/products';
import { restaurant } from './data/restaurant';

const allProducts = [...products, ...menus];
const categories = [
  'Todos',
  'Entrantes',
  'Ensaladas',
  'Sopas y ramen',
  'Platos calientes',
  'Frituras y tempuras',
  'Nigiris',
  'Maki',
  'California rolls',
  'Sashimi',
  'Combinados y bandejas',
  'Pokes',
  'Especialidades',
  'Bebidas',
  'Menús individuales',
  'Menús para compartir',
];
const filterOptions = ['Vegetariano', 'Picante', 'Contiene pescado', 'Especial', 'Combos'];
const featuredMenus = [
  { id: 109, image: foodImages[1], label: 'Una selección para disfrutar sin prisa' },
  { id: 110, image: foodImages[2], label: 'Una mesa que invita a compartir' },
];
const galleryImages = foodImages.slice(3);
const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
const whatsappPhone = restaurant.phoneInternational.replace(/\D/g, '');
const localToday = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

function SafeImage({
  src,
  alt,
  className = '',
  width = 1600,
  height = 1600,
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`image-fallback ${className}`} role="img" aria-label={alt}>
        <UtensilsCrossed aria-hidden="true" />
        <span>Imagen no disponible</span>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

function handlePhotoMove(event: PointerEvent<HTMLDivElement>) {
  if (
    event.pointerType !== 'mouse' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;
  event.currentTarget.style.setProperty('--tilt-x', `${(0.5 - y) * 2.4}deg`);
  event.currentTarget.style.setProperty('--tilt-y', `${(x - 0.5) * 2.4}deg`);
  event.currentTarget.style.setProperty('--image-x', `${(0.5 - x) * 7}px`);
  event.currentTarget.style.setProperty('--image-y', `${(0.5 - y) * 7}px`);
}

function handlePhotoLeave(event: PointerEvent<HTMLDivElement>) {
  event.currentTarget.style.removeProperty('--tilt-x');
  event.currentTarget.style.removeProperty('--tilt-y');
  event.currentTarget.style.removeProperty('--image-x');
  event.currentTarget.style.removeProperty('--image-y');
}

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [preference, setPreference] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderStep, setOrderStep] = useState<'cart' | 'details' | 'summary'>('cart');
  const [cart, setCart] = useState<Record<number, number>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('you-sushi-cart') || '{}');
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch {
      return {};
    }
  });
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [reservationReady, setReservationReady] = useState(false);
  const [reservationErrors, setReservationErrors] = useState<Record<string, string>>({});
  const [reservation, setReservation] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    people: '2',
    comment: '',
  });
  const [order, setOrder] = useState({
    name: '',
    phone: '',
    mode: 'Recoger en el restaurante',
    time: '',
    notes: '',
    allergies: '',
  });
  const [copyFeedback, setCopyFeedback] = useState('');

  useEffect(() => {
    localStorage.setItem('you-sushi-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!selected && !cartOpen && galleryIndex === null) return;

    const previous = document.activeElement as HTMLElement | null;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelected(null);
        setCartOpen(false);
        setGalleryIndex(null);
      }
      if (galleryIndex !== null && event.key === 'ArrowRight') {
        setGalleryIndex((galleryIndex + 1) % galleryImages.length);
      }
      if (galleryIndex !== null && event.key === 'ArrowLeft') {
        setGalleryIndex((galleryIndex - 1 + galleryImages.length) % galleryImages.length);
      }
    };

    document.body.classList.add('modal-open');
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', closeOnEscape);
      previous?.focus();
    };
  }, [selected, cartOpen, galleryIndex]);

  const filtered = useMemo(
    () =>
      allProducts.filter((product) => {
        const term = search.trim().toLowerCase();
        const matchesSearch =
          !term ||
          [product.name, product.description, product.ingredients, product.category].some((value) =>
            value.toLowerCase().includes(term),
          );
        const matchesCategory = category === 'Todos' || product.category === category;
        const matchesPreference =
          !preference ||
          product.tags.some((tag) => tag.toLowerCase().includes(preference.toLowerCase()));
        return matchesSearch && matchesCategory && matchesPreference;
      }),
    [search, category, preference],
  );

  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const total = allProducts.reduce(
    (sum, product) => sum + (cart[product.id] || 0) * product.price,
    0,
  );
  const cartItems = allProducts.filter((product) => cart[product.id]);

  const changeQty = (id: number, delta: number) => {
    setCart((current) => {
      const next = (current[id] || 0) + delta;
      const updated = { ...current };
      if (next <= 0) delete updated[id];
      else updated[id] = next;
      return updated;
    });
  };

  const scrollTo = (id: string) => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    setMobileOpen(false);
  };

  const orderText = () => {
    const lines = cartItems.map(
      (product) =>
        `${cart[product.id]} × ${product.name} — ${formatPrice(cart[product.id] * product.price)}`,
    );
    return [
      'Hola, You Sushi Sevilla.',
      '',
      'Quiero preparar el siguiente pedido:',
      '',
      ...lines,
      '',
      `Total de referencia pendiente: ${formatPrice(total)}`,
      'Precios, disponibilidad e importe pendientes de confirmación por el restaurante.',
      '',
      `Nombre: ${order.name}`,
      `Teléfono: ${order.phone}`,
      `Modalidad: ${order.mode}`,
      `Hora deseada: ${order.time || 'Por confirmar'}`,
      `Observaciones: ${order.notes || 'Ninguna'}`,
      `Alergias o indicaciones: ${order.allergies || 'Ninguna'}`,
    ].join('\n');
  };

  const whatsappUrl = (message: string) =>
    `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;

  const copyText = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(successMessage);
    } catch {
      setCopyFeedback('No se pudo copiar. Comprueba los permisos del navegador e inténtalo de nuevo.');
    }
  };

  const reservationText = [
    'Hola, You Sushi Sevilla.',
    '',
    'Solicito una reserva:',
    `Nombre: ${reservation.name}`,
    `Teléfono: ${reservation.phone}`,
    `Fecha: ${reservation.date}`,
    `Hora: ${reservation.time}`,
    `Personas: ${reservation.people}`,
    `Comentarios: ${reservation.comment || 'Ninguno'}`,
    '',
    'La solicitud queda pendiente de confirmación por el establecimiento.',
  ].join('\n');

  const validateReservation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (reservation.name.trim().length < 2) errors.name = 'Introduce tu nombre.';
    if (!/^[+()\d\s-]{9,}$/.test(reservation.phone)) errors.phone = 'Introduce un teléfono válido.';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!reservation.date) errors.date = 'Selecciona una fecha.';
    else if (new Date(`${reservation.date}T00:00`) < today) {
      errors.date = 'La fecha no puede ser anterior a hoy.';
    }
    if (!reservation.time) errors.time = 'Selecciona una hora.';

    setReservationErrors(errors);
    if (Object.keys(errors).length === 0) setReservationReady(true);
  };

  return (
    <>
      <header className="site-header">
        <button
          className="brand"
          type="button"
          onClick={() => scrollTo('inicio')}
          aria-label="Ir al inicio"
        >
          <span className="brand-seal" aria-hidden="true">友</span>
          <span className="brand-wordmark"><strong>YOU</strong><small>SUSHI · SEVILLA</small></span>
        </button>

        <nav className={mobileOpen ? 'nav open' : 'nav'} aria-label="Navegación principal">
          <button type="button" onClick={() => scrollTo('historia')}>El restaurante</button>
          <button type="button" onClick={() => scrollTo('carta')}>Carta</button>
          <button type="button" onClick={() => scrollTo('menus')}>Para compartir</button>
          <button type="button" onClick={() => scrollTo('galeria')}>Galería</button>
          <button type="button" onClick={() => scrollTo('reservas')}>Reservas</button>
          <button type="button" onClick={() => scrollTo('contacto')}>Contacto</button>
        </nav>

        <div className="header-actions">
          <button
            className="header-order"
            type="button"
            onClick={() => {
              setOrderStep('cart');
              setCartOpen(true);
            }}
          >
            <ShoppingBag size={17} aria-hidden="true" />
            <span>Tu pedido</span>
            {count > 0 && <b aria-label={`${count} productos`}>{count}</b>}
          </button>
          <button
            className="menu-button"
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div
            className="hero-photo photo-tilt"
            onPointerMove={handlePhotoMove}
            onPointerLeave={handlePhotoLeave}
          >
            <SafeImage
              src={foodImages[0].src}
              alt={foodImages[0].alt}
              className="hero-image"
              width={1600}
              height={1600}
              eager
            />
          </div>
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="eyebrow">COCINA JAPONESA · SEVILLA</p>
            <h1>Un encuentro<br />con Japón.</h1>
            <p className="hero-intro">
              Sushi, platos japoneses y una mesa para disfrutar en el corazón del casco antiguo.
            </p>
            <div className="hero-actions">
              <button className="btn red" type="button" onClick={() => scrollTo('carta')}>
                Explorar la carta <ArrowRight size={17} aria-hidden="true" />
              </button>
              <button
                className="btn glass"
                type="button"
                onClick={() => scrollTo('reservas')}
              >
                <CalendarDays size={17} aria-hidden="true" /> Reservar mesa
              </button>
            </div>
          </div>
          <div className="hero-location">
            <MapPin size={16} aria-hidden="true" />
            <span>{restaurant.address}<br />{restaurant.postal}</span>
          </div>
          <p className="photo-credit hero-credit">Fotografía ilustrativa · Unsplash</p>
          <span className="hero-index" aria-hidden="true">01 / 05</span>
        </section>

        <section className="story section" id="historia">
          <div className="story-copy">
            <p className="eyebrow dark">YOU SUSHI · SEVILLA</p>
            <h2>Una pausa japonesa<br />en Santa María la Blanca.</h2>
            <p>
              En pleno centro histórico de Sevilla, You Sushi reúne sushi, ramen y especialidades
              japonesas en una propuesta para disfrutar en el restaurante o pedir para llevar.
            </p>
            <a className="text-link" href={restaurant.website} target="_blank" rel="noreferrer">
              Conoce el restaurante <ExternalLink size={15} aria-hidden="true" />
            </a>
            <div className="story-facts">
              <div><strong>01</strong><span>Sushi y sashimi</span></div>
              <div><strong>02</strong><span>Platos japoneses</span></div>
              <div><strong>03</strong><span>Para compartir</span></div>
            </div>
          </div>
          <aside className="story-note">
            <span className="story-kanji" aria-hidden="true">友</span>
            <div className="story-note-bottom">
              <p className="eyebrow">EN EL CORAZÓN DE SEVILLA</p>
              <address>{restaurant.address}<br />{restaurant.postal}</address>
              <button className="text-link light-link" type="button" onClick={() => scrollTo('contacto')}>
                Cómo llegar <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          </aside>
        </section>

        <section className="menu-section section" id="carta">
          <div className="section-heading">
            <div>
              <p className="eyebrow dark">CARTA DIGITAL</p>
              <h2>Para elegir<br />a tu manera.</h2>
            </div>
            <label className="search-box">
              <Search size={18} aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar plato o ingrediente"
                aria-label="Buscar plato o ingrediente"
              />
            </label>
          </div>

          <div className="catalog-notice" role="note">
            <span className="notice-mark" aria-hidden="true">!</span>
            <p>
              <strong>Información pendiente de validación.</strong> Esta carta es de demostración:
              nombres y descripciones no son oficiales. Todos los precios son referencias pendientes
              de confirmación y no una tarifa vigente. Ingredientes y alérgenos también están
              pendientes de confirmación directa con el restaurante.
            </p>
          </div>

          <div className="preference-heading">
            <p>Explorar por preferencia</p>
            <span>Filtros orientativos; no sirven para determinar alérgenos o restricciones alimentarias.</span>
          </div>
          <div className="preference-row" aria-label="Filtros orientativos">
            {filterOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={preference === option ? 'active' : ''}
                aria-pressed={preference === option}
                onClick={() => setPreference(preference === option ? '' : option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="category-row" aria-label="Categorías de la carta">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={category === item ? 'active' : ''}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <p className="result-count" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'plato' : 'platos'}
          </p>

          {filtered.length > 0 ? (
            <div className="product-list">
              {filtered.map((product, index) => (
                <article className="product-row" key={product.id}>
                  <span className="product-ordinal" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="product-main">
                    <p className="product-category">{product.category}</p>
                    <button
                      className="product-name"
                      type="button"
                      onClick={() => {
                        setSelected(product);
                        setModalQty(1);
                      }}
                    >
                      {product.name}
                    </button>
                    <p className="product-description">{product.description}</p>
                    {product.pieces && <span className="pieces">{product.pieces}</span>}
                  </div>
                  <div className="product-actions">
                    <span className="price-caption">Referencia pendiente</span>
                    <strong>{formatPrice(product.price)}</strong>
                    <button
                      className="add-button"
                      type="button"
                      aria-label={`Añadir ${product.name} al pedido`}
                      onClick={() => changeQty(product.id, 1)}
                    >
                      <Plus size={18} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No hay resultados para esta búsqueda.</p>
              <button
                className="text-link"
                type="button"
                onClick={() => {
                  setSearch('');
                  setCategory('Todos');
                  setPreference('');
                }}
              >
                Limpiar filtros <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          )}
        </section>

        <section className="menus-section section" id="menus">
          <div className="section-heading light">
            <div>
              <p className="eyebrow">SELECCIÓN PARA COMPARTIR</p>
              <h2>La mesa sabe mejor<br />cuando se comparte.</h2>
            </div>
            <p>Una pequeña selección de menús de la carta. Las fotografías son ilustrativas y no representan menús oficiales.</p>
          </div>
          <div className="menu-grid">
            {featuredMenus.map(({ id, image, label }) => {
              const product = menus.find((item) => item.id === id);
              if (!product) return null;

              return (
                <article className="menu-card" key={product.id}>
                  <div
                    className="menu-photo photo-tilt"
                    onPointerMove={handlePhotoMove}
                    onPointerLeave={handlePhotoLeave}
                  >
                    <SafeImage
                      src={image.src}
                      alt={`${image.alt}; fotografía ilustrativa, no es una imagen verificada del menú ${product.name}`}
                      width={1600}
                      height={1600}
                    />
                    <span className="photo-label">Imagen ilustrativa</span>
                  </div>
                  <div className="menu-card-content">
                    <p className="menu-category">{product.category}</p>
                    <h3>{product.name}</h3>
                    <p className="menu-description">{product.description}</p>
                    <p className="menu-editorial">{label}</p>
                    {product.pieces && <span className="pieces">{product.pieces}</span>}
                    <div className="menu-footer">
                      <span><small>Referencia pendiente</small><strong>{formatPrice(product.price)}</strong></span>
                      <button
                        type="button"
                        onClick={() => changeQty(product.id, 1)}
                        aria-label={`Añadir ${product.name} al pedido`}
                      >
                        <Plus size={16} aria-hidden="true" /> Añadir
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="image-disclaimer">
            Imágenes de Unsplash bajo su licencia de uso; son ilustrativas y no se han verificado como fotografías de You Sushi ni de estos menús.
          </p>
        </section>

        <section className="reservation section" id="reservas">
          <div className="reservation-copy">
            <p className="eyebrow dark">TU PRÓXIMA MESA</p>
            <h2>Nos vemos<br />en Sevilla.</h2>
            <p>
              Prepara una solicitud de reserva y envíala al restaurante por WhatsApp. La reserva
              quedará pendiente de confirmación.
            </p>
            <a href={`tel:${restaurant.phoneInternational}`}>
              <Phone size={17} aria-hidden="true" /> ¿Prefieres llamar? {restaurant.phone}
            </a>
          </div>

          <form className="reservation-form" onSubmit={validateReservation} noValidate>
            <div className="form-grid">
              <label>
                Nombre*
                <input
                  autoComplete="name"
                  value={reservation.name}
                  onChange={(event) => setReservation({ ...reservation, name: event.target.value })}
                  aria-invalid={Boolean(reservationErrors.name)}
                />
                {reservationErrors.name && <small>{reservationErrors.name}</small>}
              </label>
              <label>
                Teléfono*
                <input
                  type="tel"
                  autoComplete="tel"
                  value={reservation.phone}
                  onChange={(event) => setReservation({ ...reservation, phone: event.target.value })}
                  aria-invalid={Boolean(reservationErrors.phone)}
                />
                {reservationErrors.phone && <small>{reservationErrors.phone}</small>}
              </label>
            </div>
            <div className="form-grid">
              <label>
                Fecha*
                <input
                  type="date"
                  min={localToday()}
                  value={reservation.date}
                  onChange={(event) => setReservation({ ...reservation, date: event.target.value })}
                  aria-invalid={Boolean(reservationErrors.date)}
                />
                {reservationErrors.date && <small>{reservationErrors.date}</small>}
              </label>
              <label>
                Hora*
                <input
                  type="time"
                  value={reservation.time}
                  onChange={(event) => setReservation({ ...reservation, time: event.target.value })}
                  aria-invalid={Boolean(reservationErrors.time)}
                />
                {reservationErrors.time && <small>{reservationErrors.time}</small>}
              </label>
            </div>
            <label>
              Personas
              <select
                value={reservation.people}
                onChange={(event) => setReservation({ ...reservation, people: event.target.value })}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                  <option key={number} value={number}>
                    {number} {number === 1 ? 'persona' : 'personas'}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Comentarios
              <textarea
                value={reservation.comment}
                onChange={(event) => setReservation({ ...reservation, comment: event.target.value })}
                placeholder="Indicaciones para el restaurante"
              />
            </label>
            {reservationReady ? (
              <div className="reservation-ready">
                <div>
                  <strong>Solicitud preparada</strong>
                  <p>El restaurante debe confirmar la reserva.</p>
                </div>
                <div className="reservation-ready-actions">
                  <a
                    className="btn whatsapp"
                    href={whatsappUrl(reservationText)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={16} aria-hidden="true" /> Enviar por WhatsApp
                  </a>
                  <button
                    className="btn outline"
                    type="button"
                    onClick={() => copyText(reservationText, 'Solicitud de reserva copiada.')}
                  >
                    Copiar solicitud
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn red" type="submit">
                <CalendarDays size={18} aria-hidden="true" /> Preparar reserva
              </button>
            )}
            {copyFeedback && <p className="copy-feedback" role="status">{copyFeedback}</p>}
            <p className="privacy-note">
              No se envían datos desde esta página. Revisa y envía la solicitud desde WhatsApp o
              cópiala para compartirla. <button type="button" onClick={() => scrollTo('privacidad')}>Más información</button>
            </p>
          </form>
        </section>

        <section className="reviews section">
          <div>
            <p className="eyebrow dark">OPINIONES</p>
            <h2>La experiencia,<br />contada por sus clientes.</h2>
          </div>
          <div className="review-summary">
            <span className="review-mark" aria-hidden="true">“</span>
            <p>Consulta opiniones y valoraciones actuales directamente en Google.</p>
            <a className="btn outline" href={restaurant.reviews} target="_blank" rel="noreferrer">
              Ver reseñas reales <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="gallery section" id="galeria">
          <div className="section-heading">
            <div>
              <p className="eyebrow dark">GALERÍA EDITORIAL</p>
              <h2>Un festín para los sentidos.</h2>
            </div>
            <p>Dos imágenes gastronómicas ilustrativas. Ninguna se atribuye al restaurante.</p>
          </div>
          <div className="gallery-grid">
            {galleryImages.map((image, index) => (
              <button
                className={`gallery-item g${index + 1}`}
                key={image.src}
                type="button"
                onClick={() => setGalleryIndex(index)}
                aria-label={`Ampliar fotografía ilustrativa: ${image.title}`}
              >
                <SafeImage src={image.src} alt={`${image.alt}; fotografía ilustrativa de Unsplash`} />
                <span className="gallery-caption">{image.title}</span>
                <span className="gallery-expand" aria-hidden="true"><Plus size={19} /></span>
              </button>
            ))}
          </div>
          <p className="image-disclaimer">
            Fotografías ilustrativas de Unsplash, almacenadas localmente. Consulta la{' '}
            <a href={foodImages[0].licenseUrl} target="_blank" rel="noreferrer">licencia de uso</a>.
          </p>
        </section>

        <section className="social section">
          <div>
            <p className="eyebrow dark">CONTACTO DIRECTO</p>
            <h2>Nos vemos<br />en la mesa.</h2>
            <p className="social-note">No hemos podido verificar un perfil social oficial. Contacta directamente con el restaurante.</p>
          </div>
          <div className="social-links">
            <a href={`mailto:${restaurant.email}`}>
              <Mail size={18} aria-hidden="true" /> Contactar por correo
            </a>
          </div>
        </section>

        <section className="contact" id="contacto">
          <div className="contact-map">
            <iframe
              title="Mapa de You Sushi en Sevilla"
              src={`https://www.google.com/maps?q=${encodeURIComponent(`${restaurant.address}, ${restaurant.postal}`)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="contact-copy">
            <p className="eyebrow dark">ENCUÉNTRANOS</p>
            <h2>Una dirección<br />para recordar.</h2>
            <address><MapPin size={18} aria-hidden="true" /><span>{restaurant.address}<br />{restaurant.postal}</span></address>
            <button
              className="copy-address"
              type="button"
              onClick={() => copyText(`${restaurant.address}, ${restaurant.postal}`, 'Dirección copiada.')}
            >
              <Copy size={15} aria-hidden="true" /> Copiar dirección
            </button>
            {copyFeedback && <p className="copy-feedback" role="status">{copyFeedback}</p>}
            <a href={`tel:${restaurant.phoneInternational}`}><Phone size={17} aria-hidden="true" />{restaurant.phone}</a>
            <a href={`mailto:${restaurant.email}`}><Mail size={17} aria-hidden="true" />{restaurant.email}</a>
            <div className="hours">
              <Clock3 size={18} aria-hidden="true" />
              <div><strong>Horario</strong><span>{restaurant.hoursStatus}</span></div>
            </div>
            <div className="contact-actions">
              <a
                className="btn whatsapp"
                href={whatsappUrl('Hola, You Sushi Sevilla. Quisiera hacer una consulta.')}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={16} aria-hidden="true" /> WhatsApp
              </a>
              <a className="btn red" href={restaurant.maps} target="_blank" rel="noreferrer">
                Cómo llegar <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a className="btn outline" href={`tel:${restaurant.phoneInternational}`}>
                Llamar al restaurante <Phone size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer id="privacidad">
        <div className="footer-brand">
          <span className="brand-seal" aria-hidden="true">友</span>
          <div><strong>YOU SUSHI</strong><p>Cocina japonesa en Sevilla.</p></div>
        </div>
        <nav className="footer-links" aria-label="Enlaces del pie de página">
          <strong>Explorar</strong>
          <button type="button" onClick={() => scrollTo('historia')}>El restaurante</button>
          <button type="button" onClick={() => scrollTo('carta')}>Carta</button>
          <button type="button" onClick={() => scrollTo('menus')}>Para compartir</button>
          <button type="button" onClick={() => scrollTo('reservas')}>Reservas</button>
        </nav>
        <div className="footer-contact">
          <strong>Contacto</strong>
          <p>{restaurant.address}<br />{restaurant.postal}</p>
          <a href={`tel:${restaurant.phoneInternational}`}>{restaurant.phone}</a>
          <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>
        </div>
        <div className="footer-disclaimer">
          <strong>Transparencia</strong>
          <p>
            Carta y precios de demostración pendientes de validación. Las imágenes son ilustrativas
            y no están verificadas como fotografías del restaurante. Los formularios no envían
            información hasta que la compartas desde tu dispositivo.
          </p>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} You Sushi Sevilla</span>
          <a href={restaurant.website} target="_blank" rel="noreferrer">Web oficial <ExternalLink size={13} aria-hidden="true" /></a>
        </div>
      </footer>

      <button
        className="floating-cart"
        type="button"
        onClick={() => {
          setOrderStep('cart');
          setCartOpen(true);
        }}
        aria-label={`Abrir pedido${count > 0 ? `, ${count} productos` : ''}`}
      >
        <ShoppingBag aria-hidden="true" />
        {count > 0 && <span>{count}</span>}
      </button>

      {selected && (
        <div
          className="overlay"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}
        >
          <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-title">
            <button className="modal-close" type="button" onClick={() => setSelected(null)} aria-label="Cerrar detalles">
              <X />
            </button>
            <div className="modal-copy">
              <p className="eyebrow dark">{selected.category}</p>
              <h2 id="product-title">{selected.name}</h2>
              <p>{selected.description}</p>
              {selected.pieces && <span className="pieces">{selected.pieces}</span>}
              <div className="detail-block">
                <strong>Ingredientes</strong>
                <span>{selected.ingredients}</span>
              </div>
              <div className="detail-block">
                <strong>Alérgenos</strong>
                <span>{selected.allergens}</span>
              </div>
              <p className="pending-note">
                Datos y precio de demostración pendientes de validación. Consulta directamente al
                restaurante, especialmente ante alergias o intolerancias.
              </p>
              <div className="modal-footer">
                <div className="modal-qty" aria-label="Cantidad">
                  <button type="button" onClick={() => setModalQty((quantity) => Math.max(1, quantity - 1))} aria-label="Restar una unidad">
                    <Minus size={16} />
                  </button>
                  <span>{modalQty}</span>
                  <button type="button" onClick={() => setModalQty((quantity) => quantity + 1)} aria-label="Añadir una unidad">
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  className="btn red"
                  type="button"
                  onClick={() => {
                    setCart((current) => ({
                      ...current,
                      [selected.id]: (current[selected.id] || 0) + modalQty,
                    }));
                    setSelected(null);
                  }}
                >
                  Añadir · {formatPrice(selected.price * modalQty)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {galleryIndex !== null && (
        <div
          className="lightbox"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && setGalleryIndex(null)}
        >
          <div className="lightbox-content" role="dialog" aria-modal="true" aria-label="Galería de fotografías ilustrativas">
            <button className="light-close" type="button" onClick={() => setGalleryIndex(null)} aria-label="Cerrar galería">
              <X />
            </button>
            <button
              className="light-nav left"
              type="button"
              onClick={() => setGalleryIndex((galleryIndex - 1 + galleryImages.length) % galleryImages.length)}
              aria-label="Fotografía anterior"
            >
              <ChevronLeft />
            </button>
            <SafeImage
              src={galleryImages[galleryIndex].src}
              alt={`${galleryImages[galleryIndex].alt}; fotografía ilustrativa de Unsplash`}
              width={1600}
              height={1600}
            />
            <p>{galleryImages[galleryIndex].title} · Imagen ilustrativa</p>
            <button
              className="light-nav right"
              type="button"
              onClick={() => setGalleryIndex((galleryIndex + 1) % galleryImages.length)}
              aria-label="Fotografía siguiente"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}

      {cartOpen && (
        <div
          className="cart-overlay"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && setCartOpen(false)}
        >
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Pedido You Sushi">
            <div className="cart-header">
              <div>
                <p>{orderStep === 'cart' ? 'Tu pedido' : orderStep === 'details' ? 'Datos del pedido' : 'Resumen'}</p>
                <span>{count} {count === 1 ? 'producto' : 'productos'}</span>
              </div>
              <button type="button" onClick={() => setCartOpen(false)} aria-label="Cerrar pedido"><X /></button>
            </div>

            {orderStep === 'cart' &&
              (!cartItems.length ? (
                <div className="empty-cart">
                  <ShoppingBag aria-hidden="true" />
                  <h3>Tu pedido está vacío</h3>
                  <p>Añade tus platos favoritos desde la carta.</p>
                  <button
                    className="btn red"
                    type="button"
                    onClick={() => {
                      setCartOpen(false);
                      scrollTo('carta');
                    }}
                  >
                    Explorar la carta
                  </button>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cartItems.map((product) => (
                      <div className="cart-item" key={product.id}>
                        <div className="cart-item-number" aria-hidden="true">{String(product.id).padStart(2, '0')}</div>
                        <div className="cart-item-copy">
                          <strong>{product.name}</strong>
                          <span>{formatPrice(product.price)} · referencia pendiente</span>
                          <div className="qty">
                            <button type="button" onClick={() => changeQty(product.id, -1)} aria-label={`Restar ${product.name}`}>
                              <Minus size={14} />
                            </button>
                            <b>{cart[product.id]}</b>
                            <button type="button" onClick={() => changeQty(product.id, 1)} aria-label={`Añadir ${product.name}`}>
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <button
                          className="remove"
                          type="button"
                          onClick={() => changeQty(product.id, -cart[product.id])}
                          aria-label={`Eliminar ${product.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="cart-summary">
                    <p>Importes de demostración, pendientes de confirmación.</p>
                    <div><span>Subtotal orientativo</span><strong>{formatPrice(total)}</strong></div>
                    <div><span>Total de referencia pendiente</span><strong>{formatPrice(total)}</strong></div>
                  </div>
                  <div className="cart-actions">
                    <button className="btn red" type="button" onClick={() => setOrderStep('details')}>
                      Continuar pedido <ArrowRight size={17} aria-hidden="true" />
                    </button>
                    <button className="clear" type="button" onClick={() => setCart({})}>Vaciar pedido</button>
                  </div>
                </>
              ))}

            {orderStep === 'details' && (
              <div className="order-form">
                <label>Nombre*<input autoComplete="name" value={order.name} onChange={(event) => setOrder({ ...order, name: event.target.value })} /></label>
                <label>Teléfono*<input type="tel" autoComplete="tel" value={order.phone} onChange={(event) => setOrder({ ...order, phone: event.target.value })} /></label>
                <label>
                  Modalidad
                  <select value={order.mode} onChange={(event) => setOrder({ ...order, mode: event.target.value })}>
                    <option>Recoger en el restaurante</option>
                    <option>Consultar entrega a domicilio</option>
                  </select>
                </label>
                <label>Hora deseada<input type="time" value={order.time} onChange={(event) => setOrder({ ...order, time: event.target.value })} /></label>
                <label>Observaciones<textarea value={order.notes} onChange={(event) => setOrder({ ...order, notes: event.target.value })} /></label>
                <label>Alergias o indicaciones<textarea value={order.allergies} onChange={(event) => setOrder({ ...order, allergies: event.target.value })} /></label>
                <p className="pending-note">
                  El pedido y sus precios son orientativos y quedan pendientes de confirmación por el restaurante.
                </p>
                <div className="order-form-actions">
                  <button className="btn outline" type="button" onClick={() => setOrderStep('cart')}>Volver</button>
                  <button
                    className="btn red"
                    type="button"
                    disabled={!order.name.trim() || !/^[+()\d\s-]{9,}$/.test(order.phone)}
                    onClick={() => setOrderStep('summary')}
                  >
                    Ver resumen
                  </button>
                </div>
              </div>
            )}

            {orderStep === 'summary' && (
              <div className="order-summary">
                <div className="summary-client">
                  <strong>{order.name}</strong>
                  <span>{order.phone}</span>
                  <span>{order.mode}</span>
                  {order.time && <span>Hora: {order.time}</span>}
                </div>
                <div className="summary-items">
                  {cartItems.map((product) => (
                    <div key={product.id}>
                      <span>{cart[product.id]} × {product.name}</span>
                      <strong>{formatPrice(cart[product.id] * product.price)}</strong>
                    </div>
                  ))}
                </div>
                <div className="summary-total">
                  <span>Total de referencia pendiente</span><strong>{formatPrice(total)}</strong>
                </div>
                {order.notes && <p><strong>Observaciones:</strong> {order.notes}</p>}
                <p><strong>Alergias:</strong> {order.allergies || 'Ninguna indicada'}</p>
                <p className="pending-note">El pedido no queda confirmado hasta que el restaurante responda.</p>
                <div className="cart-actions">
                  <a className="btn whatsapp" href={whatsappUrl(orderText())} target="_blank" rel="noreferrer">
                    <MessageCircle size={17} aria-hidden="true" /> Preparar en WhatsApp
                  </a>
                  <button className="btn copy" type="button" onClick={() => copyText(orderText(), 'Pedido copiado.')}>
                    Copiar pedido
                  </button>
                  <a className="btn call" href={`tel:${restaurant.phoneInternational}`}>
                    <Phone size={16} aria-hidden="true" /> Llamar al restaurante
                  </a>
                  <button className="clear" type="button" onClick={() => setOrderStep('details')}>Modificar datos</button>
                </div>
                {copyFeedback && <p className="copy-feedback" role="status">{copyFeedback}</p>}
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
