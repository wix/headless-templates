import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cartV2, currentCartV2 } from '@wix/ecom';
import { redirects } from '@wix/redirects';
import { media } from '@wix/sdk';

// Public app id of the Wix Stores catalog, used in ecom catalog references.
const WIX_STORES_APP_ID = '215238eb-22a5-4c36-9e7b-e7c08025e04e';

// Cart V2 line-item prices are raw decimal strings (ConvertedMoney: { amount, convertedAmount }),
// not preformatted display strings like Cart V1's MultiCurrencyPrice. Format them client-side
// from the amount + the cart's currency code.
function formatMoney(money, currencyCode) {
  const value = money?.convertedAmount ?? money?.amount;
  if (value == null) return '';
  const num = Number(value);
  if (Number.isNaN(num)) return '';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode || 'USD' }).format(num);
  } catch {
    return `${value}`;
  }
}

function cartCurrency(cart) {
  return cart?.customerInfo?.currencyCode ?? cart?.businessInfo?.currencyCode;
}

function lineItemCount(cart) {
  return cart?.lineItems?.reduce((s, i) => s + (i.quantityInfo?.confirmedQuantity ?? 0), 0) ?? 0;
}

function imgSrc(mediaMain, w = 600, h = 600) {
  const v = mediaMain?.image ?? mediaMain?.url ?? mediaMain;
  if (!v) return '';
  if (typeof v === 'string' && v.startsWith('wix:image://'))
    return media.getScaledToFillImageUrl(v, w, h, {});
  return typeof v === 'string' ? v : (v.url ?? '');
}

// Gradient placeholder shown where a product/photo image is missing.
const Ph = ({ index = 0, className = '', style }) => (
  <div className={`ph${index % 4} ${className}`} style={style} />
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
);
const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
);

const LoginLink = ({ onClick }) => (
  <a className="login-link" href="/api/auth/login?returnUrl=/" onClick={onClick}>
    <UserIcon /> Log In
  </a>
);
const LogoutForm = () => (
  <form method="POST" action="/api/auth/logout">
    <button type="submit" className="logout-btn">Log Out</button>
  </form>
);

/* ─── Product Modal ─────────────────────────────────────────────────────── */
function ProductModal({ product, onClose, onAddedToCart }) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [choices, setChoices] = useState({});
  const src = imgSrc(product.media?.main);

  const options = product.options ?? [];
  const variants = product.variants ?? [];
  const hasOptions = options.length > 0;

  // With no options, the product has a single variant — use it directly.
  // With options, resolve the variant matching every selected choice.
  const selectedVariant = hasOptions
    ? (options.every(o => choices[o.name])
        ? variants.find(v => v.choices.every(c => choices[c.optionName] === c.choiceName))
        : null)
    : (variants[0] ?? null);

  const price = selectedVariant?.formattedPrice || product.formattedPrice;
  const canAdd = !hasOptions || !!selectedVariant;

  async function handleAdd() {
    if (!canAdd) return;
    setAdding(true); setError('');
    try {
      await currentCartV2.addLineItemsToCurrentCart({
        catalogItems: [{ quantity: 1, catalogReference: {
          catalogItemId: product._id,
          appId: WIX_STORES_APP_ID,
          ...(selectedVariant?._id && { options: { variantId: selectedVariant._id } }),
        }}],
      });
      onAddedToCart();
    } catch (e) { setError('Could not add to cart.'); console.error(e); }
    finally { setAdding(false); }
  }

  return (
    <div className="overlay center" onClick={onClose}>
      <div className="modal grid-2" onClick={e => e.stopPropagation()}>
        {src ? <img className="modal-img" src={src} alt={product.name} /> : <Ph className="modal-img" />}
        <div className="modal-body">
          <button className="close" onClick={onClose}>×</button>
          <div>
            <p className="modal-name">{product.name}</p>
            {product.plainDescription && <p className="modal-desc">{product.plainDescription}</p>}
          </div>
          {price && <p className="modal-price">{price}</p>}
          {options.map(option => (
            <div key={option.name}>
              <p className="opt-label">{option.name?.toUpperCase()}</p>
              <div className="chips">
                {option.choices.map(choice => (
                  <button
                    key={choice}
                    className={choices[option.name] === choice ? 'chip on' : 'chip'}
                    onClick={() => setChoices(c => ({ ...c, [option.name]: choice }))}
                  >{choice}</button>
                ))}
              </div>
            </div>
          ))}
          <button className="btn push" onClick={handleAdd} disabled={adding || !canAdd}>
            {adding ? 'Adding…' : canAdd ? 'Add to Cart' : 'Select Options'}
          </button>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </div>
  );
}

