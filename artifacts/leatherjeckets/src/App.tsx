import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useCreateCustomInquiry, useGetProduct, useListProducts } from '@workspace/api-client-react';
import type { CustomInquiryInput, Product } from '@workspace/api-client-react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { Link, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
type CartEntry = { product: Product; size: string; color?: string };
const CART_KEY = 'leatherjeckets-cart';
const loadCart = (): CartEntry[] => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]') as CartEntry[]; } catch { return []; }
};
const money = (cents: number, currency: string) => new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(cents / 100);
const productImage = (product: Product) => product.imageUrl?.trim();

function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} | Leatherjeckets`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
    meta.setAttribute('content', description);
  }, [title, description]);
}

function Header({ cartCount }: { cartCount: number }) {
  const [path] = useLocation();
  const [open, setOpen] = useState(false);
  const links = [['Shop', '/shop'], ['Customize', '/customize'], ['Our workshop', '/about'], ['Shipping', '/shipping'], ['Contact', '/contact']];
  return <header className="header">
    <div className="announcement">MADE IN SIALKOT, SENT WITH CARE — INTERNATIONAL ORDERS WELCOME</div>
    <div className="container-wide nav-wrap">
      <Link href="/" className="brand" aria-label="Leatherjeckets home" data-testid="link-home">
        <span className="brand-mark">L</span><span className="brand-name">leatherjeckets</span>
      </Link>
      <nav className="nav-links" aria-label="Main navigation">
        {links.map(([label, href]) => <Link key={href} href={href} className={`nav-link ${path === href ? 'active' : ''}`} data-testid={`link-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</Link>)}
      </nav>
      <div className="nav-actions">
        <Link href="/cart" className="icon-link" aria-label={`Quote bag, ${cartCount} items`} data-testid="link-cart"><ShoppingBag size={17} strokeWidth={1.6}/><span>Bag</span>{cartCount > 0 && <span className="count-badge">{cartCount}</span>}</Link>
        <button className="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)} data-testid="button-mobile-menu">{open ? <X size={22}/> : <Menu size={22}/>}</button>
      </div>
    </div>
    {open && <nav className="mobile-nav" aria-label="Mobile navigation">{links.map(([label, href]) => <Link key={href} href={href} className="nav-link" onClick={() => setOpen(false)}>{label}</Link>)}<Link href="/cart" className="nav-link" onClick={() => setOpen(false)}>Quote bag ({cartCount})</Link></nav>}
  </header>;
}

function Footer() {
  return <footer className="footer">
    <div className="container-wide">
      <div className="footer-grid">
        <div><Link href="/" className="brand"><span className="brand-mark" style={{ color: '#e3a28a', borderColor: '#e3a28a' }}>L</span><span className="brand-name" style={{ color: '#f1eadb' }}>leatherjeckets</span></Link><p style={{maxWidth:300,color:'#bdc7bc',fontSize:13,lineHeight:1.8,marginTop:20}}>A small workshop in Sialkot. Jackets made slowly, to be worn for years.</p></div>
        <div><div className="footer-title">EXPLORE</div><div className="footer-links"><Link href="/shop">Shop jackets</Link><Link href="/customize">Make it yours</Link><Link href="/about">Our workshop</Link></div></div>
        <div><div className="footer-title">GOOD TO KNOW</div><div className="footer-links"><Link href="/shipping">Shipping & customs</Link><Link href="/contact">Get in touch</Link><a href="/leatherjeckets-source.zip" download>Download source</a></div></div>
        <div><div className="footer-title">MADE BY HAND</div><p style={{fontSize:13,lineHeight:1.8,color:'#bdc7bc',margin:0}}>One jacket at a time, with careful materials and a real person at the other end of every conversation.</p></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} LEATHERJECKETS · SIALKOT, PAKISTAN</span><span>BUILT FOR THE LONG WAY AROUND</span></div>
    </div>
  </footer>;
}

