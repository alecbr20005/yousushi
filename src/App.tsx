import { useEffect, useState } from 'react';
import type { FormEvent, PointerEvent } from 'react';
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { foodImages } from './data/foodImages';
import { products } from './data/products';
import { restaurant } from './data/restaurant';

const galleryImages = foodImages.slice(3);
const whatsappPhone = restaurant.phoneInternational.replace(/\D/g, '');
const productIds = new Set(products.map((product) => product.id));
const cartStorageKey = 'you-sushi-cart-selection-v1';
const localToday = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

function readStoredCart(): { cart: Record<number, number>; error: string } {
  try {
    const stored = window.localStorage.getItem(cartStorageKey);
    if (!stored) return { cart: {}, error: '' };

    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('El pedido guardado no tiene un formato válido.');
    }

    const cart: Record<number, number> = {};
    let skippedProducts = false;
    for (const [rawId, rawQuantity] of Object.entries(parsed as Record<string, unknown>)) {
      const id = Number(rawId);
      if (!productIds.has(id)) {
        skippedProducts = true;
        continue;
      }
      if (
        typeof rawQuantity !== 'number' ||
        !Number.isSafeInteger(rawQuantity) ||
        rawQuantity < 1
      ) {
        throw new Error('El pedido guardado contiene cantidades o platos no válidos.');
      }
      cart[id] = rawQuantity;
    }
    return {
      cart,
      error: skippedProducts
        ? 'Algunos platos del pedido anterior ya no están en esta selección y se han omitido.'
        : '',
    };
  } catch (error) {
    console.error('No se pudo recuperar el pedido guardado.', error);
    return {
      cart: {},
      error: 'No se pudo recuperar el pedido anterior. Puedes preparar uno nuevo.',
    };
  }
}

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
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [storedCart] = useState(readStoredCart);
  const [cart, setCart] = useState(storedCart.cart);
  const [cartStorageMessage, setCartStorageMessage] = useState(storedCart.error);
  const [cartFeedback, setCartFeedback] = useState('');
  const [orderReady, setOrderReady] = useState(false);
  const [orderErrors, setOrderErrors] = useState<Record<string, string>>({});
  const [order, setOrder] = useState({ name: '', phone: '', comment: '' });
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
  const [copyFeedback, setCopyFeedback] = useState('');
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartItems = products.filter((product) => cart[product.id]);

  useEffect(() => {
    try {
      window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch (error) {
      console.error('No se pudo guardar el pedido en este navegador.', error);
      setCartStorageMessage('No se pudo guardar el pedido en este navegador.');
    }
  }, [cart]);

  useEffect(() => {
    if (galleryIndex === null && !cartOpen) return;

    const previous = document.activeElement as HTMLElement | null;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setGalleryIndex(null);
        setCartOpen(false);
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
  }, [galleryIndex, cartOpen]);

  const scrollTo = (id: string) => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    setMobileOpen(false);
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
    'La reserva solo queda confirmada cuando el restaurante la acepta.',
  ].join('\n');

  const orderText = [
    'Hola, You Sushi Sevilla.',
    '',
    'Quisiera consultar disponibilidad y preparar este pedido:',
    ...cartItems.map((product) => `${cart[product.id]} × ${product.name}`),
    '',
    `Nombre: ${order.name.trim()}`,
    `Teléfono: ${order.phone.trim()}`,
    `Comentarios: ${order.comment.trim() || 'Ninguno'}`,
    '',
    '¿Podrían confirmar el precio actual, disponibilidad, ingredientes y alérgenos?',
  ].join('\n');

  const changeQuantity = (id: number, difference: number) => {
    setCart((current) => {
      const quantity = (current[id] || 0) + difference;
      const next = { ...current };
      if (quantity <= 0) delete next[id];
      else next[id] = quantity;
      return next;
    });
    setOrderReady(false);
  };

  const updateOrderField = (field: keyof typeof order, value: string) => {
    setOrder((current) => ({ ...current, [field]: value }));
    setOrderReady(false);
    setOrderErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleOrderSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (order.name.trim().length < 2) errors.name = 'Introduce tu nombre.';
    if (!/^[+()\d\s-]{9,}$/.test(order.phone)) errors.phone = 'Introduce un teléfono válido.';
    setOrderErrors(errors);
    if (Object.keys(errors).length === 0) setOrderReady(true);
  };

  const handleReservationSubmit = (event: FormEvent<HTMLFormElement>) => {
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
          <button type="button" onClick={() => scrollTo('galeria')}>Galería</button>
          <button type="button" onClick={() => scrollTo('reservas')}>Reservas</button>
          <button type="button" onClick={() => scrollTo('contacto')}>Contacto</button>
        </nav>

        <div className="header-actions">
          <a
            className="header-whatsapp"
            href={whatsappUrl('Hola, You Sushi Sevilla. Quisiera consultar disponibilidad.')}
            target="_blank"
            rel="noreferrer"
            aria-label="Consultar por WhatsApp"
          >
            <MessageCircle size={17} aria-hidden="true" />
            <span>WhatsApp</span>
          </a>
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
              alt={`${foodImages[0].alt}; fotografía ilustrativa de Unsplash`}
              className="hero-image"
              width={foodImages[0].width}
              height={foodImages[0].height}
              eager
            />
          </div>
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="eyebrow">COCINA JAPONESA · SEVILLA</p>
            <h1>Sushi japonés<br />en Sevilla.</h1>
            <p className="hero-intro">
              Descubre You Sushi en Calle Santa María la Blanca 23 y consulta nuestros platos destacados.
            </p>
            <div className="hero-actions">
              <button className="btn red" type="button" onClick={() => scrollTo('carta')}>
                Ver los platos <ArrowRight size={17} aria-hidden="true" />
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
              You Sushi se encuentra en el centro histórico de Sevilla. Descubre nuestros platos
              destacados, consulta disponibilidad y contacta directamente con el restaurante.
            </p>
            <button className="text-link" type="button" onClick={() => scrollTo('carta')}>
              Ver platos destacados <ArrowRight size={15} aria-hidden="true" />
            </button>
            <div className="story-facts">
              <div><strong>01</strong><span>Calle Santa María la Blanca</span></div>
              <div><strong>02</strong><span>41004 Sevilla</span></div>
              <div><strong>03</strong><span>Reserva por WhatsApp</span></div>
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

        <section className="menus-section section" id="carta">
          <div className="section-heading light">
            <div>
              <p className="eyebrow">SELECCIÓN GASTRONÓMICA</p>
              <h2>Cinco ideas<br />para disfrutar.</h2>
            </div>
            <p>Una selección visual inspirada en la cocina japonesa. Consulta por WhatsApp la carta y disponibilidad actuales.</p>
          </div>

          <div className="dish-grid">
            {products.map((product) => (
              <article className="menu-card dish-card" key={product.id}>
                <div
                  className="menu-photo photo-tilt"
                  onPointerMove={handlePhotoMove}
                  onPointerLeave={handlePhotoLeave}
                >
                  <SafeImage
                    src={product.image.src}
                    alt={`${product.image.alt}; imagen ilustrativa de Unsplash`}
                    width={product.image.width}
                    height={product.image.height}
                  />
                  <span className="photo-label">Imagen ilustrativa</span>
                </div>
                <div className="menu-card-content">
                  <p className="menu-category">INSPIRACIÓN</p>
                  <h3>{product.name}</h3>
                  <p className="menu-description">{product.description}</p>
                  <div className="menu-footer dish-footer">
                    <button
                      className="btn whatsapp"
                      type="button"
                      onClick={() => {
                        changeQuantity(product.id, 1);
                        setCartFeedback(`${product.name} añadido al pedido.`);
                      }}
                    >
                      <Plus size={16} aria-hidden="true" /> Añadir al pedido
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {cartFeedback && <p className="cart-feedback" role="status">{cartFeedback}</p>}
          <p className="image-disclaimer">
            Fotografías ilustrativas de Unsplash, almacenadas en el sitio con licencia de uso comercial. No representan platos servidos por el restaurante. Consulta la{' '}
            <a href={foodImages[0].licenseUrl} target="_blank" rel="noreferrer">licencia</a>.
          </p>
        </section>

        <section className="reservation section" id="reservas">
          <div className="reservation-copy">
            <p className="eyebrow dark">TU PRÓXIMA MESA</p>
            <h2>Nos vemos<br />en Sevilla.</h2>
            <p>
              Prepara una solicitud de reserva y envíala al restaurante por WhatsApp. La reserva
              solo queda confirmada cuando el restaurante la acepta.
            </p>
            <a href={`tel:${restaurant.phoneInternational}`}>
              <Phone size={17} aria-hidden="true" /> ¿Prefieres llamar? {restaurant.phone}
            </a>
          </div>

          <form className="reservation-form" onSubmit={handleReservationSubmit} noValidate>
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
                  <p>La reserva solo queda confirmada cuando el restaurante la acepta.</p>
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

        <section className="gallery section" id="galeria">
          <div className="section-heading">
            <div>
              <p className="eyebrow dark">GALERÍA GASTRONÓMICA</p>
              <h2>Un festín para los sentidos.</h2>
            </div>
            <p>Fotografías gastronómicas ilustrativas con licencia de Unsplash.</p>
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
                <SafeImage
                  src={image.src}
                  alt={`${image.alt}; fotografía ilustrativa de Unsplash`}
                  width={image.width}
                  height={image.height}
                />
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

      <footer>
        <div className="footer-brand">
          <span className="brand-seal" aria-hidden="true">友</span>
          <div><strong>YOU SUSHI</strong><p>Cocina japonesa en Sevilla.</p></div>
        </div>
        <nav className="footer-links" aria-label="Enlaces del pie de página">
          <strong>Explorar</strong>
          <button type="button" onClick={() => scrollTo('historia')}>El restaurante</button>
          <button type="button" onClick={() => scrollTo('carta')}>Carta</button>
          <button type="button" onClick={() => scrollTo('galeria')}>Galería</button>
          <button type="button" onClick={() => scrollTo('reservas')}>Reservas</button>
        </nav>
        <div className="footer-contact">
          <strong>Contacto</strong>
          <p>{restaurant.address}<br />{restaurant.postal}</p>
          <a href={`tel:${restaurant.phoneInternational}`}>{restaurant.phone}</a>
          <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>
        </div>
        <div className="footer-note" id="privacidad">
          <strong>Privacidad y fotografías</strong>
          <p>
            El navegador guarda las cantidades del pedido. Los datos de los formularios no se envían
            ni almacenan aquí; al elegir WhatsApp, podrás revisar el mensaje antes de enviarlo.
            Las imágenes son ilustrativas de Unsplash y tienen licencia de uso comercial.
          </p>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} You Sushi Sevilla</span>
          <a href={restaurant.maps} target="_blank" rel="noreferrer">Cómo llegar <ExternalLink size={13} aria-hidden="true" /></a>
        </div>
      </footer>

      <a
        className="floating-whatsapp"
        href={whatsappUrl('Hola, You Sushi Sevilla. Quisiera consultar disponibilidad.')}
        target="_blank"
        rel="noreferrer"
        aria-label="Consultar por WhatsApp"
      >
        <MessageCircle aria-hidden="true" />
      </a>

      <button
        className="floating-cart"
        type="button"
        onClick={() => setCartOpen(true)}
        aria-label={`Abrir pedido${cartCount > 0 ? `, ${cartCount} ${cartCount === 1 ? 'plato' : 'platos'}` : ''}`}
      >
        <ShoppingBag aria-hidden="true" />
        {cartCount > 0 && <span aria-hidden="true">{cartCount}</span>}
      </button>

      {cartOpen && (
        <div
          className="cart-overlay"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && setCartOpen(false)}
        >
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
            <div className="cart-header">
              <div>
                <h2 id="cart-title">Tu pedido</h2>
                <p>{cartCount} {cartCount === 1 ? 'plato' : 'platos'}</p>
              </div>
              <button type="button" onClick={() => setCartOpen(false)} aria-label="Cerrar pedido">
                <X aria-hidden="true" />
              </button>
            </div>

            {cartStorageMessage && <p className="cart-storage-message" role="status">{cartStorageMessage}</p>}

            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag aria-hidden="true" />
                <h3>Tu pedido está vacío</h3>
                <p>Añade una propuesta para consultar disponibilidad y precio.</p>
                <button
                  className="btn red"
                  type="button"
                  onClick={() => {
                    setCartOpen(false);
                    scrollTo('carta');
                  }}
                >
                  Ver propuestas
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((product) => (
                    <div className="cart-item" key={product.id}>
                      <SafeImage
                        src={product.image.src}
                        alt=""
                        className="cart-item-image"
                        width={product.image.width}
                        height={product.image.height}
                      />
                      <div className="cart-item-details">
                        <strong>{product.name}</strong>
                        <div className="cart-quantity">
                          <button
                            type="button"
                            onClick={() => changeQuantity(product.id, -1)}
                            aria-label={`Quitar una unidad de ${product.name}`}
                          >
                            <Minus size={14} aria-hidden="true" />
                          </button>
                          <span aria-label={`${cart[product.id]} unidades`}>{cart[product.id]}</span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(product.id, 1)}
                            aria-label={`Añadir una unidad de ${product.name}`}
                          >
                            <Plus size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <button
                        className="cart-remove"
                        type="button"
                        onClick={() => changeQuantity(product.id, -cart[product.id])}
                        aria-label={`Eliminar ${product.name} del pedido`}
                      >
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>

                <p className="cart-price-note">
                  Confirma el precio, la disponibilidad, los ingredientes y los alérgenos con el restaurante.
                </p>

                <form className="cart-order-form" onSubmit={handleOrderSubmit} noValidate>
                  <label>
                    Nombre*
                    <input
                      autoComplete="name"
                      value={order.name}
                      onChange={(event) => updateOrderField('name', event.target.value)}
                      aria-invalid={Boolean(orderErrors.name)}
                    />
                    {orderErrors.name && <small>{orderErrors.name}</small>}
                  </label>
                  <label>
                    Teléfono*
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={order.phone}
                      onChange={(event) => updateOrderField('phone', event.target.value)}
                      aria-invalid={Boolean(orderErrors.phone)}
                    />
                    {orderErrors.phone && <small>{orderErrors.phone}</small>}
                  </label>
                  <label>
                    Comentarios o alergias
                    <textarea
                      value={order.comment}
                      onChange={(event) => updateOrderField('comment', event.target.value)}
                    />
                  </label>
                  {orderReady ? (
                    <div className="cart-order-ready">
                      <p>Revisa el mensaje y envíalo para confirmar disponibilidad y precio.</p>
                      <a className="btn whatsapp" href={whatsappUrl(orderText)} target="_blank" rel="noreferrer">
                        <MessageCircle size={16} aria-hidden="true" /> Enviar por WhatsApp
                      </a>
                      <button
                        className="btn outline"
                        type="button"
                        onClick={() => copyText(orderText, 'Pedido copiado.')}
                      >
                        Copiar pedido
                      </button>
                      {copyFeedback && <p className="copy-feedback" role="status">{copyFeedback}</p>}
                    </div>
                  ) : (
                    <button className="btn red" type="submit">
                      Preparar pedido
                    </button>
                  )}
                </form>

                <button
                  className="clear-cart"
                  type="button"
                  onClick={() => {
                    setCart({});
                    setOrderErrors({});
                    setOrderReady(false);
                  }}
                >
                  Vaciar pedido
                </button>
              </>
            )}
          </aside>
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
              width={galleryImages[galleryIndex].width}
              height={galleryImages[galleryIndex].height}
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

    </>
  );
}
