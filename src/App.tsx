import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowRight, CalendarDays,   ChevronLeft, ChevronRight, Clock3,
  Mail, MapPin, Menu, Minus, Phone, Plus, Search, ShoppingBag,
  Trash2, UtensilsCrossed, X,
} from 'lucide-react';
import { menus, products } from './data/products';
import type { Product } from './data/products';
import { restaurant } from './data/restaurant';

const heroImage = 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1800&q=88';
const interiorImage = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=86';

const allProducts = [...products, ...menus];
const categories = ['Todos','Entrantes','Ensaladas','Sopas y ramen','Platos calientes','Frituras y tempuras','Nigiris','Maki','California rolls','Sashimi','Combinados y bandejas','Pokes','Especialidades','Bebidas','Menús individuales','Menús para compartir'];
const filterOptions = ['Vegetariano','Picante','Contiene pescado','Especial','Combos'];

function SafeImage({src,alt,className=''}:{src:string;alt:string;className?:string}) {
  const [failed,setFailed] = useState(false);
  return failed
    ? <div className={`image-fallback ${className}`} role="img" aria-label={alt}><UtensilsCrossed/><span>{alt}</span></div>
    : <img className={className} src={src} alt={alt} loading="lazy" onError={()=>setFailed(true)} />;
}

export default function App() {
  const [mobileOpen,setMobileOpen] = useState(false);
  const [search,setSearch] = useState('');
  const [category,setCategory] = useState('Todos');
  const [preference,setPreference] = useState('');
  const [selected,setSelected] = useState<Product|null>(null);
  const [modalQty,setModalQty] = useState(1);
  const [cartOpen,setCartOpen] = useState(false);
  const [orderStep,setOrderStep] = useState<'cart'|'details'|'summary'>('cart');
  const [cart,setCart] = useState<Record<number,number>>(()=>{
    try{return JSON.parse(localStorage.getItem('you-sushi-cart') || '{}')}catch{return {}}
  });
  const [galleryIndex,setGalleryIndex]=useState<number|null>(null);
  const [reservationReady,setReservationReady]=useState(false);
  const [reservationErrors,setReservationErrors]=useState<Record<string,string>>({});
  const [reservation,setReservation]=useState({name:'',phone:'',date:'',time:'',people:'2',comment:''});
  const [order,setOrder]=useState({name:'',phone:'',mode:'Recoger en el restaurante',time:'',notes:'',allergies:''});
  const [copyFeedback,setCopyFeedback]=useState('');

  useEffect(()=>localStorage.setItem('you-sushi-cart',JSON.stringify(cart)),[cart]);
  useEffect(()=>{
    if(!selected && !cartOpen && galleryIndex===null)return;
    const previous=document.activeElement as HTMLElement|null;
    document.body.classList.add('modal-open');
    return()=>{document.body.classList.remove('modal-open');previous?.focus()};
  },[selected,cartOpen,galleryIndex]);

  const filtered=useMemo(()=>allProducts.filter(p=>{
    const term=search.trim().toLowerCase();
    const matchesSearch=!term || [p.name,p.description,p.ingredients,p.category].some(v=>v.toLowerCase().includes(term));
    const matchesCategory=category==='Todos'||p.category===category;
    const matchesPreference=!preference || (p.verified && p.tags.some(t=>t.toLowerCase().includes(preference.toLowerCase())));
    return matchesSearch&&matchesCategory&&matchesPreference;
  }),[search,category,preference]);

  const count=Object.values(cart).reduce((sum,q)=>sum+q,0);
  const total=allProducts.reduce((sum,p)=>sum+(cart[p.id]||0)*p.price,0);
  const cartItems=allProducts.filter(p=>cart[p.id]);

  const changeQty=(id:number,delta:number)=>{
    setCart(current=>{
      const next=(current[id]||0)+delta;
      const copy={...current};
      if(next<=0)delete copy[id];else copy[id]=next;
      return copy;
    });
  };

  const scrollTo=(id:string)=>{document.getElementById(id)?.scrollIntoView({behavior:'smooth'});setMobileOpen(false)};
  const orderText=()=>{
    const lines=cartItems.map(p=>`${cart[p.id]} × ${p.name} — ${(cart[p.id]*p.price).toFixed(2)} €`);
    return `Hola, You Sushi.\n\nQuiero preparar el siguiente pedido:\n\n${lines.join('\n')}\n\nSubtotal: ${total.toFixed(2)} €\nTotal: ${total.toFixed(2)} €\n\nNombre: ${order.name}\nTeléfono: ${order.phone}\nModalidad: ${order.mode}\nHora deseada: ${order.time||'Por confirmar'}\nObservaciones: ${order.notes||'Ninguna'}\nAlergias o indicaciones: ${order.allergies||'Ninguna'}\n\nEl pedido queda pendiente de confirmación por el restaurante.`;
  };
  const copyText=async(text:string,successMessage:string)=>{
    try{
      await navigator.clipboard.writeText(text);
      setCopyFeedback(successMessage);
    }catch{
      setCopyFeedback('No se pudo copiar. Comprueba los permisos del navegador e inténtalo de nuevo.');
    }
  };
  const copyOrder=()=>copyText(orderText(),'Pedido copiado.');
  const reservationText=`Hola, You Sushi.\n\nSolicito una reserva:\nNombre: ${reservation.name}\nTeléfono: ${reservation.phone}\nFecha: ${reservation.date}\nHora: ${reservation.time}\nPersonas: ${reservation.people}\nComentarios: ${reservation.comment||'Ninguno'}\n\nLa reserva queda pendiente de confirmación por el establecimiento.`;

  const validateReservation=(event:FormEvent)=>{
    event.preventDefault();
    const errors:Record<string,string>={};
    if(reservation.name.trim().length<2)errors.name='Introduce tu nombre.';
    if(!/^[+()\d\s-]{9,}$/.test(reservation.phone))errors.phone='Introduce un teléfono válido.';
    const today=new Date();today.setHours(0,0,0,0);
    if(!reservation.date)errors.date='Selecciona una fecha.';
    else if(new Date(`${reservation.date}T00:00`)<today)errors.date='La fecha no puede ser anterior a hoy.';
    if(!reservation.time)errors.time='Selecciona una hora.';
    setReservationErrors(errors);
    if(Object.keys(errors).length===0)setReservationReady(true);
  };

  const gallery=[
    heroImage,
    'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=1200&q=86',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=86',
    'https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&w=1200&q=86',
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=1200&q=86',
    interiorImage,
  ];

  return<>
    <header className="site-header">
      <button className="brand" onClick={()=>scrollTo('inicio')} aria-label="Ir al inicio"><span className="brand-seal">友</span><span><strong>YOU</strong><small>SUSHI</small></span></button>
      <nav className={mobileOpen?'nav open':'nav'} aria-label="Navegación principal">
        <button onClick={()=>scrollTo('inicio')}>Inicio</button><button onClick={()=>scrollTo('historia')}>Nuestra historia</button>
        <button onClick={()=>scrollTo('carta')}>Carta</button><button onClick={()=>scrollTo('menus')}>Menús</button>
        <button onClick={()=>scrollTo('galeria')}>Galería</button><button onClick={()=>scrollTo('reservas')}>Reservas</button><button onClick={()=>scrollTo('contacto')}>Contacto</button>
      </nav>
      <button className="header-order" onClick={()=>{setOrderStep('cart');setCartOpen(true)}}><ShoppingBag size={17}/><span>Pedir ahora</span>{count>0&&<b>{count}</b>}</button>
      <button className="menu-button" onClick={()=>setMobileOpen(!mobileOpen)} aria-label={mobileOpen?'Cerrar menú':'Abrir menú'}>{mobileOpen?<X/>:<Menu/>}</button>
    </header>

    <main>
      <section className="hero" id="inicio">
        <SafeImage src={heroImage} alt="Selección de sushi japonés"/>
        <div className="hero-overlay"/>
        <div className="hero-content">
          <p className="eyebrow">RESTAURANTE JAPONES · SEVILLA</p>
          <h1>El auténtico sabor<br/><em>de Japón</em> en Sevilla</h1>
          <p>Sushi, sashimi y especialidades japonesas preparadas con atención al detalle.</p>
          <div className="hero-actions"><button className="btn red" onClick={()=>scrollTo('carta')}>Descubrir la carta <ArrowRight size={17}/></button><button className="btn glass" onClick={()=>{setOrderStep('cart');setCartOpen(true)}}><ShoppingBag size={17}/> Preparar pedido</button></div>
        </div>
        <div className="hero-address"><MapPin size={16}/><span>{restaurant.address}<br/>{restaurant.postal}</span></div>
      </section>

      <section className="story section" id="historia">
        <div className="story-visual"><SafeImage src={interiorImage} alt="Ambiente japonés de You Sushi"/><div className="story-seal"><UtensilsCrossed/><span>Cocina cuidada</span></div></div>
        <div className="story-copy"><p className="eyebrow dark">NUESTRA HISTORIA</p><h2>Japón, en el corazón<br/>del Casco Antiguo</h2><p>En You Sushi encontrarás una propuesta japonesa cercana en el centro histórico de Sevilla: sushi elaborado con cuidado, platos calientes, ramen y opciones para comer en el local o llevar.</p><div className="story-facts"><div><strong>01</strong><span>Cocina japonesa</span></div><div><strong>02</strong><span>Sushi y sashimi</span></div><div><strong>03</strong><span>Comer aquí o llevar</span></div></div></div>
      </section>

      <section className="menu-section section" id="carta">
        <div className="section-heading"><div><p className="eyebrow dark">CARTA DIGITAL</p><h2>Nuestra selección</h2></div><div className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar plato o ingrediente" aria-label="Buscar plato o ingrediente"/></div></div>
        <p className="catalog-note">Carta de demostración. Confirma precios, disponibilidad, ingredientes y alérgenos con el restaurante antes de realizar el pedido.</p>
        <div className="preference-row" aria-label="Filtros por preferencias">{filterOptions.map(option=><button key={option} className={preference===option?'active':''} onClick={()=>setPreference(preference===option?'':option)}>{option}</button>)}</div>
        <div className="category-row" aria-label="Categorías">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
        <p className="result-count">{filtered.length} platos encontrados</p>
        <div className="product-grid">
          {filtered.map(p=><article className="product-card" key={p.id}>
            <button className="product-photo" onClick={()=>{setSelected(p);setModalQty(1)}} aria-label={`Ver detalles de ${p.name}`}><SafeImage src={p.image} alt={p.name}/>{p.verified&&p.tags.slice(0,1).map(t=><span className="product-tag" key={t}>{t}</span>)}</button>
            <div className="product-content"><p className="product-category">{p.category}</p><button className="product-name" onClick={()=>{setSelected(p);setModalQty(1)}}>{p.name}</button><p className="product-description">{p.description}</p>{p.pieces&&<span className="pieces">{p.pieces}</span>}<div className="product-footer"><strong>{p.price.toFixed(2).replace('.',',')} €</strong><button onClick={()=>changeQty(p.id,1)} aria-label={`Añadir ${p.name}`}><Plus size={18}/></button></div></div>
          </article>)}
        </div>
      </section>

      <section className="menus-section section" id="menus">
        <div className="section-heading light"><div><p className="eyebrow">PARA COMPARTIR</p><h2>Menús & combinados</h2></div><p>Selecciones de la carta para comer solo o reunirse alrededor de una buena mesa.</p></div>
        <div className="menu-grid">{menus.map(p=><article className="menu-card" key={p.id}><SafeImage src={p.image} alt={p.name}/><div className="menu-card-content"><p>{p.category}</p><h3>{p.name}</h3><p className="menu-description">{p.description}</p><span>{p.pieces}</span><div className="menu-footer"><strong>{p.price.toFixed(2).replace('.',',')} €</strong><button onClick={()=>changeQty(p.id,1)}><Plus size={16}/> Añadir</button></div></div></article>)}</div>
      </section>

      <section className="reservation section" id="reservas">
        <div className="reservation-copy"><p className="eyebrow dark">TU PRÓXIMA MESA</p><h2>Ven a vivir<br/>You Sushi</h2><p>Prepara tu solicitud y el restaurante podrá confirmar la disponibilidad.</p><a href={`tel:${restaurant.phoneInternational}`}><Phone size={17}/> ¿Prefieres llamar? {restaurant.phone}</a></div>
        <form className="reservation-form" onSubmit={validateReservation} noValidate>
          <div className="form-grid"><label>Nombre*<input value={reservation.name} onChange={e=>setReservation({...reservation,name:e.target.value})}/>{reservationErrors.name&&<small>{reservationErrors.name}</small>}</label><label>Teléfono*<input type="tel" value={reservation.phone} onChange={e=>setReservation({...reservation,phone:e.target.value})}/>{reservationErrors.phone&&<small>{reservationErrors.phone}</small>}</label></div>
          <div className="form-grid"><label>Fecha*<input type="date" min={new Date().toISOString().split('T')[0]} value={reservation.date} onChange={e=>setReservation({...reservation,date:e.target.value})}/>{reservationErrors.date&&<small>{reservationErrors.date}</small>}</label><label>Hora*<input type="time" value={reservation.time} onChange={e=>setReservation({...reservation,time:e.target.value})}/>{reservationErrors.time&&<small>{reservationErrors.time}</small>}</label></div>
          <label>Personas<select value={reservation.people} onChange={e=>setReservation({...reservation,people:e.target.value})}>{[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n} value={n}>{n} {n===1?'persona':'personas'}</option>)}</select></label>
          <label>Comentarios<textarea value={reservation.comment} onChange={e=>setReservation({...reservation,comment:e.target.value})} placeholder="Alergias u indicaciones"/></label>
          {reservationReady?<div className="reservation-ready"><div><strong>Solicitud preparada</strong><p>El establecimiento debe confirmar la reserva.</p></div><div className="reservation-ready-actions"><button className="btn outline" type="button" onClick={()=>copyText(reservationText,'Solicitud de reserva copiada.')}>Copiar solicitud</button><a className="btn red" href={`tel:${restaurant.phoneInternational}`}><Phone size={16}/> Llamar</a></div></div>:<button className="btn red" type="submit"><CalendarDays size={18}/> Preparar reserva</button>}
          {copyFeedback&&<p className="copy-feedback" role="status">{copyFeedback}</p>}
          <p className="privacy-note">Al enviar la solicitud aceptas el tratamiento local de estos datos para preparar el mensaje. Consulta la <button type="button" onClick={()=>scrollTo('privacidad')}>política de privacidad</button>.</p>
        </form>
      </section>

      <section className="reviews section"><div><p className="eyebrow dark">LO QUE DICEN NUESTROS CLIENTES</p><h2>Opiniones reales</h2></div><div className="review-summary"><p>Consulta las opiniones y la valoración actuales de You Sushi directamente en Google.</p><a className="btn outline" href={restaurant.reviews} target="_blank" rel="noreferrer">Ver reseñas reales</a></div></section>

      <section className="gallery section" id="galeria"><div className="section-heading"><div><p className="eyebrow dark">GALERÍA</p><h2>Momentos You Sushi</h2></div><p>Sushi, ramen, tempura y ambiente gastronómico.</p></div><div className="gallery-grid">{gallery.map((src,i)=><button className={`gallery-item g${i+1}`} key={src} onClick={()=>setGalleryIndex(i)}><SafeImage src={src} alt={`Ambiente gastronómico You Sushi ${i+1}`}/><span><Plus size={20}/></span></button>)}</div></section>

      <section className="social section"><div><p className="eyebrow dark">SÍGUENOS</p><h2>Síguenos y descubre You Sushi</h2></div><div className="social-links"><a href={restaurant.facebook} target="_blank" rel="noreferrer"><b>f</b> Facebook</a><a href={`mailto:${restaurant.email}`}><Mail size={19}/> Contactar por correo</a></div></section>

      <section className="contact" id="contacto"><div className="contact-map"><iframe title="Mapa You Sushi Sevilla" src={`https://www.google.com/maps?q=${encodeURIComponent(`${restaurant.address}, ${restaurant.postal}`)}&output=embed`} loading="lazy"/></div><div className="contact-copy"><p className="eyebrow dark">TU JAPÓN EN SEVILLA</p><h2>Estamos aquí</h2><address><MapPin/><span>{restaurant.address}<br/>41004 Sevilla, España</span></address><a href={`tel:${restaurant.phoneInternational}`}><Phone/><span>{restaurant.phone}</span></a><a href={`mailto:${restaurant.email}`}><Mail/><span>{restaurant.email}</span></a><div className="hours"><Clock3/><div><strong>Horario</strong><span>{restaurant.hoursStatus}</span></div></div><div className="contact-actions"><a className="btn red" href={restaurant.maps} target="_blank" rel="noreferrer">Cómo llegar</a><button className="btn outline" onClick={()=>scrollTo('reservas')}>Reservar mesa</button></div></div></section>
    </main>

    <footer id="privacidad"><div className="footer-brand"><span className="brand-seal">友</span><div><strong>YOU SUSHI</strong><p>Cocina japonesa en el corazón de Sevilla.</p></div></div><nav className="footer-links"><strong>Explorar</strong><button onClick={()=>scrollTo('historia')}>Nuestra historia</button><button onClick={()=>scrollTo('carta')}>Carta</button><button onClick={()=>scrollTo('menus')}>Menús</button><button onClick={()=>scrollTo('reservas')}>Reservas</button></nav><div className="footer-contact"><strong>Contacto</strong><p>{restaurant.address}<br/>41004 Sevilla</p><a href={`tel:${restaurant.phoneInternational}`}>{restaurant.phone}</a><a href={`mailto:${restaurant.email}`}>{restaurant.email}</a></div><div className="footer-bottom"><span>© 2026 You Sushi Sevilla</span><span>Demo comercial · Política de privacidad · Aviso legal</span></div></footer>

    <button className="floating-cart" onClick={()=>{setOrderStep('cart');setCartOpen(true)}} aria-label={`Abrir pedido, ${count} productos`}><ShoppingBag/><span>{count}</span></button>

    {selected&&<div className="overlay" role="dialog" aria-modal="true" onMouseDown={e=>e.target===e.currentTarget&&setSelected(null)}><div className="product-modal"><button className="modal-close" onClick={()=>setSelected(null)} aria-label="Cerrar"><X/></button><SafeImage src={selected.image} alt={selected.name} className="modal-photo"/><div className="modal-copy"><p className="eyebrow dark">{selected.category}</p><h2>{selected.name}</h2><p>{selected.description}</p><div className="detail-block"><strong>Ingredientes</strong><span>{selected.ingredients}</span></div>{selected.pieces&&<span className="pieces">{selected.pieces}</span>}<div className="detail-block"><strong>Alérgenos</strong><span>{selected.allergens}</span></div>{selected.verified&&<div className="modal-tags">{selected.tags.map(t=><span key={t}>{t}</span>)}</div>}<div className="modal-footer"><div className="modal-qty"><button onClick={()=>setModalQty(q=>Math.max(1,q-1))}><Minus/></button><span>{modalQty}</span><button onClick={()=>setModalQty(q=>q+1)}><Plus/></button></div><button className="btn red" onClick={()=>{setCart(c=>({...c,[selected.id]: (c[selected.id]||0)+modalQty})) ;setSelected(null)}}>Añadir · {((selected.price*modalQty)).toFixed(2).replace('.',',')} €</button></div></div></div></div>}

    {galleryIndex!==null&&<div className="lightbox" role="dialog" aria-modal="true" onMouseDown={e=>e.target===e.currentTarget&&setGalleryIndex(null)}><button className="light-close" onClick={()=>setGalleryIndex(null)}><X/></button><button className="light-nav left" onClick={()=>setGalleryIndex((galleryIndex-1+gallery.length)%gallery.length)}><ChevronLeft/></button><img src={gallery[galleryIndex]} alt="Imagen ampliada de You Sushi"/><button className="light-nav right" onClick={()=>setGalleryIndex((galleryIndex+1)%gallery.length)}><ChevronRight/></button></div>}

    {cartOpen&&<div className="cart-overlay" onMouseDown={e=>e.target===e.currentTarget&&setCartOpen(false)}><aside className="cart-drawer" aria-label="Pedido"><div className="cart-header"><div><p>{orderStep==='cart'?'Tu pedido':orderStep==='details'?'Datos del pedido':'Resumen'}</p><span>{count} productos</span></div><button onClick={()=>setCartOpen(false)}><X/></button></div>
      {orderStep==='cart'&&(!cartItems.length?<div className="empty-cart"><ShoppingBag/><h3>Tu pedido está vacío</h3><p>Añade tus platos favoritos desde la carta.</p><button className="btn red" onClick={()=>{setCartOpen(false);scrollTo('carta')}}>Explorar la carta</button></div>:<><div className="cart-items">{cartItems.map(p=><div className="cart-item" key={p.id}><SafeImage src={p.image} alt={p.name}/><div><strong>{p.name}</strong><span>{p.price.toFixed(2).replace('.',',')} €</span><div className="qty"><button onClick={()=>changeQty(p.id,-1)}><Minus size={14}/></button><b>{cart[p.id]}</b><button onClick={()=>changeQty(p.id,1)}><Plus size={14}/></button></div></div><button className="remove" onClick={()=>changeQty(p.id,-cart[p.id])}><Trash2 size={16}/></button></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><strong>{total.toFixed(2).replace('.',',')} €</strong></div><div><span>Total</span><strong>{total.toFixed(2).replace('.',',')} €</strong></div></div><div className="cart-actions"><button className="btn red" onClick={()=>setOrderStep('details')}>Continuar pedido <ArrowRight size={17}/></button><button className="clear" onClick={()=>setCart({})}>Vaciar pedido</button></div></>)}
      {orderStep==='details'&&<div className="order-form"><label>Nombre*<input value={order.name} onChange={e=>setOrder({...order,name:e.target.value})}/></label><label>Teléfono*<input type="tel" value={order.phone} onChange={e=>setOrder({...order,phone:e.target.value})}/></label><label>Modalidad<select value={order.mode} onChange={e=>setOrder({...order,mode:e.target.value})}><option>Recoger en el restaurante</option><option>Consultar entrega a domicilio</option></select></label><label>Hora deseada<input type="time" value={order.time} onChange={e=>setOrder({...order,time:e.target.value})}/></label><label>Observaciones<textarea value={order.notes} onChange={e=>setOrder({...order,notes:e.target.value})}/></label><label>Alergias o indicaciones<textarea value={order.allergies} onChange={e=>setOrder({...order,allergies:e.target.value})}/></label><p className="pending-note">El pedido quedará pendiente de confirmación por el restaurante.</p><div className="order-form-actions"><button className="btn outline" onClick={()=>setOrderStep('cart')}>Volver</button><button className="btn red" disabled={!order.name.trim()||!/^[+()\d\s-]{9,}$/.test(order.phone)} onClick={()=>setOrderStep('summary')}>Ver resumen</button></div></div>}
      {orderStep==='summary'&&<div className="order-summary"><div className="summary-client"><strong>{order.name}</strong><span>{order.phone}</span><span>{order.mode}</span>{order.time&&<span>Hora: {order.time}</span>}</div><div className="summary-items">{cartItems.map(p=><div key={p.id}><span>{cart[p.id]} × {p.name}</span><strong>{(cart[p.id]*p.price).toFixed(2).replace('.',',')} €</strong></div>)}</div><div className="summary-total"><span>Total</span><strong>{total.toFixed(2).replace('.',',')} €</strong></div>{order.notes&&<p><strong>Observaciones:</strong> {order.notes}</p>}<p><strong>Alergias:</strong> {order.allergies||'Ninguna indicada'}</p><p className="pending-note">El pedido no queda confirmado hasta que el restaurante responda.</p><div className="cart-actions"><button className="btn copy" onClick={copyOrder}>Copiar pedido</button><button className="btn call" onClick={()=>window.location.href=`tel:${restaurant.phoneInternational}`}><Phone size={16}/> Llamar al restaurante</button><button className="clear" onClick={()=>setOrderStep('details')}>Modificar datos</button></div>{copyFeedback&&<p className="copy-feedback" role="status">{copyFeedback}</p>}</div>}
    </aside></div>}
  </>;
}