function ProductImage({ product, alt }: { product: Product; alt: string }) {
  const [failed, setFailed] = useState(false);
  const src = productImage(product);
  return src && !failed ? <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} /> : <div className="image-fallback" role="img" aria-label={alt}/>;
}

function ProductCard({ product }: { product: Product }) {
  return <article className="product-card" data-testid={`card-product-${product.id}`}>
    <Link href={`/product/${product.slug}`} className="product-image" aria-label={`View ${product.name}`}>
      <ProductImage product={product} alt={`${product.color} ${product.leatherType} ${product.name} jacket`} />
      {product.badge && <span className="product-tag">{product.badge}</span>}
    </Link>
    <div className="product-info">
      <div><h3><Link href={`/product/${product.slug}`} style={{color:'inherit',textDecoration:'none'}}>{product.name}</Link></h3><p>{product.leatherType} · {product.color}</p></div>
      <span className="price">{money(product.priceCents, product.currency)}</span>
    </div>
  </article>;
}

function Collection({ products, loading, error, onRetry, emptyTitle = 'A quiet moment in the workshop', emptyText = 'There are no published jackets to show just now. Check back soon, or tell us what you have in mind.' }: { products?: Product[]; loading: boolean; error: boolean; onRetry: () => void; emptyTitle?: string; emptyText?: string }) {
  if (loading) return <div className="loading-grid" aria-label="Loading jackets">{[1,2,3].map(n=><div className="skeleton" key={n}/>)}</div>;
  if (error) return <div className="notice"><strong>We could not reach the collection.</strong><p style={{margin:'8px 0 14px'}}>The jackets are still here. Please try again in a moment.</p><button className="button button-outline" onClick={onRetry}>Try again <ArrowRight size={15}/></button></div>;
  if (!products?.length) return <div className="notice"><strong>{emptyTitle}</strong><p>{emptyText}</p><Link className="text-link" href="/customize">Start a personal enquiry <ArrowRight size={15}/></Link></div>;
  return <div className="product-grid">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div>;
}

function HomePage() {
  usePageMeta('Personal leather jackets, made to last', 'Thoughtfully made leather jackets from our small Sialkot workshop. Choose a ready design or begin a personal jacket enquiry.');
  const query = useListProducts();
  const products = (query.data || []).filter(p => p.featured).slice(0,3);
  return <>
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">A JACKET WITH A PLACE OF ORIGIN</span>
          <h1>Made for you.<br/><em>Made to stay.</em></h1>
          <p>From our family workshop in Sialkot, Pakistan: considered leather, measured hands, and the kind of jacket that gathers a life around it.</p>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}><Link className="button" href="/shop">Explore the jackets <ArrowRight size={15}/></Link><Link className="button button-outline" href="/customize">Make it personal <ArrowUpRight size={15}/></Link></div>
        </div>
        <div className="hero-art">
          <img src="/images/atelier-hero.jpg" alt="Leather jacket being carefully worked on in a Sialkot atelier" onError={e => { e.currentTarget.style.display = 'none'; }} />
          <span className="hero-stamp">SIALKOT<br/>HAND FINISHED<br/>SINCE DAY ONE</span><span className="hero-note">THE WORKSHOP · PAKISTAN</span>
        </div>
      </section>
      <div className="container-wide intro-strip"><span>SMALL-BATCH LEATHERWORK</span><span>MADE TO ORDER, NOT MASS PRODUCED</span><span>GLOBAL DELIVERY, CLEAR EXPECTATIONS</span></div>
      <section className="section container-wide">
        <div className="section-head"><div><span className="eyebrow">THE CURRENT EDIT</span><h2>Jackets with a point of view.</h2></div><Link className="text-link" href="/shop">See all jackets <ArrowRight size={15}/></Link></div>
        <Collection products={products} loading={query.isLoading} error={query.isError} onRetry={() => void query.refetch()} emptyTitle="Our next edit is taking shape" emptyText="New jackets will appear here as soon as they are published. We can also make a jacket around your own ideas."/>
      </section>
      <section className="craft-band"><div className="container-wide">
        <div className="craft-layout"><div className="craft-mark">01—03</div><div><span className="eyebrow" style={{color:'#e3a28a'}}>A PERSONAL PROCESS</span><h2>Good work takes the time it takes.</h2><p>We make each jacket with the patience of a small workshop. Ask a question, share a reference, or start with a design you already love. A real person will help you find the right fit.</p><Link className="text-link" href="/about" style={{color:'#f2ecde'}}>Meet the makers <ArrowRight size={15}/></Link></div></div>
        <div className="steps"><div className="step"><span>01 / TALK</span><h3>Tell us your idea</h3><p>Choose from the collection or share the details you want to change.</p></div><div className="step"><span>02 / MAKE</span><h3>We work by hand</h3><p>Your jacket is cut and finished in our workshop, one careful step at a time.</p></div><div className="step"><span>03 / SEND</span><h3>It finds its way to you</h3><p>We share timing and dispatch details directly. No guesswork or hidden promises.</p></div></div>
      </div></section>
      <section className="section container-wide"><div className="promise">
        <article><h3>Made by people</h3><p>Every enquiry reaches our workshop team, not a faceless order queue.</p></article>
        <article><h3>Material with character</h3><p>Leather has natural variation. Those marks are part of the story, not a flaw.</p></article>
        <article><h3>Clear from the start</h3><p>We explain production, delivery and possible import fees before you commit.</p></article>
      </div></section>
    </main>
  </>;
}

