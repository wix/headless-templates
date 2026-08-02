import React, { useState, useEffect, useCallback, useRef } from 'react';
import { productsV3, readOnlyVariantsV3 } from '@wix/stores';
import { currentCart } from '@wix/ecom';
import { redirects } from '@wix/redirects';
import { media } from '@wix/sdk';

const DARK = '#1a1d2e';
const GRAD = 'linear-gradient(135deg, #dde9de 0%, #eaedf4 55%, #e0dced 100%)';
const CARD_GRAD = 'linear-gradient(140deg, #e4ede6 0%, #d8e0ec 100%)';
const CARD_GRAD2 = 'linear-gradient(140deg, #e8eddf 0%, #dde4ec 100%)';

function imgSrc(mediaMain, w = 600, h = 600) {
  const v = mediaMain?.image ?? mediaMain?.url ?? mediaMain;
  if (!v) return '';
  if (typeof v === 'string' && v.startsWith('wix:image://'))
    return media.getScaledToFillImageUrl(v, w, h, {});
  return typeof v === 'string' ? v : (v.url ?? '');
}

function GradPlaceholder({ style, index = 0 }) {
  const grads = [CARD_GRAD, CARD_GRAD2,
    'linear-gradient(140deg, #e2e8f0 0%, #e8e4ec 100%)',
    'linear-gradient(140deg, #deeae0 0%, #e4e0ec 100%)',
  ];
  return <div style={{ background: grads[index % grads.length], ...style }} />;
}

