import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock3,
  Mail, MapPin, Menu, Minus, Phone, Plus, Search, ShoppingBag,
  Trash2, X, UtensilsCrossed,
} from 'lucide-react';

type Product = {
  id: number; name: string; category: string; price: number;
  description: string; pieces?: string; image: string; tags?: string[];
};

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=88`;

const sushi = img('photo-1579871494447-9811cf80d66c');
const ramen = img('photo-1569718212165-3a8278d5f624');
const gyoza = img('photo-1496116218417-1a781b1c416c');
const rice = img('photo-1603133872878-684f208fb84b');
const sashimi = img('photo-1534482421-64566f976cfa');
const tempura = img('photo-1617196034183-421b4917c92d');
const restaurant = img('photo-1514933651103-005eec06c04b');

const products: Product[] = [
  { id:1, name:'Sonomono', category:'Entrantes', price:4.95, description:'Ensalada japonesa tradicional con un aderezo fresco y ligero.', image:img('photo-1547592180-85f173990554') },
  { id:2, name:'Ensalada wakame', category:'Ensaladas', price:6.90, description:'Alga wakame sazonada con aceite de sésamo y semillas.', image:img('photo-1540420773420-3366772f4999'), tags:['Vegetariano'] },
  { id:3, name:'Edamame', category:'Entrantes', price:6.00, description:'Vainas de soja al vapor con sal marina.', image:img('photo-1534939561126-855b8675edd7'), tags:['Vegetariano'] },
  { id:4, name:'Harumi', category:'Entrantes', price:4.50, description:'Entrante japonés para compartir.', image:img('photo-1551024506-0bccd828d307') },
  { id:5, name:'Gyoza', category:'Entrantes', price:5.00, description:'Empanadillas japonesas rellenas y cocinadas al vapor y plancha.', pieces:'5 uds.', image:gyoza },
  { id:6, name:'Yakiroti', category:'Entrantes', price:6.50, description:'Brocheta japonesa a la parrilla con salsa tradicional.', pieces:'2 uds.', image:img('photo-1529042410759-befb1204b468') },
  { id:7, name:'Ramen', category:'Sopas y ramen', price:7.50, description:'Sopa japonesa de fideos con caldo, verduras y toppings.', image:ramen },
  { id:8, name:'Sopa udon', category:'Sopas y ramen', price:9.50, description:'Fideos udon en caldo caliente con acompañamientos.', image:img('photo-1617093727343-374698b1b08d') },
  { id:9, name:'Gohan', category:'Platos calientes', price:2.80, description:'Arroz japonés blanco al vapor.', image:rice, tags:['Vegetariano'] },
  { id:10, name:'Arroz frito', category:'Platos calientes', price:5.00, description:'Arroz salteado al estilo japonés.', image:rice },
  { id:11, name:'Yakisoba', category:'Platos calientes', price:7.90, description:'Fideos de trigo salteados con verduras y salsa especial.', image:img('photo-1617622141575-d7b5d31b3f1c') },
  { id:12, name:'Tartar de salmón', category:'Platos calientes', price:10.50, description:'Salmón fresco picado con aliño japonés.', image:sashimi, tags:['Pescado fresco'] },
  { id:13, name:'Kimuchi de atún o salmón', category:'Platos calientes', price:11.90, description:'Selección de atún o salmón con kimuchi.', image:sashimi },
  { id:14, name:'Tartar de atún', category:'Platos calientes', price:12.50, description:'Atún de calidad picado y aliñado al estilo japonés.', image:sashimi },
  { id:15, name:'Yasai', category:'Platos calientes', price:7.80, description:'Selección de verduras preparadas al estilo japonés.', image:img('photo-1546069901-ba9599a7e63c'), tags:['Vegetariano'] },
  { id:16, name:'Torino karake', category:'Frituras y tempuras', price:8.80, description:'Pollo crujiente con salsa karake.', image:img('photo-1562967914-608f82629710') },
  { id:17, name:'Pato frito laqueado', category:'Frituras y tempuras', price:14.90, description:'Pato frito laqueado con acabado crujiente.', image:img('photo-1514516345957-556ca7d90a39') },
  { id:18, name:'Ebi Frajy', category:'Frituras y tempuras', price:11.90, description:'Langostinos fritos crujientes.', pieces:'6 uds.', image:tempura },
  { id:19, name:'Tempura verduras', category:'Frituras y tempuras', price:10.90, description:'Verduras frescas rebozadas en tempura ligera.', pieces:'7 uds.', image:tempura, tags:['Vegetariano'] },
  { id:20, name:'Tempura mixta', category:'Frituras y tempuras', price:11.90, description:'Selección crujiente de marisco y verduras.', pieces:'6 uds.', image:tempura },
  { id:21, name:'Tempura mix You', category:'Frituras y tempuras', price:13.90, description:'Gran selección de tempura de la casa.', pieces:'Mix', image:tempura },
  { id:22, name:'Arroz con anguila', category:'Platos calientes', price:15.90, description:'Arroz acompañado de anguila a la plancha.', image:rice },
  { id:23, name:'Teriyaki de pollo', category:'Platos calientes', price:9.90, description:'Pollo a la plancha glaseado con salsa teriyaki.', image:img('photo-1547592180-85f173990554') },
  { id:24, name:'Entrecot Mix You', category:'Platos calientes', price:14.90, description:'Entrecot a la plancha con toque japonés.', image:img('photo-1544025162-d76694265947') },
  { id:25, name:'Solomillo', category:'Platos calientes', price:14.90, description:'Solomillo a la plancha.', image:img('photo-1544025162-d76694265947') },
  { id:26, name:'Tataki de atún', category:'Platos calientes', price:13.90, description:'Atún sellado por fuera y tierno por dentro.', image:sashimi },
  { id:27, name:'Ika', category:'Nigiris', price:2.70, description:'Nigiri de calamar.', pieces:'1 pieza', image:sushi },
  { id:28, name:'Tako', category:'Nigiris', price:2.70, description:'Nigiri de pulpo.', pieces:'1 pieza', image:sushi },
  { id:29, name:'Tamago', category:'Nigiris', price:2.70, description:'Nigiri de tortilla japonesa.', pieces:'1 pieza', image:sushi, tags:['Vegetariano'] },
  { id:30, name:'Hokkigai', category:'Nigiris', price:3.70, description:'Nigiri de almeja japonesa.', pieces:'1 pieza', image:sushi },
  { id:31, name:'Toro', category:'Nigiris', price:2.80, description:'Nigiri de vientre de atún.', pieces:'1 pieza', image:sushi },
  { id:32, name:'Maguro', category:'Nigiris', price:2.80, description:'Nigiri de atún.', pieces:'1 pieza', image:sushi },
  { id:33, name:'Ebi', category:'Nigiris', price:3.20, description:'Nigiri de langostino cocido.', pieces:'1 pieza', image:sushi },
  { id:34, name:'Sake', category:'Nigiris', price:2.80, description:'Nigiri de salmón.', pieces:'1 pieza', image:sushi },
  { id:35, name:'Pez mantequilla', category:'Nigiris', price:2.80, description:'Nigiri de pez mantequilla.', pieces:'1 pieza', image:sushi },
  { id:36, name:'Sake cheese', category:'Nigiris', price:3.00, description:'Nigiri de salmón con queso.', pieces:'1 pieza', image:sushi },
  { id:37, name:'Anago', category:'Nigiris', price:3.80, description:'Nigiri de anguila dulce.', pieces:'1 pieza', image:sushi },
  { id:38, name:'Tai', category:'Nigiris', price:2.80, description:'Nigiri de dorada.', pieces:'1 pieza', image:sushi },
  { id:39, name:'Saba', category:'Nigiris', price:2.60, description:'Nigiri de caballa.', pieces:'1 pieza', image:sushi },
  { id:40, name:'Hotegai', category:'Nigiris', price:3.50, description:'Nigiri de vieira japonesa.', pieces:'1 pieza', image:sushi },
  { id:41, name:'Pez mantequilla con trufa', category:'Nigiris', price:4.00, description:'Nigiri de pez mantequilla con trufa.', pieces:'1 pieza', image:sushi, tags:['Especial'] },
  { id:42, name:'Ikura', category:'Nigiris', price:4.20, description:'Nigiri con huevas de salmón.', pieces:'1 pieza', image:sushi },
  { id:43, name:'Salmón philadelphia', category:'Maki', price:4.90, description:'Maki de salmón y queso philadelphia.', pieces:'6 uds.', image:sushi },
  { id:44, name:'Maki de salmón', category:'Maki', price:4.90, description:'Maki clásico de salmón.', pieces:'6 uds.', image:sushi },
  { id:45, name:'Maki aguacate', category:'Maki', price:4.90, description:'Maki sencillo de aguacate.', pieces:'6 uds.', image:sushi, tags:['Vegetariano'] },
  { id:46, name:'Teka', category:'Maki', price:4.90, description:'Maki de atún.', pieces:'6 uds.', image:sushi },
  { id:47, name:'Kappa', category:'Maki', price:4.90, description:'Maki de pepino.', pieces:'6 uds.', image:sushi, tags:['Vegetariano'] },
  { id:48, name:'Tamago maki', category:'Maki', price:4.90, description:'Maki de tortilla japonesa.', pieces:'6 uds.', image:sushi },
  { id:49, name:'Langostinos y aguacate', category:'Maki', price:4.90, description:'Maki relleno de langostino y aguacate.', pieces:'6 uds.', image:sushi },
  { id:50, name:'Salmón tobiko', category:'Maki', price:6.90, description:'Maki de salmón con huevas tobiko.', pieces:'6 uds.', image:sushi },
  { id:51, name:'Poke de pollo', category:'Pokes', price:9.90, description:'Bol hawaiano con pollo y ingredientes frescos.', image:img('photo-1547592180-85f173990554') },
  { id:52, name:'Poke de salmón', category:'Pokes', price:11.90, description:'Bol hawaiano con salmón fresco.', image:img('photo-1547592180-85f173990554') },
  { id:53, name:'Poke de atún', category:'Pokes', price:12.90, description:'Bol hawaiano con atún fresco.', image:img('photo-1547592180-85f173990554') },
  { id:54, name:'Atún', category:'Sashimi', price:0.95, description:'Sashimi de atún.', pieces:'Por pieza', image:sashimi },
  { id:55, name:'Salmón picante', category:'Sashimi', price:0.95, description:'Sashimi de salmón con toque picante.', pieces:'Por pieza', image:sashimi, tags:['Picante'] },
  { id:56, name:'Pez mantequilla', category:'Sashimi', price:0.95, description:'Sashimi de pez mantequilla.', pieces:'Por pieza', image:sashimi },
  { id:57, name:'Maki sushi mixto', category:'Combinados y bandejas', price:7.90, description:'Selección variada de maki.', pieces:'6 uds.', image:sushi },
  { id:58, name:'Sushi mixto', category:'Combinados y bandejas', price:12.90, description:'Selección variada de sushi y nigiri.', pieces:'12 uds.', image:sushi },
  { id:59, name:'Sashimi mixto', category:'Combinados y bandejas', price:18.00, description:'Selección variada de sashimi fresco.', pieces:'18 uds.', image:sashimi },
  { id:60, name:'California', category:'California rolls', price:9.90, description:'California roll clásico.', pieces:'10 uds.', image:sushi },
  { id:61, name:'Futomaki', category:'Maki', price:9.90, description:'Maki grueso con relleno variado.', pieces:'8 uds.', image:sushi },
  { id:62, name:'Sushi bar roll', category:'Especialidades', price:13.90, description:'Roll especial de la casa.', pieces:'10 uds.', image:sushi, tags:['Especial'] },
  { id:63, name:'Honshu', category:'Especialidades', price:10.90, description:'Especialidad especial de maki.', pieces:'10 uds.', image:sushi },
  { id:64, name:'Kyoto roll', category:'Especialidades', price:12.90, description:'Roll inspirado en Kyoto.', pieces:'10 uds.', image:sushi },
  { id:65, name:'Tokio roll', category:'Especialidades', price:12.90, description:'Roll inspirado en Tokio.', pieces:'10 uds.', image:sushi },
  { id:66, name:'Dragon Fly Osaka', category:'Especialidades', price:12.90, description:'Especialidad de maki de Osaka.', pieces:'10 uds.', image:sushi },
  { id:67, name:'Yokohama', category:'Especialidades', price:12.90, description:'Especialidad de maki de Yokohama.', pieces:'10 uds.', image:sushi },
  { id:68, name:'California rainbow', category:'Especialidades', price:12.90, description:'California roll cubierto con una selección de pescado.', pieces:'10 uds.', image:sushi },
  { id:69, name:'Refresco', category:'Bebidas', price:2.00, description:'Bebida refrescante.', image:img('photo-1544145945-f90425340c7e') },
  { id:70, name:'Cerveza', category:'Bebidas', price:2.00, description:'Cerveza fría.', image:img('photo-1516450360452-9312f5e86fc7') },
  { id:71, name:'Agua', category:'Bebidas', price:2.00, description:'Agua mineral.', image:img('photo-1548839140-29a749e1cf4d') },
];

const menus: Product[] = [
  { id:101, name:'Nigiri mixto', category:'Menús individuales', price:11, pieces:'8 piezas', description:'2 atún, 2 salmón, 2 ebi, 1 lubina y tamago.', image:sushi },
  { id:102, name:'Mix lunch', category:'Menús individuales', price:12, pieces:'14 piezas', description:'2 atún y 2 salmón; 3 atún y 3 salmón; 3 piezas de pez mantequilla.', image:sashimi },
  { id:103, name:'Menú mixto', category:'Menús individuales', price:22, pieces:'17 piezas', description:'Nigiri variado, sashimi y California de salmón.', image:sushi },
  { id:104, name:'Temaki mixto', category:'Menús individuales', price:19, pieces:'4 temakis', description:'1 California, 1 atún y 2 salmón.', image:sushi },
  { id:105, name:'Maki mixto', category:'Menús individuales', price:12.5, pieces:'18 piezas', description:'6 salmón, 6 atún y 6 aguacate.', image:sushi },
  { id:106, name:'Sushi bar mix', category:'Menús individuales', price:16, pieces:'16 piezas', description:'2 nigiri salmón, 2 atún, 6 maki salmón y 6 sashimi.', image:sushi },
  { id:107, name:'Sushi bar', category:'Menús individuales', price:18, pieces:'18 piezas', description:'Maki aguacate y salmón, California atún y mayonesa.', image:sushi },
  { id:108, name:'Menú love', category:'Menús para compartir', price:22.9, pieces:'24 piezas', description:'Nigiri variado, maki aguacate y maki salmón.', image:sushi, tags:['Para compartir'] },
  { id:109, name:'Menú trío', category:'Menús para compartir', price:43, pieces:'44 piezas', description:'Nigiri, maki y California en una selección extensa.', image:sushi, tags:['Para compartir'] },
  { id:110, name:'Menú friends', category:'Menús para compartir', price:82, pieces:'88 piezas', description:'Gran selección de nigiri, maki y California para compartir.', image:sushi, tags:['Para grupos'] },
  { id:111, name:'Menú especial', category:'Menús para compartir', price:43, pieces:'44 piezas', description:'Nigiri variado, California y sashimi.', image:sushi, tags:['Especial'] },
  { id:112, name:'Bandeja roja', category:'Combinados y bandejas', price:55, pieces:'56 piezas', description:'8 nigiri variado, 24 maki variado y 24 California variado.', image:sushi, tags:['Bandeja'] },
];

const categories = ['Todos','Entrantes','Ensaladas','Sopas y ramen','Platos calientes','Frituras y tempuras','Nigiris','Maki','California rolls','Sashimi','Combinados y bandejas','Pokes','Especialidades','Bebidas','Menús individuales','Menús para compartir'];
const allProducts = [...products, ...menus];

function App() {
  const [mobileOpen,setMobileOpen] = useState(false);
  const [search,setSearch] = useState('');
  const [category,setCategory] = useState('Todos');
  const [cartOpen,setCartOpen] = useState(false);
  const [cart,setCart] = useState<Record<number,number>>(() => {
    try { return JSON.parse(localStorage.getItem('you-sushi-cart') || '{}'); } catch { return {}; }
  });
  const [selected,setSelected] = useState<Product|null>(null);
  const [galleryIndex,setGalleryIndex] = useState<number|null>(null);
  const [reservation,setReservation] = useState({name:'',phone:'',date:'',time:'',people:'2',comment:''});
  const [reservationReady,setReservationReady] = useState(false);

  useEffect(() => localStorage.setItem('you-sushi-cart',JSON.stringify(cart)),[cart]);

  const filtered = useMemo(() => allProducts.filter(p =>
    (category === 'Todos' || p.category === category) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
  ),[category,search]);

  const count = Object.values(cart).reduce((a,b) => a+b,0);
  const total = allProducts.reduce((sum,p) => sum + (cart[p.id] || 0) * p.price,0);
  const cartItems = allProducts.filter(p => cart[p.id]);

  const changeQty = (id:number,delta:number) => setCart(c => {
    const next = (c[id] || 0) + delta;
    const copy = {...c};
    if (next <= 0) delete copy[id]; else copy[id] = next;
    return copy;
  });

  const orderText = () => 'Hola, You Sushi. Quiero hacer un pedido:\n\n' +
    cartItems.map(p => `${cart[p.id]} × ${p.name} — ${(cart[p.id]*p.price).toFixed(2)} €`).join('\n') +
    `\n\nTotal: ${total.toFixed(2)} €\n\nMi nombre y hora deseada:`;

  const copyOrder = async () => navigator.clipboard?.writeText(orderText());
  const reservationText = () =>
    `Hola, You Sushi. Solicito una reserva:\nNombre: ${reservation.name}\nTeléfono: ${reservation.phone}\nFecha: ${reservation.date}\nHora: ${reservation.time}\nPersonas: ${reservation.people}\nComentarios: ${reservation.comment || 'Ninguno'}\n\nQuedo pendiente de confirmación.`;

  const gallery = [sushi,sashimi,ramen,tempura,gyoza,rice,restaurant,img('photo-1553621042-f6e147245754'),img('photo-1569050467447-ce54b3bbc37d')];

  const scrollTo = (id:string) => {
    document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
    setMobileOpen(false);
  };

  return (
    <>
      <header className="header">
        <button className="brand" onClick={() => scrollTo('inicio')} aria-label="Ir al inicio">
          <span className="brand-mark">友</span>
          <span><strong>YOU</strong>SUSHI</span>
        </button>
        <nav className={mobileOpen ? 'nav open' : 'nav'} aria-label="Navegación principal">
          <button onClick={() => scrollTo('inicio')}>Inicio</button>
          <button onClick={() => scrollTo('historia')}>Nuestra historia</button>
          <button onClick={() => scrollTo('carta')}>Carta</button>
          <button onClick={() => scrollTo('menus')}>Menús</button>
          <button onClick={() => scrollTo('galeria')}>Galería</button>
          <button onClick={() => scrollTo('contacto')}>Contacto</button>
        </nav>
        <button className="header-order" onClick={() => setCartOpen(true)}>Pedir ahora <ArrowRight size={16}/></button>
        <button className="menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Abrir menú">{mobileOpen?<X/>:<Menu/>}</button>
      </header>

      <main>
        <section className="hero" id="inicio">
          <img src={sushi} alt="Selección de sushi japonés" />
          <div className="hero-shade" />
          <div className="hero-content reveal">
            <p className="eyebrow">RESTAURANTE JAPONES · SEVILLA</p>
            <h1>El auténtico sabor<br/>de Japón en Sevilla</h1>
            <p className="hero-copy">Descubre nuestra selección de sushi, sashimi y especialidades japonesas.</p>
            <div className="hero-actions">
              <button className="btn primary" onClick={() => scrollTo('carta')}>Descubrir la carta</button>
              <button className="btn ghost" onClick={() => setCartOpen(true)}><ShoppingBag size={18}/> Hacer un pedido</button>
            </div>
          </div>
          <div className="hero-location"><MapPin size={16}/> Santa María la Blanca, 23 · Sevilla</div>
        </section>

        <section className="story section" id="historia">
          <div className="story-image">
            <img src={restaurant} alt="Interior y ambiente de un restaurante japonés"/>
            <div className="story-badge"><UtensilsCrossed/><span>Hecho con cuidado</span></div>
          </div>
          <div className="story-copy">
            <p className="eyebrow dark">BIENVENIDOS A YOU SUSHI</p>
            <h2>Japón, en el corazón<br/>del Casco Antiguo</h2>
            <p>Una propuesta japonesa cercana y cuidada en pleno centro histórico de Sevilla. Sushi elaborado con atención al detalle, platos calientes, ramen y especialidades para disfrutar en el local o para llevar.</p>
            <div className="story-values">
              <div><strong>01</strong><span>Cocina japonesa</span></div>
              <div><strong>02</strong><span>Variedad fresca</span></div>
              <div><strong>03</strong><span>Para comer aquí o llevar</span></div>
            </div>
          </div>
        </section>

        <section className="menu-section section" id="carta">
          <div className="section-heading">
            <div><p className="eyebrow dark">CARTA DIGITAL</p><h2>Nuestra selección</h2></div>
            <div className="search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar plato..." aria-label="Buscar plato"/></div>
          </div>
          <div className="category-row">
            {categories.map(c => <button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}
          </div>
          <div className="product-grid">
            {filtered.map(p => (
              <article className="product-card" key={p.id}>
                <button className="product-image" onClick={()=>setSelected(p)} aria-label={`Ver detalles de ${p.name}`}>
                  <img src={p.image} alt={p.name} loading="lazy"/>
                  {p.tags?.[0] && <span>{p.tags[0]}</span>}
                </button>
                <div className="product-info">
                  <p className="product-category">{p.category}</p>
                  <button className="product-name" onClick={()=>setSelected(p)}>{p.name}</button>
                  <p className="product-desc">{p.description}</p>
                  {p.pieces && <p className="pieces">{p.pieces}</p>}
                  <div className="product-bottom"><strong>{p.price.toFixed(2).replace('.',',')} €</strong><button onClick={()=>changeQty(p.id,1)} aria-label={`Añadir ${p.name}`}><Plus size={18}/></button></div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="menus-section section" id="menus">
          <div className="section-heading light">
            <div><p className="eyebrow">PARA COMPARTIR</p><h2>Menús & combinados</h2></div>
            <p>Selecciones completas para comer solo o reunirse alrededor de una buena mesa.</p>
          </div>
          <div className="menu-grid">
            {menus.map(p => (
              <article className="menu-card" key={p.id}>
                <img src={p.image} alt={p.name} loading="lazy"/>
                <div className="menu-card-content">
                  <div><p>{p.category}</p><h3>{p.name}</h3></div>
                  <p className="menu-desc">{p.description}</p>
                  {p.pieces && <span className="menu-pieces">{p.pieces}</span>}
                  <div className="menu-bottom"><strong>{p.price.toFixed(2).replace('.',',')} €</strong><button onClick={()=>changeQty(p.id,1)}><Plus size={16}/> Añadir</button></div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="reservation section" id="reservas">
          <div className="reservation-copy">
            <p className="eyebrow dark">TU PRÓXIMA MESA</p>
            <h2>Ven a vivir<br/>la experiencia You Sushi</h2>
            <p>Solicita tu mesa y el equipo del restaurante podrá confirmar la disponibilidad.</p>
            <a href="tel:+34954522282" className="text-link"><Phone size={17}/> ¿Prefieres llamar? 954 522 282</a>
          </div>
          <form className="reservation-form" onSubmit={e=>{e.preventDefault(); setReservationReady(true);}}>
            <div className="form-row"><label>Nombre<input required value={reservation.name} onChange={e=>setReservation({...reservation,name:e.target.value})}/></label><label>Teléfono<input required type="tel" value={reservation.phone} onChange={e=>setReservation({...reservation,phone:e.target.value})}/></label></div>
            <div className="form-row"><label>Fecha<input required type="date" value={reservation.date} onChange={e=>setReservation({...reservation,date:e.target.value})}/></label><label>Hora<input required type="time" value={reservation.time} onChange={e=>setReservation({...reservation,time:e.target.value})}/></label></div>
            <label>Personas<select value={reservation.people} onChange={e=>setReservation({...reservation,people:e.target.value})}>{[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n} value={n}>{n} {n===1?'persona':'personas'}</option>)}</select></label>
            <label>Comentarios<textarea value={reservation.comment} onChange={e=>setReservation({...reservation,comment:e.target.value})} placeholder="Alergias u otras indicaciones"/></label>
            {reservationReady ? <div className="reservation-ready"><p>Solicitud preparada. Será necesaria la confirmación del restaurante.</p><a className="btn primary" href={`https://wa.me/34954522282?text=${encodeURIComponent(reservationText())}`} target="_blank" rel="noreferrer">Enviar por WhatsApp</a></div> : <button className="btn primary" type="submit">Preparar reserva <CalendarDays size={17}/></button>}
          </form>
        </section>

        <section className="gallery section" id="galeria">
          <div className="section-heading">
            <div><p className="eyebrow dark">GALERÍA</p><h2>Momentos You Sushi</h2></div>
            <p>Sabores frescos, detalles cuidados y ambiente japonés.</p>
          </div>
          <div className="gallery-grid">
            {gallery.map((src,i)=><button key={i} className={`gallery-item g${i+1}`} onClick={()=>setGalleryIndex(i)}><img src={src} alt={`Selección gastronómica You Sushi ${i+1}`} loading="lazy"/><span><Plus size={22}/></span></button>)}
          </div>
        </section>

        <section className="social section">
          <div><p className="eyebrow dark">SÍGUENOS</p><h2>Síguenos y descubre You Sushi</h2></div>
          <div className="social-links">
            <a href="https://www.facebook.com/people/You-Sushi-Japanese-Restaurant/" target="_blank" rel="noreferrer"><span aria-hidden="true">f</span> Facebook</a>
            <a href="mailto:yousushisevilla@gmail.com"><Mail size={20}/> Contactar</a>
          </div>
        </section>

        <section className="contact" id="contacto">
          <div className="contact-map">
            <iframe title="Mapa You Sushi Sevilla" src="https://www.google.com/maps?q=Calle+Santa+Mar%C3%ADa+la+Blanca+23+Sevilla&output=embed" loading="lazy"/>
          </div>
          <div className="contact-copy">
            <p className="eyebrow dark">TU JAPÓN EN SEVILLA</p><h2>Estamos aquí</h2>
            <address><MapPin/><span>Calle Santa María la Blanca, 23<br/>41004 Sevilla, España</span></address>
            <a href="tel:+34954522282"><Phone/><span>954 522 282</span></a>
            <a href="mailto:yousushisevilla@gmail.com"><Mail/><span>yousushisevilla@gmail.com</span></a>
            <div className="hours"><Clock3/><div><strong>Horario</strong><span>Debes confirmarlo directamente con el restaurante.</span></div></div>
            <div className="contact-actions"><a className="btn primary" href="https://www.google.com/maps/search/?api=1&query=Calle+Santa+Mar%C3%ADa+la+Blanca+23+Sevilla" target="_blank" rel="noreferrer">Cómo llegar</a><button className="btn outline" onClick={()=>scrollTo('reservas')}>Reservar mesa</button></div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-brand"><span className="brand-mark">友</span><div><strong>YOU SUSHI</strong><p>Cocina japonesa en Sevilla</p></div></div>
        <div className="footer-links"><button onClick={()=>scrollTo('historia')}>Nuestra historia</button><button onClick={()=>scrollTo('carta')}>Carta</button><button onClick={()=>scrollTo('reservas')}>Reservas</button><button onClick={()=>scrollTo('contacto')}>Contacto</button></div>
        <div className="footer-contact"><p>Calle Santa María la Blanca, 23<br/>41004 Sevilla</p><a href="tel:+34954522282">954 522 282</a><a href="mailto:yousushisevilla@gmail.com">yousushisevilla@gmail.com</a></div>
        <div className="footer-bottom"><span>© 2026 You Sushi Sevilla</span><span>Privacidad · Aviso legal</span></div>
      </footer>

      <button className="floating-cart" onClick={()=>setCartOpen(true)} aria-label="Abrir pedido"><ShoppingBag/><span>{count}</span></button>

      {selected && <div className="overlay" role="dialog" aria-modal="true" onClick={()=>setSelected(null)}>
        <div className="product-modal" onClick={e=>e.stopPropagation()}>
          <button className="modal-close" onClick={()=>setSelected(null)}><X/></button>
          <img src={selected.image} alt={selected.name}/>
          <div className="modal-copy"><p className="eyebrow dark">{selected.category}</p><h2>{selected.name}</h2><p>{selected.description}</p>{selected.pieces&&<span className="pieces">{selected.pieces}</span>}<div className="modal-bottom"><strong>{selected.price.toFixed(2).replace('.',',')} €</strong><button className="btn primary" onClick={()=>changeQty(selected.id,1)}><Plus size={17}/> Añadir al pedido</button></div></div>
        </div>
      </div>}

      {galleryIndex!==null && <div className="lightbox" role="dialog" aria-modal="true" onClick={()=>setGalleryIndex(null)}>
        <button className="light-close" onClick={()=>setGalleryIndex(null)}><X/></button>
        <button className="light-nav left" onClick={e=>{e.stopPropagation();setGalleryIndex((galleryIndex-1+gallery.length)%gallery.length)}}><ChevronLeft/></button>
        <img src={gallery[galleryIndex]} alt="Imagen ampliada de You Sushi" onClick={e=>e.stopPropagation()}/>
        <button className="light-nav right" onClick={e=>{e.stopPropagation();setGalleryIndex((galleryIndex+1)%gallery.length)}}><ChevronRight/></button>
      </div>}

      {cartOpen && <div className="cart-overlay" onClick={()=>setCartOpen(false)}>
        <aside className="cart" onClick={e=>e.stopPropagation()}>
          <div className="cart-header"><div><p>Tu pedido</p><span>{count} {count===1?'producto':'productos'}</span></div><button onClick={()=>setCartOpen(false)}><X/></button></div>
          {cartItems.length ? <>
            <div className="cart-items">{cartItems.map(p=><div className="cart-item" key={p.id}><img src={p.image} alt={p.name}/><div><strong>{p.name}</strong><span>{p.price.toFixed(2).replace('.',',')} €</span><div className="qty"><button onClick={()=>changeQty(p.id,-1)}><Minus size={14}/></button><span>{cart[p.id]}</span><button onClick={()=>changeQty(p.id,1)}><Plus size={14}/></button></div></div><button className="remove" onClick={()=>changeQty(p.id,-cart[p.id])}><Trash2 size={16}/></button></div>)}</div>
            <div className="cart-summary"><div><span>Subtotal</span><strong>{total.toFixed(2).replace('.',',')} €</strong></div><div><span>Total</span><strong>{total.toFixed(2).replace('.',',')} €</strong></div></div>
            <div className="cart-actions"><button className="btn whatsapp" onClick={()=>window.open(`https://wa.me/34954522282?text=${encodeURIComponent(orderText())}`,'_blank','noopener,noreferrer')}>Enviar por WhatsApp</button><button className="btn copy" onClick={copyOrder}>Copiar pedido</button><button className="btn call" onClick={()=>window.location.href='tel:+34954522282'}><Phone size={16}/> Llamar al restaurante</button><button className="clear" onClick={()=>setCart({})}>Vaciar pedido</button></div>
          </> : <div className="empty-cart"><ShoppingBag/><h3>Tu pedido está vacío</h3><p>Añade tus platos favoritos desde la carta.</p><button className="btn primary" onClick={()=>{setCartOpen(false);scrollTo('carta')}}>Explorar la carta</button></div>}
        </aside>
      </div>}
    </>
  );
}

export default App;