function ShopPage() {
  usePageMeta('Shop leather jackets', 'Browse published Leatherjeckets designs. Filter by jacket category and search materials, colors and styles from our Sialkot workshop.');
  const query = useListProducts();
  const products = query.data || [];
  const [category, setCategory] = useState('All jackets');
  const [search, setSearch] = useState('');
  const categories = useMemo(() => ['All jackets', ...Array.from(new Set(products.map(p=>p.category).filter(Boolean)))], [products]);
  const filtered = products.filter(p => (category === 'All jackets' || p.category === category) && `${p.name} ${p.category} ${p.leatherType} ${p.color}`.toLowerCase().includes(search.toLowerCase()));
  return <main className="container-wide">
    <div className="page-head"><span className="eyebrow">THE JACKET ROOM / 01</span><h1>Find your forever layer.</h1><p>Small-run designs from our Sialkot workshop. Search by name, leather or color, then ask us anything before you decide.</p></div>
    <div className="filterbar">{categories.map(cat=><button key={cat} className={`chip ${category===cat?'selected':''}`} onClick={()=>setCategory(cat)} data-testid={`filter-${cat.toLowerCase().replaceAll(' ','-')}`}>{cat}</button>)}<label className="searchbox"><Search size={16}/><input type="search" placeholder="Search the collection" value={search} onChange={e=>setSearch(e.target.value)} aria-label="Search jackets" data-testid="input-search-products"/></label></div>
    <p className="mono" style={{fontSize:9,color:'#8a9186',margin:'0 0 18px'}}>{query.isLoading ? 'GATHERING THE COLLECTION' : `${filtered.length} ${filtered.length===1?'JACKET':'JACKETS'} IN THE EDIT`}</p>
    {query.isError ? <Collection loading={false} error onRetry={()=>void query.refetch()}/> : query.isLoading ? <Collection loading error={false} onRetry={()=>void query.refetch()}/> : filtered.length ? <div className="product-grid">{filtered.map(p=><ProductCard key={p.id} product={p}/>)}</div> : <div className="notice"><strong>{search ? 'Nothing in this edit matches that search.' : 'The collection is between edits.'}</strong><p>{search ? 'Try another material, color or category.' : 'There are no published jackets available at the moment. A personal request is always welcome.'}</p><Link href="/customize" className="text-link">Request a jacket <ArrowRight size={15}/></Link></div>}
    <section className="section" style={{paddingBottom:30}}><div className="about-pull">Not quite the jacket you pictured? <Link href="/customize" style={{color:'#b76249'}}>We can start with a blank page.</Link></div></section>
  </main>;
}