/* ─── Cart Panel ────────────────────────────────────────────────────────── */
function CartPanel({ onClose }) {
  const [cart, setCart] = useState(null);
  const [priceSummary, setPriceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    Promise.all([
      currentCartV2.getCurrentCart(),
      currentCartV2.estimateCurrentCart().catch(() => null),
    ])
      .then(([cartRes, estimate]) => {
        setCart(cartRes?.cart ?? null);
        setPriceSummary(estimate?.summary?.priceSummary ?? null);
      })
      .catch(() => setCart(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleCheckout() {
    setCheckingOut(true);
    try {
      // Cart V2 has no separate checkout entity — the cart id is the checkout id.
      // We still use a redirect session so the visitor/member session carries across
      // to the Wix-hosted checkout on its own domain.
      const { cart } = await currentCartV2.getCurrentCart();
      const session = await redirects.createRedirectSession({
        ecomCheckout: { checkoutId: cart._id },
        callbacks: { postFlowUrl: window.location.origin + '/', thankYouPageUrl: window.location.origin + '/' },
      });
      window.location.href = session.redirectSession.fullUrl;
    } catch (e) { console.error(e); setCheckingOut(false); }
  }

  const itemCount = lineItemCount(cart);
  // V2 summary money is ConvertedMoney (amount/convertedAmount, no formatted string) — format it client-side.
  const subtotal = formatMoney(priceSummary?.subtotal, cartCurrency(cart));

  return (
    <div className="overlay right" onClick={onClose}>
      <aside className="cart" onClick={e => e.stopPropagation()}>
        <div className="cart-head">
          <span>Cart {itemCount > 0 ? `(${itemCount})` : ''}</span>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <div className="cart-items">
          {loading && <p className="muted">Loading…</p>}
          {!loading && !cart?.lineItems?.length && <p className="muted">Your cart is empty.</p>}
          {cart?.lineItems?.map((item, i) => {
            const s = imgSrc(item.attributes?.image);
            const price = formatMoney(item.pricing?.totalPrice, cartCurrency(cart));
            return (
              <div key={item._id ?? i} className="cart-row">
                {s ? <img className="cart-thumb" src={s} alt="" /> : <Ph className="cart-thumb" index={i} />}
                <div className="grow">
                  <p className="cart-name">{item.name?.translated ?? item.name?.original}</p>
                  <p className="cart-qty">Qty {item.quantityInfo?.confirmedQuantity}</p>
                </div>
                {price && <p className="cart-name">{price}</p>}
              </div>
            );
          })}
        </div>
        {!loading && itemCount > 0 && (
          <div className="cart-foot">
            {subtotal && <div className="cart-subtotal"><span>Subtotal</span><b>{subtotal}</b></div>}
            <button className="btn full" onClick={handleCheckout} disabled={checkingOut}>
              {checkingOut ? 'Redirecting…' : 'Checkout'}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

/* ─── Product Card (featured = large tile with overlaid label) ─────────── */
function ProductCard({ product, index = 0, onSelect, featured }) {
  const src = imgSrc(product.media?.main);
  return (
    <button className={featured ? 'card featured' : 'card'} onClick={() => onSelect(product)}>
      <div className="card-img">
        {src ? <img src={src} alt={product.name} /> : <Ph className="fill" index={index} />}
      </div>
      <div>
        <p className="card-name">{product.name}</p>
        <p className="card-price">{product.formattedPrice || ''}</p>
      </div>
    </button>
  );
}

function ProductCarousel({ products, startIndex = 0, onSelect }) {
  const scrollRef = useRef(null);
  const scroll = dir =>
    scrollRef.current?.scrollBy({ left: dir * 480, behavior: 'smooth' });
  return (
    <div className="carousel">
      <div className="carousel-track" ref={scrollRef}>
        {products.map((p, i) => (
          <div key={p._id}>
            <ProductCard product={p} index={startIndex + i} onSelect={onSelect} />
          </div>
        ))}
      </div>
      {['left', 'right'].map(dir => (
        <button
          key={dir}
          className={`car-arrow ${dir}`}
          aria-label={dir === 'left' ? 'Previous products' : 'Next products'}
          onClick={() => scroll(dir === 'left' ? -1 : 1)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
          </svg>
        </button>
      ))}
    </div>
  );
}

/* ─── About Page ────────────────────────────────────────────────────────── */
function AboutPage() {
  return (
    <div className="grow">
      <section className="about-hero section-pad pl pr grad">
        <div>
          <p className="eyebrow">OUR STORY</p>
          <h1 className="h-page">Add a headline that tells your eCommerce brand's story</h1>
        </div>
      </section>

      <section className="about-sec section-pad pl pr grid-2" style={{ gap: 80, alignItems: 'center' }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 20 }}>WHO WE ARE</p>
          <h2 className="h-md" style={{ marginBottom: 24 }}>Add a subheading to introduce your story</h2>
          <p className="body-copy">
            This is the space to share the background of your brand — how it started, what drives it, and what makes it different. Give visitors a reason to connect with the people behind the products.
          </p>
          <p className="body-copy" style={{ marginTop: 16 }}>
            Use this paragraph to go deeper — share your values, your process, or a moment that shaped the business. Authentic stories build trust.
          </p>
        </div>
        <Ph index={1} style={{ aspectRatio: '4/5', borderRadius: 2 }} />
      </section>

      <section className="about-sec section-pad pl pr" style={{ background: '#f7f8fc' }}>
        <p className="eyebrow tc" style={{ marginBottom: 40 }}>WHAT WE STAND FOR</p>
        <div className="grid-3" style={{ gap: 40 }}>
          {[0, 1, 2].map(i => (
            <div key={i}>
              <div className="grad circle" style={{ width: 48, height: 48, marginBottom: 20 }} />
              <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 12 }}>Add a Value</p>
              <p className="body-copy" style={{ fontSize: 14 }}>
                Describe what this value means to your brand and how it shows up in everything you do.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-sec section-pad pl pr">
        <p className="eyebrow tc" style={{ marginBottom: 8 }}>THE TEAM</p>
        <h2 className="h-md tc" style={{ marginBottom: 48 }}>The people behind the brand</h2>
        <div className="grid-4" style={{ gap: 24 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="tc">
              <Ph index={i} className="circle" style={{ aspectRatio: '1', marginBottom: 16 }} />
              <p style={{ fontWeight: 600, fontSize: 15 }}>Full Name</p>
              <p style={{ fontSize: 13, opacity: 0.5, marginTop: 4 }}>Job Title</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-sec">
        <h2>Add a call-to-action heading for your eCommerce store</h2>
        <p>Use this space to encourage visitors to take the next step — browse the shop, get in touch, or sign up.</p>
        <a className="pill light" href="/" style={{ marginTop: 36 }}>Shop Now</a>
      </section>
    </div>
  );
}

/* ─── App Island ────────────────────────────────────────────────────────── */
export default function AppIsland({ products = [], member = null, page = 'home' }) {
  const [selected, setSelected] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const { cart } = await currentCartV2.getCurrentCart();
      setCartCount(lineItemCount(cart));
    } catch { setCartCount(0); }
  }, []);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  function handleAddedToCart() { setSelected(null); refreshCart(); setCartOpen(true); }

  const memberName = member && (member.profile?.nickname ?? member.loginEmail);
  const [featured, ...gridProducts] = products;

  return (
    <div className="app">
      <div className="banner">ADD YOUR PROMOTIONAL BANNER HERE</div>

      {/* ── Header ── */}
      <header className="header">
        <div className="site-header-inner">
          <a className="logo" href="/"><span className="logo-dot" />Brand Name</a>
          <nav className="nav desktop-header-actions">
            <a href="/#shop">Shop All</a>
            <a href="/about" className={page === 'about' ? 'on' : ''}>Our Story</a>
          </nav>
          <div className="header-actions desktop-header-actions">
            {member ? (
              <div className="member">
                <span className="avatar">{(memberName ?? '?')[0].toUpperCase()}</span>
                <span className="member-name">{memberName}</span>
                <LogoutForm />
              </div>
            ) : <LoginLink />}
            <button className="icon-btn" onClick={() => setCartOpen(true)}>
              <CartIcon /> {cartCount}
            </button>
          </div>
          <button
            className="mobile-menu-btn"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(o => !o)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {menuOpen
                ? <><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></>
                : <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu-panel">
            <a href="/#shop" onClick={() => setMenuOpen(false)}>Shop All</a>
            <a href="/about" onClick={() => setMenuOpen(false)}>Our Story</a>
            <div className="hr" />
            {member ? (
              <>
                <span style={{ fontSize: 14, color: '#6b7280' }}>{memberName}</span>
                <LogoutForm />
              </>
            ) : <LoginLink onClick={() => setMenuOpen(false)} />}
            <button className="icon-btn" onClick={() => { setMenuOpen(false); setCartOpen(true); }}>
              <CartIcon /> Cart {cartCount > 0 ? `(${cartCount})` : ''}
            </button>
          </div>
        )}
      </header>

      {page === 'about' ? <AboutPage /> : <>

      {/* ── Hero ── */}
      <section className="hero section-pad pl grad">
        <div style={{ maxWidth: 640 }}>
          <h1 className="h-hero">Add your eCommerce<br />business name or title here</h1>
          <a className="pill dark" href="#shop" style={{ marginTop: 36 }}>Shop Now</a>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section id="shop" className="shop-sec section-pad pl">
        <div className="wrap">
          {products.length === 0 ? (
            <div className="grid-4" style={{ gap: 16 }}>
              {[0, 1, 2, 3].map(i => <Ph key={i} className="sq" index={i} />)}
            </div>
          ) : (
            <div className="shop-grid" style={{ gap: 40, alignItems: 'start' }}>
              <ProductCard product={featured} onSelect={setSelected} featured />
              <div style={{ minWidth: 0 }}>
                <div className="grid-3" style={{ gap: 20, marginBottom: 12 }}>
                  {gridProducts.slice(0, 3).map((p, i) => (
                    <ProductCard key={p._id} product={p} index={i + 1} onSelect={setSelected} />
                  ))}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <a className="pill sm" href="#shop">Shop All</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Quote Strip ── */}
      <section className="quote-sec section-pad">
        <blockquote>"This is the space to introduce<br />your business and what it has to offer"</blockquote>
        <p style={{ marginTop: 28, fontSize: 14, fontWeight: 500 }}>Full Name</p>
      </section>

      {/* ── Second Product Grid ── */}
      <section className="shop-sec section-pad pl pr">
        <div className="wrap" style={{ padding: '0 24px' }}>
          {products.length === 0 ? (
            <div className="grid-4" style={{ gap: 16 }}>
              {[0, 1, 2, 3].map(i => <Ph key={i} className="sq" index={i} />)}
            </div>
          ) : (
            <ProductCarousel products={products} startIndex={2} onSelect={setSelected} />
          )}
        </div>
      </section>

      {/* ── Brand Story Banner ── */}
      <section className="story-sec section-pad pr grad">
        <div>
          <h2>Use this space to<br />promote your eCommerce business.</h2>
          <a className="pill line" href="/about" style={{ marginTop: 28 }}>Our Story</a>
        </div>
      </section>

      {/* ── Promo + Social ── */}
      <section className="promo-sec section-pad pr grid-2">
        <Ph index={1} className="fill" style={{ minHeight: 280, borderRadius: 2 }} />
        <div>
          <p>Use this space to promote your eCommerce business, its products or its services.</p>
          <a className="pill dark" href="#shop" style={{ marginTop: 28, display: 'block' }}>Shop Now</a>
        </div>
      </section>

      {/* ── Gallery Strip ── */}
      <section className="grid-4">
        {[0, 1, 2, 3].map(i => <Ph key={i} index={i + 1} style={{ aspectRatio: '1' }} />)}
      </section>

      {/* ── Footer ── */}
      <footer className="footer section-pad pl pr">
        <nav>
          <p>NAVIGATE</p>
          <a href="/#shop">Shop All</a>
          <a href="/about">Our Story</a>
        </nav>
        <div className="footer-bottom">
          <p className="footer-logo">Logo.</p>
          <p className="footer-copy">© 2035 by Business Name. Powered and secured by Wix</p>
        </div>
      </footer>

      </>}

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onAddedToCart={handleAddedToCart} />}
      {cartOpen && <CartPanel onClose={() => setCartOpen(false)} />}
    </div>
  );
}
