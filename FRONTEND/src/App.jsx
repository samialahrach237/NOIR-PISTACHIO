import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, ArrowLeft, ArrowRight, Camera, MapPin, Menu as MenuIcon, Phone, Play, Star, X } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { siteConfig as site } from './data/siteConfig';
import { createOrder, createReservation, getFeaturedProduct, getGallery, getProducts, getReviews, getAdminStats, login, sendContactMessage } from './services/api';

gsap.registerPlugin(ScrollTrigger);

const categories = ['All', 'Coffee', 'Iced Coffee', 'Desserts', 'Breakfast'];

const imageUrl = value => value || '';
const chapters = [
  { number: '01', title: 'The base', copy: 'Every great coffee starts with the right foundation.', at: 0.08 },
  { number: '02', title: 'The espresso', copy: 'Bold espresso meets silky milk.', at: 0.29 },
  { number: '03', title: 'The pistachio', copy: 'A touch of pistachio makes it unforgettable.', at: 0.54 },
  { number: '04', title: 'The finish', copy: 'Finished with cream, cocoa and a little magic.', at: 0.72 },
];

function Button({ children, onClick, href, variant = 'dark', className = '' }) {
  const content = <>{children}<ArrowUpRight size={15} strokeWidth={1.7} /></>;
  const props = { className: `button button--${variant} ${className}` };
  if (href) return <a href={href} {...props}>{content}</a>;
  return <button onClick={onClick} {...props}>{content}</button>;
}

function Navbar({ onMenu }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);
  const links = [['Home', 'home'], ['Menu', 'menu'], ['About', 'about'], ['Gallery', 'gallery'], ['Contact', 'contact']];
  return <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
    <a className="brand" href="#home" aria-label={`${site.brand.name} home`}><span>{site.brand.mark}</span>{site.brand.name}</a>
    <nav className="nav-links" aria-label="Main navigation">{links.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>
    <Button href="#menu" variant={scrolled ? 'dark' : 'light'} className="nav-order">Order now</Button>
    <button className="menu-toggle" aria-label="Open navigation menu" onClick={onMenu}><MenuIcon size={23} /></button>
  </header>;
}

function MobileMenu({ open, onClose }) {
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  if (!open) return null;
  return <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">
    <div className="mobile-menu__top"><span className="brand"><span>{site.brand.mark}</span>{site.brand.name}</span><button className="icon-button" onClick={onClose} aria-label="Close navigation menu"><X /></button></div>
    <nav>{[['Home', 'home'], ['Menu', 'menu'], ['About', 'about'], ['Gallery', 'gallery'], ['Contact', 'contact']].map(([label, id]) => <a onClick={onClose} href={`#${id}`} key={id}>{label}<ArrowUpRight /></a>)}</nav>
    <p>{site.brand.tagline}</p>
  </div>;
}

function Hero() {
  return <section className="hero" id="home">
    <div className="hero__image" />
    <div className="hero__veil" />
    <div className="hero__content container">
      <p className="eyebrow reveal">{site.hero.eyebrow}</p>
      <h1 className="hero__title"><span>Slow coffee.</span><span>Beautiful moments.</span></h1>
      <p className="hero__description reveal">{site.hero.description}</p>
      <div className="hero__actions reveal"><Button href="#menu" variant="light">View menu</Button><Button href="#contact" variant="outline-light">Visit us</Button></div>
    </div>
    <a className="scroll-cue" href="#experience"><span>Scroll to explore</span><ArrowDown size={15} /></a>
    <div className="hero__stamp">N/P<br /><span>Specialty coffee<br />& sweet moments</span></div>
  </section>;
}