function ProductPage({ addToCart }: { addToCart: (product: Product, size: string) => void }) {
  const params = useParams<{slug:string}>();
  const slug = params.slug || '';
  const query = useGetProduct(slug);
  const product = query.data;
  const [size,setSize] = useState('');
  const [added,setAdded] = useState(false);
  usePageMeta(product ? product.name : 'Jacket details', product ? `${product.name}: ${product.description}` : 'Explore jacket details and request a personal quote from Leatherjeckets.');
  useEffect(()=>{ if(product?.sizes?.length) setSize(product.sizes[0]); },[product?.id]);
  if (query.isLoading) return <main className="container-wide"><div className="detail-layout"><div className="skeleton" style={{aspectRatio:'.9'}}/><div><div className="skeleton" style={{height:36,width:'70%'}}/><div className="skeleton" style={{height:180,marginTop:24}}/></div></div></main>;
  if (query.isError || !product) return <main className="container-wide"><div className="page-head"><span className="eyebrow">JACKET DETAILS</span><h1>We couldn't find that jacket.</h1><p>It may have moved from the collection. Browse the current edit or tell us what you are looking for.</p><button className="button button-outline" onClick={()=>void query.refetch()}>Try again <ArrowRight size={15}/></button> <Link href="/shop" className="button" style={{marginLeft:8}}>Back to shop</Link></div></main>;
  return <main className="container-wide">
    <div style={{paddingTop:28}}><Link className="text-link" href="/shop"><ArrowLeft size={15}/> Back to the jackets</Link></div>
    <div className="detail-layout">
      <div className="detail-visual"><ProductImage product={product} alt={`${product.color} ${product.leatherType} ${product.name} jacket`} />{product.badge && <span className="product-tag">{product.badge}</span>}</div>
      <section className="detail-copy"><span className="eyebrow">{product.category} / MADE IN SIALKOT</span><h1>{product.name}</h1><span className="price">{money(product.priceCents,product.currency)}</span><p className="detail-description">{product.description}</p>
        <div className="spec-grid"><div className="spec"><span>Leather</span><strong>{product.leatherType}</strong></div><div className="spec"><span>Color</span><strong>{product.color}</strong></div><div className="spec"><span>Workshop time</span><strong>About {product.productionDays} days</strong></div><div className="spec"><span>Made in</span><strong>Sialkot, Pakistan</strong></div></div>
        <div className="field"><label htmlFor="jacket-size">Starting size</label><select id="jacket-size" value={size} onChange={e=>setSize(e.target.value)} data-testid="select-product-size">{(product.sizes||[]).map(s=><option key={s} value={s}>{s}</option>)}</select></div>
        <button className="button" style={{width:'100%'}} onClick={()=>{addToCart(product,size);setAdded(true);}} data-testid="button-add-to-quote">{added ? <><Check size={16}/> Added to your quote bag</> : <>Add to quote bag <ArrowRight size={15}/></>}</button>
        <p className="form-note">This is a quote request, not a payment or confirmed order. We will talk through fit, availability and delivery before anything is final.</p>
        <Link href="/shipping" className="text-link" style={{marginTop:19}}>International shipping & customs <ArrowUpRight size={14}/></Link>
      </section>
    </div>
  </main>;
}