/* ─── Product Modal ─────────────────────────────────────────────────────── */
function ProductModal({ product, onClose, onAddedToCart }) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [description, setDescription] = useState(product.plainDescription ?? null);
  const src = imgSrc(product.media?.main);

  useEffect(() => {
    if (description != null) return;
    productsV3.getProduct(product._id, { fields: ['PLAIN_DESCRIPTION'] })
      .then(p => {
        const raw = p.plainDescription ?? '';
        const div = document.createElement('div');
        div.innerHTML = raw;
        setDescription(div.textContent || div.innerText || '');
      })
      .catch(() => setDescription(''));
  }, [product._id]);

  async function handleAdd() {
    setAdding(true); setError('');
    try {
      const { items } = await readOnlyVariantsV3
        .queryVariants().eq('productData.productId', product._id).find();
      const variant = items[0];
      if (!variant) { setError('No variant available.'); return; }
      await currentCart.addToCurrentCart({
        lineItems: [{ quantity: 1, catalogReference: {
          catalogItemId: product._id,
          appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
          options: { variantId: variant.variantId ?? variant._id },
        }}],
      });
      onAddedToCart();
    } catch (e) { setError('Could not add to cart.'); console.error(e); }
    finally { setAdding(false); }
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(26,29,46,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} className="grid-2" style={{
        background: '#fff', borderRadius: 4, maxWidth: 680, width: '100%',
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(26,29,46,0.2)',
      }}>
        {src
          ? <img src={src} alt={product.name} style={{ width: '100%', height: '100%', minHeight: 280, objectFit: 'cover', display: 'block' }} />
          : <GradPlaceholder style={{ minHeight: 280 }} index={0} />
        }
        <div style={{ padding: 36, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button onClick={onClose} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', fontSize: 22, opacity: 0.35 }}>×</button>
          <div>
            <p style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.3 }}>{product.name}</p>
            {description == null && (
              <p style={{ marginTop: 8, fontSize: 13, opacity: 0.35, lineHeight: 1.7 }}>Loading…</p>
            )}
            {description && (
              <p style={{ marginTop: 8, fontSize: 13, opacity: 0.6, lineHeight: 1.7 }}>{description}</p>
            )}
          </div>
          {product.actualPriceRange?.minValue?.amount && (
            <p style={{ fontSize: 18, fontWeight: 500 }}>${product.actualPriceRange.minValue.amount}</p>
          )}
          <button onClick={handleAdd} disabled={adding} style={{
            marginTop: 'auto', padding: '13px 0',
            background: DARK, color: '#fff', border: 'none',
            borderRadius: 24, fontSize: 14, fontWeight: 600,
            opacity: adding ? 0.6 : 1,
          }}>{adding ? 'Adding…' : 'Add to Cart'}</button>
          {error && <p style={{ fontSize: 12, color: '#c0392b' }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

/* ─── Cart Panel ────────────────────────────────────────────────────────── */
function CartPanel({ onClose }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    currentCart.getCurrentCart().then(setCart).catch(() => setCart(null)).finally(() => setLoading(false));
  }, []);

  async function handleCheckout() {
    setCheckingOut(true);
    try {
      const checkout = await currentCart.createCheckoutFromCurrentCart({ channelType: 'WEB' });
      const session = await redirects.createRedirectSession({
        ecomCheckout: { checkoutId: checkout.checkoutId },
        callbacks: { postFlowUrl: window.location.origin + '/', thankYouPageUrl: window.location.origin + '/' },
      });
      window.location.href = session.redirectSession.fullUrl;
    } catch (e) { console.error(e); setCheckingOut(false); }
  }

  const itemCount = cart?.lineItems?.reduce((s, i) => s + (i.quantity ?? 0), 0) ?? 0;
  const total = cart?.lineItems?.reduce((s, i) => s + parseFloat(i.price?.amount ?? 0) * (i.quantity ?? 1), 0) ?? 0;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,29,46,0.4)', zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(380px, 100vw)', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Cart {itemCount > 0 ? `(${itemCount})` : ''}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, opacity: 0.4 }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {loading && <p style={{ opacity: 0.5, fontSize: 14 }}>Loading…</p>}
          {!loading && !cart?.lineItems?.length && <p style={{ opacity: 0.5, fontSize: 14 }}>Your cart is empty.</p>}
          {cart?.lineItems?.map((item, i) => {
            const s = imgSrc(item.image);
            return (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                {s ? <img src={s} alt="" style={{ width: 56, height: 72, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />
                  : <GradPlaceholder style={{ width: 56, height: 72, borderRadius: 3, flexShrink: 0 }} index={i} />}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{item.productName?.translated ?? item.productName}</p>
                  <p style={{ fontSize: 12, marginTop: 4, opacity: 0.5 }}>Qty {item.quantity}</p>
                </div>
                {item.price?.amount && <p style={{ fontSize: 13, fontWeight: 600 }}>${item.price.amount}</p>}
              </div>
            );
          })}
        </div>
        {!loading && itemCount > 0 && (
          <div style={{ padding: 24, borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 14 }}>
              <span>Total</span><span style={{ fontWeight: 700 }}>${total.toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} disabled={checkingOut} style={{
              width: '100%', padding: '13px 0', background: DARK, color: '#fff',
              border: 'none', borderRadius: 24, fontSize: 14, fontWeight: 600,
              opacity: checkingOut ? 0.6 : 1,
            }}>{checkingOut ? 'Redirecting…' : 'Checkout'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Product Card ──────────────────────────────────────────────────────── */
function ProductCard({ product, index, onSelect }) {
  const src = imgSrc(product.media?.main);
  const price = product.actualPriceRange?.minValue?.amount;
  return (
    <button onClick={() => onSelect(product)} style={{ all: 'unset', cursor: 'pointer', display: 'block', textAlign: 'left' }}>
      <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', borderRadius: 2 }}>
        {src ? <img src={src} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <GradPlaceholder style={{ width: '100%', height: '100%' }} index={index} />}
      </div>
      <p style={{ marginTop: 10, fontSize: 13, fontWeight: 500, color: DARK }}>{product.name}</p>
      <p style={{ marginTop: 3, fontSize: 13, color: '#6b7280' }}>{price ? `$${price}` : ''}</p>
    </button>
  );
}

function CarouselArrow({ direction, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === 'left' ? 'Previous products' : 'Next products'}
      style={{
        position: 'absolute', top: '35%', [direction === 'left' ? 'left' : 'right']: -20,
        transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%',
        background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2">
        {direction === 'left' ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
      </svg>
    </button>
  );
}

function ProductCarousel({ products, startIndex = 0, onSelect, cardWidth = 220 }) {
  const scrollRef = useRef(null);
  const scrollByAmount = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (cardWidth + 20) * 2, behavior: 'smooth' });
  };
  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={scrollRef}
        style={{
          display: 'flex', gap: 20, overflowX: 'auto', scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth', paddingBottom: 8,
        }}
      >
        {products.map((p, i) => (
          <div key={p._id} style={{ flex: `0 0 ${cardWidth}px`, scrollSnapAlign: 'start' }}>
            <ProductCard product={p} index={startIndex + i} onSelect={onSelect} />
          </div>
        ))}
      </div>
      <CarouselArrow direction="left" onClick={() => scrollByAmount(-1)} />
      <CarouselArrow direction="right" onClick={() => scrollByAmount(1)} />
    </div>
  );
}

/* ─── About Page ─────────────────────────────────────────────────────────── */
function AboutPage() {
  return (
    <div style={{ flex: 1 }}>
      <section className="section-pad" style={{
        background: GRAD, minHeight: 480,
        display: 'flex', alignItems: 'flex-end',
        padding: '80px max(40px, calc((100vw - 1280px) / 2 + 40px))',
      }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', opacity: 0.5, marginBottom: 16 }}>OUR STORY</p>
          <h1 style={{ fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: 700 }}>
            Add a headline that tells your eCommerce brand's story
          </h1>
        </div>
      </section>

      <section className="grid-2 section-pad" style={{
        gap: 80,
        padding: '80px max(40px, calc((100vw - 1280px) / 2 + 40px))',
        alignItems: 'center',
      }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', opacity: 0.45, marginBottom: 20 }}>WHO WE ARE</p>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 400, lineHeight: 1.2, marginBottom: 24 }}>
            Add a subheading to introduce your story
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.6 }}>
            This is the space to share the background of your brand — how it started, what drives it, and what makes it different. Give visitors a reason to connect with the people behind the products.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.6, marginTop: 16 }}>
            Use this paragraph to go deeper — share your values, your process, or a moment that shaped the business. Authentic stories build trust.
          </p>
        </div>
        <GradPlaceholder style={{ aspectRatio: '4/5', borderRadius: 2 }} index={1} />
      </section>

      <section className="section-pad" style={{ background: '#f7f8fc', padding: '80px max(40px, calc((100vw - 1280px) / 2 + 40px))' }}>
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', opacity: 0.45, marginBottom: 40, textAlign: 'center' }}>WHAT WE STAND FOR</p>
        <div className="grid-3" style={{ gap: 40 }}>
          {['Add a Value', 'Add a Value', 'Add a Value'].map((title, i) => (
            <div key={i}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: GRAD, marginBottom: 20 }} />
              <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>{title}</p>
              <p style={{ fontSize: 14, lineHeight: 1.8, opacity: 0.55 }}>
                Describe what this value means to your brand and how it shows up in everything you do.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-pad" style={{ padding: '80px max(40px, calc((100vw - 1280px) / 2 + 40px))' }}>
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', opacity: 0.45, marginBottom: 8, textAlign: 'center' }}>THE TEAM</p>
        <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 400, lineHeight: 1.2, textAlign: 'center', marginBottom: 48 }}>
          The people behind the brand
        </h2>
        <div className="grid-4" style={{ gap: 24 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ textAlign: 'center' }}>
              <GradPlaceholder style={{ aspectRatio: '1', borderRadius: '50%', marginBottom: 16 }} index={i} />
              <p style={{ fontWeight: 600, fontSize: 15 }}>Full Name</p>
              <p style={{ fontSize: 13, opacity: 0.5, marginTop: 4 }}>Job Title</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: DARK, padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 400, color: '#fff', lineHeight: 1.15, maxWidth: 600, margin: '0 auto' }}>
          Add a call-to-action heading for your eCommerce store
        </h2>
        <p style={{ marginTop: 16, fontSize: 15, color: '#8b8f9a', maxWidth: 440, margin: '16px auto 0' }}>
          Use this space to encourage visitors to take the next step — browse the shop, get in touch, or sign up.
        </p>
        <a href="/" style={{
          display: 'inline-block', marginTop: 36, padding: '14px 36px',
          background: '#fff', color: DARK, borderRadius: 24, fontSize: 15, fontWeight: 600,
          textDecoration: 'none',
        }}>Shop Now</a>
      </section>
    </div>
  );
}