function DrinkVisual({ stage }) {
  const milk = Math.min(1, Math.max(0, (stage - 0.12) / 0.24));
  const espresso = Math.min(1, Math.max(0, (stage - 0.29) / 0.15));
  const pistachio = Math.min(1, Math.max(0, (stage - 0.47) / 0.16));
  const finish = Math.min(1, Math.max(0, (stage - 0.66) / 0.22));
  return <div className="drink-scene" aria-label="Layered illustration of a pistachio tiramisu iced latte">
    <div className="drink-shadow" />
    <div className="drink-glass"><div className="glass-shine" /><div className="ice ice-a" style={{ opacity: 0.35 + stage * 0.65 }} /><div className="ice ice-b" style={{ opacity: 0.35 + stage * 0.65 }} /><div className="ice ice-c" style={{ opacity: 0.35 + stage * 0.65 }} /><div className="drink-milk" style={{ height: `${milk * 69}%` }} /><div className="drink-espresso" style={{ height: `${espresso * 30}%`, bottom: `${39 - (1 - espresso) * 30}%`, opacity: espresso }} /><div className="drink-pistachio" style={{ bottom: `${27 - (1 - pistachio) * 20}%`, opacity: pistachio }} /><div className="drink-foam" style={{ opacity: finish }} /><div className="drink-cocoa" style={{ opacity: finish }} /></div>
    <div className="ribbon ribbon-a" style={{ opacity: pistachio * 0.7 }} /><div className="ribbon ribbon-b" style={{ opacity: pistachio * 0.7 }} />
    <div className="drink-label" style={{ opacity: 0.4 + finish * 0.45 }}>N/P</div>
  </div>;
}

function CoffeeExperience() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [chapter, setChapter] = useState(chapters[0]);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      ScrollTrigger.create({ trigger: sectionRef.current, start: 'top top', end: '+=2200', pin: true, scrub: reduce ? false : 0.8, invalidateOnRefresh: true, onUpdate: self => { const value = self.progress; setProgress(value); setChapter([...chapters].reverse().find(item => value >= item.at) || chapters[0]); } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);
  return <section className="experience" id="experience" ref={sectionRef}>
    <div className="experience__inner container">
      <div className="experience__copy"><p className="eyebrow">A study in layers</p><div className="chapter-count">{chapter.number}<span>/ 04</span></div><h2>{chapter.title}</h2><p className="chapter-copy">{chapter.copy}</p><div className="chapter-list">{chapters.map(item => <div className={item.number === chapter.number ? 'active' : ''} key={item.number}><span>{item.number}</span><span>{item.title}</span></div>)}</div></div>
      <DrinkVisual stage={progress} />
      <div className="experience__meta"><span>Scroll to compose</span><div className="progress-line"><i style={{ transform: `scaleX(${Math.max(progress, 0.06)})` }} /></div><span>01 — 04</span></div>
    </div>
  </section>;
}

function Signature() {
  const [product, setProduct] = useState(null);
  useEffect(() => { getFeaturedProduct().then(setProduct).catch(() => setProduct(null)); }, []);
  const featured = product || { name: site.signature.name, description: site.signature.description, image: site.signature.image };
  return <section className="signature section-pad"><div className="container signature__grid"><div className="signature__image image-wrap"><img src={imageUrl(featured.image)} alt="Iced latte with layers of milk and espresso" /><span className="image-note">01 / signature pour</span></div><div className="signature__copy"><p className="eyebrow">The house favorite</p><h2>{featured.name}</h2><p>{featured.description}</p><Button href="#menu">Order now</Button><div className="signature__detail"><span>01</span><span>Espresso / Pistachio / Tiramisu</span></div></div></div></section>;
}

function Menu({ onAdd }) {
  const [active, setActive] = useState('All');
  const [items, setItems] = useState(site.menu);
  useEffect(() => { getProducts().then(products => setItems(products.map(item => ({ ...item, category: item.category?.name, price: `${item.price} MAD` })))).catch(() => {}); }, []);
  const visibleItems = active === 'All' ? items : items.filter(item => item.category === active);
  return <section className="menu-section section-pad" id="menu"><div className="container"><div className="section-heading"><div><p className="eyebrow">Made to order</p><h2>A little something<br /><em>for every mood.</em></h2></div><p className="section-intro">Our menu follows the rhythm of the day. Familiar favorites, thoughtful twists, and things worth lingering over.</p></div><div className="filter" role="tablist" aria-label="Menu categories">{categories.map(category => <button role="tab" aria-selected={active === category} className={active === category ? 'active' : ''} onClick={() => setActive(category)} key={category}>{category}</button>)}</div><div className="menu-grid">{visibleItems.map(item => <article className="menu-item" key={item.id || item.name}><div className="menu-item__image"><img src={imageUrl(item.image)} alt={item.name} loading="lazy" /></div><div className="menu-item__info"><div><h3>{item.name}</h3><p>{item.description}</p></div><span>{item.price}</span></div><button className="menu-add" onClick={() => onAdd(item)}>Add to cart <ArrowUpRight size={14} /></button></article>)}</div></div></section>;
}