function InquiryForm({ initial = {}, buttonText = 'Send my enquiry', className = '' }: { initial?: Partial<CustomInquiryInput>; buttonText?: string; className?: string }) {
  const createInquiry = useCreateCustomInquiry();
  const [values,setValues] = useState({name:'',email:'',country:'',message:'',leatherType:'',color:'',size:'',measurements:'',...initial});
  const [success,setSuccess] = useState<string|null>(null);
  const [error,setError] = useState('');
  const update = (key:keyof typeof values,value:string) => setValues(old=>({...old,[key]:value}));
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(''); setSuccess(null);
    const payload: CustomInquiryInput = {
      name: values.name.trim(), email: values.email.trim(), country: values.country.trim(), message: values.message.trim(),
      productSlug: values.productSlug || null, leatherType: values.leatherType || null, color: values.color || null,
      size: values.size || null, measurements: values.measurements || null,
    };
    createInquiry.mutate({data:payload},{onSuccess:(res)=>{setSuccess(`Thank you. Your enquiry is safely with us (reference ${res.id}). We’ll reply personally.`);setValues(v=>({...v,name:'',email:'',country:'',message:'',measurements:''}));},onError:()=>setError('Your message could not be sent just now. Please try again, or contact us again shortly.')});
  };
  return <div className={`form-shell ${className}`}>
    {success ? <div className="success-panel" role="status"><strong>Enquiry received.</strong><p>{success}</p><button className="button button-outline" onClick={()=>setSuccess(null)}>Send another enquiry</button></div> : <form onSubmit={submit}>
      <div className="form-grid">
        <div className="field"><label htmlFor="inq-name">Your name</label><input id="inq-name" required minLength={2} maxLength={120} value={values.name} onChange={e=>update('name',e.target.value)} placeholder="How should we address you?" data-testid="input-inquiry-name"/></div>
        <div className="field"><label htmlFor="inq-email">Email address</label><input id="inq-email" required type="email" maxLength={254} value={values.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com" data-testid="input-inquiry-email"/></div>
        <div className="field"><label htmlFor="inq-country">Country</label><input id="inq-country" required minLength={2} maxLength={100} value={values.country} onChange={e=>update('country',e.target.value)} placeholder="Where will it travel?" data-testid="input-inquiry-country"/></div>
        <div className="field"><label htmlFor="inq-leather">Leather preference</label><input id="inq-leather" value={values.leatherType ?? ''} onChange={e=>update('leatherType',e.target.value)} placeholder="If you have one" data-testid="input-inquiry-leather"/></div>
        <div className="field"><label htmlFor="inq-color">Color</label><input id="inq-color" value={values.color ?? ''} onChange={e=>update('color',e.target.value)} placeholder="Your preferred shade" data-testid="input-inquiry-color"/></div>
        <div className="field"><label htmlFor="inq-size">Usual size</label><input id="inq-size" value={values.size ?? ''} onChange={e=>update('size',e.target.value)} placeholder="Optional" data-testid="input-inquiry-size"/></div>
        <div className="field wide"><label htmlFor="inq-measurements">Measurements or fit notes</label><textarea id="inq-measurements" value={values.measurements ?? ''} onChange={e=>update('measurements',e.target.value)} placeholder="A few details help, but you can also share these later." data-testid="input-inquiry-measurements"/></div>
        <div className="field wide"><label htmlFor="inq-message">What are you imagining?</label><textarea id="inq-message" required minLength={10} maxLength={4000} value={values.message} onChange={e=>update('message',e.target.value)} placeholder="Tell us about the jacket, ask a question, or share the changes you have in mind." data-testid="input-inquiry-message"/></div>
      </div>
      {error && <p role="alert" style={{color:'#a34034',fontSize:13}}>{error}</p>}
      <button className="button" type="submit" disabled={createInquiry.isPending} data-testid="button-submit-inquiry">{createInquiry.isPending ? 'Sending your note…' : buttonText} {!createInquiry.isPending && <ArrowRight size={15}/>}</button>
      <p className="form-note">No payment is taken here. We’ll reply with a personal conversation and a clear quote before you decide.</p>
    </form>}
  </div>;
}