/* ─── App Island ─────────────────────────────────────────────────────────── */
export default function AppIsland({ products = [], member = null, page = 'home' }) {
  const [selected, setSelected] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      const cart = await currentCart.getCurrentCart();
      setCartCount(cart?.lineItems?.reduce((s, i) => s + (i.quantity || 0), 0) ?? 0);
    } catch { setCartCount(0); }
  }, []);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  function handleAddedToCart() { setSelected(null); refreshCart(); setCartOpen(true); }

  const featured = products[0] ?? null;
  const gridProducts = products.slice(1);

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', color: DARK }}>

      {/* ── Promo Banner ── */}
      <div style={{
        background: DARK, color: '#fff', textAlign: 'center',
        padding: '12px 24px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em',
      }}>
        ADD YOUR PROMOTIONAL BANNER HERE
      </div>

      {/* ── Nav ── */}
      <header style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div className="site-header-inner" style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 40px', minHeight: 72,
          display: 'flex', alignItems: 'center', gap: 40,
        }}>
          <a href="/" style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: GRAD, border: '1px solid #e0e0e0' }} />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Brand Name</span>
          </a>
          <nav className="desktop-header-actions" style={{ display: 'flex', gap: 28, flex: 1, justifyContent: 'center' }}>
            <a href="/#shop" style={{ fontSize: 14, color: DARK, opacity: 0.8, fontWeight: 400, textDecoration: 'none' }}>Shop All</a>
            <a href="/about" style={{ fontSize: 14, color: DARK, textDecoration: 'none', opacity: page === 'about' ? 1 : 0.8, fontWeight: page === 'about' ? 600 : 400 }}>Our Story</a>
          </nav>
          <div className="desktop-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            {member ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: DARK }}>
                    {(member.profile?.nickname ?? member.loginEmail ?? '?')[0].toUpperCase()}
                  </div>
                  <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {member.profile?.nickname ?? member.loginEmail}
                  </span>
                </div>
                <form method="POST" action="/api/auth/logout" style={{ display: 'inline' }}>
                  <button type="submit" style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 16, padding: '5px 12px', fontSize: 13, cursor: 'pointer', color: DARK, font: 'inherit' }}>
                    Log Out
                  </button>
                </form>
              </div>
            ) : (
              <a href="/api/auth/login?returnUrl=/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: DARK, textDecoration: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                Log In
              </a>
            )}
            <button onClick={() => setCartOpen(true)} style={{
              background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 14, cursor: 'pointer', color: DARK, font: 'inherit',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              {cartCount}
            </button>
          </div>
          <button
            className="mobile-menu-btn"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginLeft: 'auto' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.8" strokeLinecap="round">
              {menuOpen ? (
                <><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></>
              ) : (
                <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu-panel" style={{
            borderTop: '1px solid #e5e7eb', padding: '20px', display: 'flex',
            flexDirection: 'column', gap: 18,
          }}>
            <a href="/#shop" onClick={() => setMenuOpen(false)} style={{ fontSize: 15, color: DARK, fontWeight: 500, textDecoration: 'none' }}>Shop All</a>
            <a href="/about" onClick={() => setMenuOpen(false)} style={{ fontSize: 15, color: DARK, textDecoration: 'none', fontWeight: page === 'about' ? 600 : 500 }}>Our Story</a>
            <div style={{ height: 1, background: '#e5e7eb' }} />
            {member ? (
              <>
                <span style={{ fontSize: 14, color: '#6b7280' }}>{member.profile?.nickname ?? member.loginEmail}</span>
                <form method="POST" action="/api/auth/logout">
                  <button type="submit" style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 16, padding: '7px 16px', fontSize: 14, cursor: 'pointer', color: DARK, font: 'inherit' }}>
                    Log Out
                  </button>
                </form>
              </>
            ) : (
              <a href="/api/auth/login?returnUrl=/" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: DARK, textDecoration: 'none', fontWeight: 500 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                Log In
              </a>
            )}
            <button onClick={() => { setMenuOpen(false); setCartOpen(true); }} style={{
              background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 15, fontWeight: 500, cursor: 'pointer', color: DARK, font: 'inherit', padding: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              Cart {cartCount > 0 ? `(${cartCount})` : ''}
            </button>
          </div>
        )}
      </header>

      {page === 'about' ? <AboutPage /> : <>

      {/* ── Hero ── */}
      <section className="section-pad" style={{
        background: GRAD, minHeight: '85vh',
        display: 'flex', alignItems: 'flex-end',
        padding: '80px 40px 80px max(40px, calc((100vw - 1280px) / 2 + 40px))',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ maxWidth: 640, position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 'clamp(48px, 6vw, 88px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Add your eCommerce<br />business name or title here
          </h1>
          <a href="#shop" style={{
            display: 'inline-block', marginTop: 36, padding: '14px 32px',
            background: DARK, color: '#fff', border: 'none',
            borderRadius: 24, fontSize: 15, fontWeight: 500, textDecoration: 'none',
          }}>Shop Now</a>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section id="shop" className="section-pad" style={{ background: '#fff', padding: '60px 40px 60px max(40px, calc((100vw - 1280px) / 2 + 40px))' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {products.length === 0 ? (
          <div className="grid-4" style={{ gap: 16 }}>
            {[0,1,2,3].map(i => <GradPlaceholder key={i} style={{ aspectRatio:'1', borderRadius: 2 }} index={i} />)}
          </div>
        ) : (
          <div className="shop-grid" style={{ gap: 40, alignItems: 'start' }}>
            {featured && (
              <button onClick={() => setSelected(featured)} style={{ all: 'unset', cursor: 'pointer', display: 'block', position: 'relative' }}>
                <div style={{ width: '100%', aspectRatio: '4/5', overflow: 'hidden', borderRadius: 2 }}>
                  {imgSrc(featured.media?.main)
                    ? <img src={imgSrc(featured.media?.main)} alt={featured.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <GradPlaceholder style={{ width: '100%', height: '100%' }} index={0} />
                  }
                </div>
                <div style={{
                  position: 'absolute', bottom: 16, left: 16,
                  background: '#fff', borderRadius: 2, padding: '10px 16px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: DARK }}>{featured.name}</p>
                  <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                    {featured.actualPriceRange?.minValue?.amount ? `$${featured.actualPriceRange.minValue.amount}` : ''}
                  </p>
                </div>
              </button>
            )}
            <div style={{ minWidth: 0 }}>
              <div className="grid-3" style={{ gap: 20, marginBottom: 12 }}>
                {gridProducts.slice(0, 3).map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i + 1} onSelect={setSelected} />
                ))}
              </div>
              <div style={{ textAlign: 'right' }}>
                <a href="#shop" style={{ fontSize: 13, fontWeight: 500, border: '1px solid #d1d5db', borderRadius: 24, padding: '8px 20px', color: DARK, textDecoration: 'none' }}>Shop All</a>
              </div>
            </div>
          </div>
        )}
        </div>
      </section>

      {/* ── Quote Strip ── */}
      <section className="section-pad" style={{ background: DARK, padding: '80px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 'clamp(24px, 3.5vw, 48px)', fontWeight: 400, fontStyle: 'italic', color: '#6b7080', lineHeight: 1.3, maxWidth: 900, margin: '0 auto' }}>
          "This is the space to introduce<br />your business and what it has to offer"
        </p>
        <p style={{ marginTop: 28, fontSize: 14, color: '#6b7080', fontWeight: 500 }}>Full Name</p>
      </section>

      {/* ── Second Product Grid ── */}
      <section className="section-pad" style={{ background: '#fff', padding: '60px max(40px, calc((100vw - 1280px) / 2 + 40px)) 60px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          {products.length === 0 ? (
            <div className="grid-4" style={{ gap: 16 }}>
              {[0,1,2,3].map(i => <GradPlaceholder key={i} style={{ aspectRatio: '1', borderRadius: 2 }} index={i} />)}
            </div>
          ) : (
            <ProductCarousel products={products} startIndex={2} onSelect={setSelected} />
          )}
        </div>
      </section>

      {/* ── Brand Story Banner ── */}
      <section className="section-pad" style={{
        background: GRAD, minHeight: 520,
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        padding: '80px max(40px, calc((100vw - 1280px) / 2 + 40px)) 80px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ maxWidth: 380, textAlign: 'left' }}>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            Use this space to<br />promote your eCommerce business.
          </h2>
          <a href="/about" style={{
            display: 'inline-block', marginTop: 28, padding: '12px 28px',
            background: 'none', color: DARK,
            border: `1.5px solid ${DARK}`, borderRadius: 24,
            fontSize: 14, fontWeight: 500, textDecoration: 'none',
          }}>Our Story</a>
        </div>
      </section>

      {/* ── Promo + Social ── */}
      <section className="grid-2 section-pad" style={{
        background: '#f7f8fc',
        padding: '80px max(40px, calc((100vw - 1280px) / 2 + 40px)) 80px 40px',
        gap: 80, alignItems: 'center',
        minHeight: 420,
      }}>
        <GradPlaceholder style={{ height: '100%', minHeight: 280, borderRadius: 2 }} index={1} />
        <div>
          <p style={{ fontSize: 'clamp(20px, 2.5vw, 32px)', fontWeight: 500, lineHeight: 1.4 }}>
            Use this space to promote your eCommerce business, its products or its services.
          </p>
          <a href="#shop" style={{
            display: 'block', marginTop: 28, padding: '13px 28px',
            background: DARK, color: '#fff', borderRadius: 24,
            fontSize: 14, fontWeight: 600, textDecoration: 'none',
            width: 'fit-content',
          }}>Shop Now</a>
          <button style={{ marginTop: 16, background: 'none', border: 'none', fontSize: 13, fontWeight: 500, color: '#6b7280', display: 'block', cursor: 'pointer' }}>
            Join the Feed
          </button>
        </div>
      </section>

      {/* ── Gallery Strip ── */}
      <section className="grid-4">
        {[0, 1, 2, 3].map(i => (
          <GradPlaceholder key={i} style={{ aspectRatio: '1' }} index={i + 1} />
        ))}
      </section>

      {/* ── Newsletter ── */}
      <section className="grid-2 section-pad" style={{
        background: '#f7f8fc',
        padding: '80px max(40px, calc((100vw - 1280px) / 2 + 40px))',
        gap: 80, alignItems: 'center',
      }}>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: '#374151' }}>
          This is the space to promote the business's email newsletter. Encourage people to subscribe here.
        </p>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Email *</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email address"
            style={{
              width: '100%', padding: '12px 16px', border: '1px solid #d1d5db',
              borderRadius: 4, fontSize: 14, outline: 'none', background: '#fff',
              font: 'inherit',
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: 14, height: 14 }} />
            I agree to receive marketing emails *
          </label>
          <button style={{
            marginTop: 16, padding: '12px 32px',
            background: DARK, color: '#fff', border: 'none',
            borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: 'pointer', font: 'inherit',
          }}>Submit</button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="section-pad" style={{ background: DARK, color: '#fff', padding: '60px max(40px, calc((100vw - 1280px) / 2 + 40px)) 0' }}>
        <div className="grid-4" style={{ gap: 40, paddingBottom: 60 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: '#8b8f9a', marginBottom: 16 }}>NAVIGATE</p>
            {['Shop All', 'Our Story'].map(l => (
              <p key={l} style={{ fontSize: 14, marginBottom: 10, color: '#d1d5db' }}>{l}</p>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: '#8b8f9a', marginBottom: 16 }}>LEGAL</p>
            {['Terms & Conditions', 'Privacy Policy', 'Accessibility Statement'].map(l => (
              <p key={l} style={{ fontSize: 14, marginBottom: 10, color: '#d1d5db' }}>{l}</p>
            ))}
          </div>
          <div />
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: '#8b8f9a', marginBottom: 16 }}>FOLLOW US</p>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                <path key="fb" d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>,
                <><circle key="ig-c" cx="12" cy="12" r="4"/><rect key="ig-r" x="2" y="2" width="20" height="20" rx="5"/><circle key="ig-d" cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></>,
                <path key="tk" d="M9 12a4 4 0 104 4V4a5 5 0 005 5"/>,
              ].map((icon, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icon}</svg>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #2d3348', padding: '48px 0 32px', textAlign: 'center' }}>
          <p style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.03em', color: '#fff' }}>
            Logo.
          </p>
          <p style={{ marginTop: 40, paddingBottom: 32, fontSize: 13, color: '#6b7080' }}>
            © 2035 by Business Name. Powered and secured by Wix
          </p>
        </div>
      </footer>

      </>}

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onAddedToCart={handleAddedToCart} />}
      {cartOpen && <CartPanel onClose={() => setCartOpen(false)} />}
    </div>
  );
}