function About() {
  return <section className="about section-pad" id="about"><div className="container about__grid"><div className="about__title"><p className="eyebrow">Our point of view</p><h2>{site.about.title}</h2><span className="about__mark">N/P</span></div><div className="about__copy"><p className="lead">{site.about.text}</p><p>From the first crack of the beans to the last spoonful of cream, every detail is an invitation to stay a little longer.</p><a className="text-link" href="#contact">Come find your pause <ArrowUpRight size={16} /></a></div></div><div className="about__images container"><img className="about-img--large" src="https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1100&q=85" alt="Barista pouring latte art" loading="lazy" /><img className="about-img--small" src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=85" alt="Sunlit coffee shop seating" loading="lazy" /><span className="about__caption">Made slowly, served warmly.</span></div></section>;
}

function Gallery() {
  const [selected, setSelected] = useState(null);
  const [images, setImages] = useState(site.gallery);
  useEffect(() => { getGallery().then(gallery => setImages(gallery.map(image => ({ src: image.image, alt: image.title, size: image.category || 'square' })))).catch(() => {}); }, []);
  const move = (direction) => setSelected((selected + direction + images.length) % images.length);
  useEffect(() => { const key = keyboardEvent => { if (selected === null) return; if (keyboardEvent.key === 'Escape') setSelected(null); if (keyboardEvent.key === 'ArrowRight') move(1); if (keyboardEvent.key === 'ArrowLeft') move(-1); }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }, [selected]);
  return <section className="gallery section-pad" id="gallery"><div className="container"><div className="section-heading section-heading--gallery"><div><p className="eyebrow">Inside the house</p><h2>Scenes from<br /><em>the pause.</em></h2></div><p className="section-intro">A small collection of daily rituals, shared tables, and beautiful in-between moments.</p></div><div className="gallery-grid">{images.map((image, index) => <button className={`gallery-item gallery-item--${image.size}`} key={image.src} onClick={() => setSelected(index)} aria-label={`View ${image.alt}`}><img src={image.src} alt={image.alt} loading="lazy" /><span><Play size={14} fill="currentColor" />View image</span></button>)}</div></div>{selected !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Gallery image viewer" onClick={() => setSelected(null)}><button className="lightbox__close icon-button" onClick={() => setSelected(null)} aria-label="Close image viewer"><X /></button><button className="lightbox__prev icon-button" onClick={event => { event.stopPropagation(); move(-1); }} aria-label="Previous image"><ArrowLeft /></button><img src={images[selected].src} alt={images[selected].alt} onClick={event => event.stopPropagation()} /><button className="lightbox__next icon-button" onClick={event => { event.stopPropagation(); move(1); }} aria-label="Next image"><ArrowRight /></button><p>{String(selected + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</p></div>}</section>;
}

function Testimonials() {
  const [active, setActive] = useState(0);
  const [reviews, setReviews] = useState(site.testimonials);
  useEffect(() => { getReviews().then(items => setReviews(items.map(item => ({ quote: item.comment, name: item.customer_name })))).catch(() => {}); }, []);
  const current = reviews[active] || reviews[0];
  return <section className="testimonials section-pad"><div className="container testimonial__inner"><div><p className="eyebrow">Words from the table</p><div className="rating"><Star fill="currentColor" size={14} /><Star fill="currentColor" size={14} /><Star fill="currentColor" size={14} /><Star fill="currentColor" size={14} /><Star fill="currentColor" size={14} /></div></div><blockquote>“{current.quote}”</blockquote><div className="testimonial__footer"><span>{current.name}</span><div className="slider-controls"><button className="icon-button" onClick={() => setActive((active - 1 + reviews.length) % reviews.length)} aria-label="Previous testimonial"><ArrowLeft /></button><span>0{active + 1} / 0{reviews.length}</span><button className="icon-button" onClick={() => setActive((active + 1) % reviews.length)} aria-label="Next testimonial"><ArrowRight /></button></div></div></div></section>;
}

function Cart({ items, onChange, onClose }) {
  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const [form, setForm] = useState({ customer_name: '', customer_email: '', customer_phone: '', notes: '' });
  const [message, setMessage] = useState('');
  const submit = async event => { event.preventDefault(); try { await createOrder({ ...form, items: items.map(item => ({ product_id: item.id, quantity: item.quantity })) }); setMessage('Order received. We will confirm it shortly.'); } catch (error) { setMessage(error.response?.data?.message || 'We could not place that order.'); } };
  return <aside className="cart-panel" aria-label="Shopping cart"><button className="cart-close icon-button" onClick={onClose} aria-label="Close cart"><X /></button><p className="eyebrow">Your order</p><h3>{items.length ? `${items.length} selection${items.length === 1 ? '' : 's'}` : 'Your cart is quiet'}</h3>{items.map(item => <div className="cart-line" key={item.id}><span>{item.name}<small>{item.quantity} x {item.price} MAD</small></span><div><button onClick={() => onChange(item.id, -1)}>-</button><button onClick={() => onChange(item.id, 1)}>+</button></div></div>)}{items.length > 0 && <><strong className="cart-total">Total <span>{total.toFixed(2)} MAD</span></strong><form className="compact-form" onSubmit={submit}><input required placeholder="Name" value={form.customer_name} onChange={event => setForm({ ...form, customer_name: event.target.value })} /><input required type="email" placeholder="Email" value={form.customer_email} onChange={event => setForm({ ...form, customer_email: event.target.value })} /><input required placeholder="Phone" value={form.customer_phone} onChange={event => setForm({ ...form, customer_phone: event.target.value })} /><button className="button button--dark" type="submit">Place order <ArrowUpRight size={15} /></button></form></>}{message && <p className="form-message">{message}</p>}</aside>;
}

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [reservation, setReservation] = useState({ name: '', email: '', phone: '', reservation_date: '', reservation_time: '', guests: 2, notes: '' });
  const [message, setMessage] = useState('');
  const submitContact = async event => { event.preventDefault(); try { await sendContactMessage(form); setMessage('Message sent. We will be in touch.'); } catch (error) { setMessage(error.response?.data?.message || 'Please check the form and try again.'); } };
  const submitReservation = async event => { event.preventDefault(); try { await createReservation(reservation); setMessage('Reservation successful. We will confirm your table shortly.'); } catch (error) { setMessage(error.response?.data?.message || 'Please check the reservation details.'); } };
  return <section className="contact section-pad" id="contact"><div className="container contact__grid"><div><p className="eyebrow">Your table is waiting</p><h2>COME<br /><em>VISIT US.</em></h2><p className="contact__address">{site.contact.address}</p><div className="contact__actions"><Button href={site.contact.mapUrl} variant="light">Get directions</Button><Button href={`tel:${site.contact.phone}`} variant="outline-light">Call us</Button></div><form className="contact-form" onSubmit={submitContact}><p className="eyebrow">Leave a note</p><input required placeholder="Name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /><input required type="email" placeholder="Email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /><textarea required placeholder="Message" value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} /><button className="button button--light" type="submit">Send message <ArrowUpRight size={15} /></button></form></div><div><div className="map-placeholder"><div className="map-grid" /><MapPin size={24} /><span>NOIR & PISTACHIO</span><small>Meknes, Morocco</small><a href={site.contact.mapUrl}>Open in maps <ArrowUpRight size={14} /></a></div><form className="reservation-form" onSubmit={submitReservation}><p className="eyebrow">Reserve a table</p><div className="form-row"><input required placeholder="Name" value={reservation.name} onChange={event => setReservation({ ...reservation, name: event.target.value })} /><input required type="email" placeholder="Email" value={reservation.email} onChange={event => setReservation({ ...reservation, email: event.target.value })} /></div><div className="form-row"><input required type="date" value={reservation.reservation_date} onChange={event => setReservation({ ...reservation, reservation_date: event.target.value })} /><input required type="time" value={reservation.reservation_time} onChange={event => setReservation({ ...reservation, reservation_time: event.target.value })} /></div><input required placeholder="Phone" value={reservation.phone} onChange={event => setReservation({ ...reservation, phone: event.target.value })} /><input required type="number" min="1" max="20" placeholder="Guests" value={reservation.guests} onChange={event => setReservation({ ...reservation, guests: event.target.value })} /><button className="button button--outline-light" type="submit">Reserve table <ArrowUpRight size={15} /></button></form>{message && <p className="form-message">{message}</p>}</div></div></section>;
}