function CustomizePage() {
  usePageMeta('Customize a leather jacket', 'Share your jacket idea and preferred leather, color, size and measurements. Our Sialkot workshop will reply with a personal quote.');
  const query = useListProducts();
  const [selectedSlug,setSelectedSlug] = useState('');
  const jacket = (query.data||[]).find(p=>p.slug===selectedSlug);
  return <main className="container-wide">
    <div className="page-head"><span className="eyebrow">THE MADE-FOR-YOU DESK / 02</span><h1>Start with a conversation.</h1><p>Pick a starting point, tell us what you would change, and our workshop will come back with thoughtful next steps and a quote. Nothing is charged here.</p></div>
    <div style={{maxWidth:760,margin:'0 auto 18px'}}><div className="field"><label htmlFor="base-jacket">A design to start from <span style={{textTransform:'none',letterSpacing:0}}>(optional)</span></label><select id="base-jacket" value={selectedSlug} onChange={e=>setSelectedSlug(e.target.value)} data-testid="select-customize-product"><option value="">I have my own idea</option>{(query.data||[]).map(p=><option key={p.id} value={p.slug}>{p.name}</option>)}</select></div></div>
    {query.isError && <p className="form-note" style={{maxWidth:760,margin:'0 auto 16px'}}>The collection could not load. You can still describe an original design below.</p>}
    <InquiryForm key={selectedSlug} initial={{productSlug:selectedSlug||null,leatherType:jacket?.leatherType||'',color:jacket?.color||''}} buttonText="Ask for a personal quote"/>
    <div style={{maxWidth:760,margin:'20px auto'}} className="form-note">Typical workshop time depends on the design and fit. We will confirm timing directly; the estimate on a product page is not a delivery date.</div>
  </main>;
}

function CartPage({ cart, removeItem }: { cart: CartEntry[]; removeItem: (index:number)=>void }) {
  usePageMeta('Your quote bag', 'Review jackets saved to your quote bag. No payment is taken; continue to a personal inquiry for pricing and details.');
  const sameCurrency = cart.every(item=>item.product.currency===cart[0]?.product.currency);
  const total = cart.reduce((sum,item)=>sum+item.product.priceCents,0);
  return <main className="container-wide">
    <div className="page-head"><span className="eyebrow">YOUR SHORTLIST / {String(cart.length).padStart(2,'0')}</span><h1>A few good possibilities.</h1><p>Your bag keeps the jackets you are considering. It is a starting point for a quote, not a checkout or confirmed order.</p></div>
    {cart.length ? <>
      <div>{cart.map((item,index)=><article className="cart-row" key={`${item.product.id}-${index}`} data-testid={`cart-item-${item.product.id}-${index}`}>
        <div className="cart-thumb"><ProductImage product={item.product} alt={`${item.product.name} jacket`}/></div>
        <div><h3>{item.product.name}</h3><p>{item.product.leatherType} · {item.product.color}{item.size ? ` · Size ${item.size}` : ''}</p><p style={{marginTop:8}}>About {item.product.productionDays} workshop days</p></div>
        <div className="cart-end"><span className="price">{money(item.product.priceCents,item.product.currency)}</span><button className="text-link" style={{border:0,background:'none',cursor:'pointer',padding:4}} onClick={()=>removeItem(index)} data-testid={`button-remove-${item.product.id}-${index}`}><X size={14}/> Remove</button></div>
      </article>)}</div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',gap:30,padding:'26px 0',flexWrap:'wrap'}}>
        <div><span className="mono" style={{fontSize:9,color:'#879084'}}>INDICATIVE LIST PRICE{sameCurrency ? '' : 'S'}</span><div className="serif" style={{fontSize:34,marginTop:5}}>{sameCurrency ? money(total,cart[0].product.currency) : 'See item prices'}</div><p className="form-note" style={{maxWidth:440}}>Final pricing, fit and international delivery will be confirmed with you. Customs or import fees may be charged by your country and are not included.</p></div>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}><Link href="/shop" className="button button-outline"><ArrowLeft size={15}/> Keep browsing</Link><Link href="/customize" className="button">Request a quote <ArrowRight size={15}/></Link></div>
      </div>
    </> : <div className="notice"><strong>Your quote bag is waiting for its first jacket.</strong><p>Save designs you are considering, then send them to us as the start of a no-pressure conversation.</p><Link href="/shop" className="button" style={{marginTop:8}}>Browse the jackets <ArrowRight size={15}/></Link></div>}
  </main>;
}

function AboutPage() {
  usePageMeta('Our workshop and craftsmanship', 'Meet the people and patient handwork behind Leatherjeckets, a small leather jacket workshop in Sialkot, Pakistan.');
  return <main className="container-wide">
    <div className="page-head"><span className="eyebrow">OUR WORKSHOP / SIALKOT, PAKISTAN</span><h1>Good leatherwork is a conversation between hands and time.</h1><p>Leatherjeckets is built around a simple belief: a jacket should feel considered before it ever feels worn in.</p></div>
    <div className="story-layout"><div className="story-art" role="img" aria-label="A leather jacket taking shape in a craft workshop"/><div><span className="story-number">01 — A PLACE OF MAKING</span><h2>Made in a city that knows its craft.</h2><p>Sialkot has long been a city of skilled makers. Our workshop is part of that living tradition: a place where pattern, leather and patient hands meet at the workbench.</p><p>We keep the scale personal on purpose. The person who answers your question knows what goes into making your jacket, and can talk honestly about what is possible.</p><Link href="/contact" className="text-link">Talk with the workshop <ArrowRight size={15}/></Link></div></div>
    <section className="section"><div className="about-pull">“A good jacket should tell you where it came from — and leave room for where it is going.”</div></section>
    <section className="section" style={{paddingTop:0}}><div className="section-head"><div><span className="eyebrow">THE WORK, UP CLOSE</span><h2>Thought through, then made by hand.</h2></div></div><div className="steps"><div className="step"><span>01 / MATERIAL</span><h3>Choose with care</h3><p>Leather is a natural material. Grain, shade and small marks vary, giving each finished jacket its own character.</p></div><div className="step"><span>02 / PATTERN</span><h3>Fit is personal</h3><p>We start from a considered design and can talk through adjustments, sizing and measurements with you.</p></div><div className="step"><span>03 / FINISH</span><h3>Details matter</h3><p>Edges, seams and hardware are handled with the aim of making something you will want to reach for again.</p></div></div></section>
    <section className="promise"><article><h3>Honest about timing</h3><p>Workshop estimates are discussed with you and can shift with the design.</p></article><article><h3>Personal by design</h3><p>Custom changes start with a conversation, not a long menu of unchecked options.</p></article><article><h3>Made to be worn</h3><p>We make jackets for real lives, not a perfect studio photograph.</p></article></section>
  </main>;
}

function ShippingPage() {
  usePageMeta('International shipping and customs', 'Understand how Leatherjeckets handles international delivery, dispatch communication, customs and possible import charges.');
  return <main className="container-wide">
    <div className="page-head"><span className="eyebrow">FROM OUR WORKSHOP TO YOUR DOOR</span><h1>Going a long way, with clear expectations.</h1><p>We ship internationally from Sialkot. Delivery timing and import rules depend on your destination, so we talk through the details before your order is confirmed.</p></div>
    <div className="shipping-list">
      <article className="shipping-item"><span className="num">01</span><div><h2>First, we confirm the plan</h2><p>After your inquiry, we will confirm the jacket details, production estimate and shipping options available for your country. A workshop estimate is not a guaranteed arrival date.</p></div></article>
      <article className="shipping-item"><span className="num">02</span><div><h2>Dispatch from Pakistan</h2><p>When your jacket is ready, we will share dispatch information and any tracking details that apply to the agreed shipping service. Transit times can vary by route and local processing.</p></div></article>
      <article className="shipping-item"><span className="num">03</span><div><h2>Customs and import fees</h2><p>International orders may be subject to duties, taxes or handling fees charged by the destination country. These are set by local authorities, are not included in our jacket prices, and are typically the customer's responsibility. We cannot calculate or promise the amount in advance.</p></div></article>
      <article className="shipping-item"><span className="num">04</span><div><h2>Need a little clarity?</h2><p>Tell us your country before confirming. We will explain what we can about the shipping arrangement and help you understand what to check with your local customs office.</p><Link href="/contact" className="text-link" style={{marginTop:15}}>Ask us about your destination <ArrowRight size={15}/></Link></div></article>
    </div>
    <section className="section"><div className="notice"><strong>No surprise checkout.</strong><p>There is no payment step on this site. We confirm the final quote and practical details with you directly before you commit.</p></div></section>
  </main>;
}