function Footer() {
  return <footer className="footer"><div className="container footer__top"><div><a className="brand brand--footer" href="#home"><span>{site.brand.mark}</span>{site.brand.name}</a><p>{site.brand.tagline}</p></div><div className="footer__links"><a href="#menu">Menu</a><a href="#about">About</a><a href="#gallery">Gallery</a><a href={site.contact.instagram} target="_blank" rel="noreferrer"><Camera size={15} /> Instagram</a></div><div className="footer__contact"><a href={`tel:${site.contact.phone}`}><Phone size={14} />{site.contact.phone}</a><span><MapPin size={14} />{site.contact.address}</span>{site.contact.hours.map(hour => <span key={hour}>{hour}</span>)}</div></div><div className="container footer__bottom"><span>© 2024 {site.brand.name}</span><span>Made with intention.</span></div></footer>;
}

function AdminDashboard() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const submit = async event => { event.preventDefault(); try { await login(credentials); setStats(await getAdminStats()); } catch (requestError) { setError(requestError.response?.data?.message || 'Admin login failed.'); } };
  if (!stats) return <main className="admin-page"><form className="admin-login" onSubmit={submit}><p className="eyebrow">Noir & Pistachio</p><h1>Admin access</h1><input required type="email" placeholder="Email" value={credentials.email} onChange={event => setCredentials({ ...credentials, email: event.target.value })} /><input required type="password" placeholder="Password" value={credentials.password} onChange={event => setCredentials({ ...credentials, password: event.target.value })} /><button className="button button--dark" type="submit">Sign in <ArrowUpRight size={15} /></button>{error && <p className="form-message">{error}</p>}</form></main>;
  return <main className="admin-page"><div className="admin-header"><p className="eyebrow">Noir & Pistachio / Admin</p><h1>Today at the house</h1></div><div className="admin-stats">{Object.entries(stats).map(([key, value]) => <div className="admin-stat" key={key}><span>{key.replaceAll('_', ' ')}</span><strong>{value}</strong></div>)}</div></main>;
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  useEffect(() => { const reveal = gsap.utils.toArray('.reveal'); gsap.fromTo(reveal, { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.12, delay: 0.35, ease: 'power3.out' }); }, []);
  if (window.location.pathname.startsWith('/admin')) return <AdminDashboard />;
  const addToCart = product => setCart(current => { const existing = current.find(item => item.id === product.id); return existing ? current.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, price: Number(product.price), quantity: 1 }]; });
  const changeCart = (id, amount) => setCart(current => current.map(item => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter(item => item.quantity > 0));
  return <><Navbar onMenu={() => setMenuOpen(true)} /><MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} /><button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label="Open shopping cart">Cart {cart.length > 0 && <span>{cart.length}</span>}</button>{cartOpen && <Cart items={cart} onChange={changeCart} onClose={() => setCartOpen(false)} />}<main><Hero /><CoffeeExperience /><Signature /><Menu onAdd={addToCart} /><About /><Gallery /><Testimonials /><Contact /></main><Footer /><div className="cursor-dot" /> </>;
}