function ContactPage() {
  usePageMeta('Contact the Leatherjeckets workshop', 'Send a question or custom jacket inquiry directly to the Leatherjeckets team in Sialkot, Pakistan.');
  return <main className="container-wide">
    <div className="page-head"><span className="eyebrow">A REAL PERSON IS ON THE OTHER END</span><h1>Tell us what you have in mind.</h1><p>Ask about a jacket, share a custom idea, or simply find out whether something is possible. We like a good question.</p></div>
    <div className="contact-layout"><aside><div className="contact-card"><span className="eyebrow">THE WORKSHOP</span><p>Sialkot, Pakistan<br/>Working with customers around the world.</p></div><div className="contact-card"><span className="eyebrow">WHAT HAPPENS NEXT</span><p>Your note comes to our team. We will reply personally with questions, possibilities or a clear quote. Nothing is charged by sending this form.</p></div><div className="contact-card"><span className="eyebrow">A HELPFUL NOTE</span><p>For shipping questions, tell us which country your jacket would travel to.</p><Link href="/shipping" className="text-link">Read about international delivery <ArrowUpRight size={14}/></Link></div></aside><InquiryForm buttonText="Send a note to the workshop"/></div>
  </main>;
}

function NotFound() {
  usePageMeta('Page not found', 'The page you are looking for is not part of the Leatherjeckets workshop.');
  return <main className="notfound"><span className="eyebrow">A WRONG TURN, PERHAPS</span><h1>Not this way.</h1><p style={{color:'#68766d',marginBottom:28}}>That page is not in our pattern book.</p><Link className="button" href="/">Return to the workshop <ArrowRight size={15}/></Link></main>;
}

function Router({ cart, addToCart, removeItem }: {cart:CartEntry[];addToCart:(p:Product,s:string)=>void;removeItem:(i:number)=>void}) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>
    <Switch>
      <Route path="/" component={HomePage}/>
      <Route path="/shop" component={ShopPage}/>
      <Route path="/product/:slug"><ProductPage addToCart={addToCart}/></Route>
      <Route path="/customize" component={CustomizePage}/>
      <Route path="/cart"><CartPage cart={cart} removeItem={removeItem}/></Route>
      <Route path="/about" component={AboutPage}/>
      <Route path="/shipping" component={ShippingPage}/>
      <Route path="/contact" component={ContactPage}/>
      <Route component={NotFound}/>
    </Switch>
  </ErrorBoundary>;
}

function App() {
  const [cart,setCart] = useState<CartEntry[]>(loadCart);
  useEffect(()=>{localStorage.setItem(CART_KEY,JSON.stringify(cart));},[cart]);
  const addToCart = (product:Product,size:string) => setCart(old=>[...old,{product,size}]);
  const removeItem = (index:number) => setCart(old=>old.filter((_,i)=>i!==index));
  return <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/,'')}>
        <div className="site-shell"><Header cartCount={cart.length}/><Router cart={cart} addToCart={addToCart} removeItem={removeItem}/><Footer/></div>
      </WouterRouter>
      <Toaster/>
    </TooltipProvider>
  </QueryClientProvider>;
}

export default App;
