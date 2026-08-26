import { useEffect, useMemo, useState } from "react";
import { imgSrc } from "./imgSrc.js";
import { richTextToHtml } from "../lib/richText.js";
import { money } from "../lib/money.js";

const DARK = "#1a1d2e";
const GRAD = "linear-gradient(135deg, #dde9de 0%, #eaedf4 55%, #e0dced 100%)";
const CARD_GRAD = "linear-gradient(140deg, #e4ede6 0%, #d8e0ec 100%)";
const CARD_GRAD2 = "linear-gradient(140deg, #e8eddf 0%, #dde4ec 100%)";
const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
	const [isMobile, setIsMobile] = useState(false);
	useEffect(() => {
		const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, []);
	return isMobile;
}

function GradPlaceholder({ style, index = 0 }) {
	const grads = [
		CARD_GRAD,
		CARD_GRAD2,
		"linear-gradient(140deg, #e2e8f0 0%, #e8e4ec 100%)",
		"linear-gradient(140deg, #deeae0 0%, #e4e0ec 100%)",
	];
	return <div style={{ background: grads[index % grads.length], ...style }} />;
}

function HamburgerIcon({ open }) {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.8">
			{open ? (
				<>
					<line x1="5" y1="5" x2="19" y2="19" />
					<line x1="19" y1="5" x2="5" y2="19" />
				</>
			) : (
				<>
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="3" y1="12" x2="21" y2="12" />
					<line x1="3" y1="18" x2="21" y2="18" />
				</>
			)}
		</svg>
	);
}

function Header({ categories, active, onSelect }) {
	const isMobile = useIsMobile();
	const [menuOpen, setMenuOpen] = useState(false);

	const links = [
		{ key: null, label: "All" },
		...categories.map((c) => ({ key: c, label: c })),
	];

	function select(key) {
		onSelect(key);
		setMenuOpen(false);
	}

	return (
		<header
			style={{
				background: "#fff",
				borderBottom: "1px solid #e5e7eb",
				position: "sticky",
				top: 0,
				zIndex: 100,
			}}
		>
			<div
				style={{
					maxWidth: 1280,
					margin: "0 auto",
					padding: "0 clamp(20px, 5vw, 40px)",
					height: 72,
					display: "flex",
					alignItems: "center",
					gap: 40,
				}}
			>
				<a
					href="/"
					style={{
						all: "unset",
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						gap: 10,
						flexShrink: 0,
					}}
				>
					<div
						style={{
							width: 36,
							height: 36,
							borderRadius: "50%",
							background: GRAD,
							border: "1px solid #e0e0e0",
						}}
					/>
					<span style={{ fontWeight: 700, fontSize: 15, color: DARK }}>
						Brand Name
					</span>
				</a>

				{isMobile ? (
					<button
						onClick={() => setMenuOpen((v) => !v)}
						aria-label="Toggle menu"
						style={{
							all: "unset",
							cursor: "pointer",
							marginLeft: "auto",
							display: "flex",
							alignItems: "center",
						}}
					>
						<HamburgerIcon open={menuOpen} />
					</button>
				) : (
					<nav style={{ display: "flex", gap: 24, flex: 1, flexWrap: "wrap" }}>
						{links.map((l) => (
							<button
								key={l.key ?? "all"}
								onClick={() => select(l.key)}
								style={navLinkStyle(active === l.key)}
							>
								{l.label}
							</button>
						))}
					</nav>
				)}
			</div>

			{isMobile && menuOpen && (
				<nav
					style={{
						display: "flex",
						flexDirection: "column",
						borderTop: "1px solid #e5e7eb",
						padding: "12px 20px 20px",
					}}
				>
					{links.map((l) => (
						<button
							key={l.key ?? "all"}
							onClick={() => select(l.key)}
							style={{ ...navLinkStyle(active === l.key), padding: "10px 0", textAlign: "left" }}
						>
							{l.label}
						</button>
					))}
				</nav>
			)}
		</header>
	);
}

function navLinkStyle(isActive) {
	return {
		all: "unset",
		cursor: "pointer",
		fontSize: 14,
		color: DARK,
		fontWeight: isActive ? 600 : 400,
		opacity: isActive ? 1 : 0.8,
	};
}

function Hero() {
	return (
		<section
			style={{
				background: GRAD,
				padding: "clamp(36px, 7vw, 80px) clamp(20px, 5vw, 40px)",
				paddingLeft: "max(20px, calc((100vw - 1280px) / 2 + 40px))",
			}}
		>
			<div style={{ maxWidth: 640 }}>
				<h1
					style={{
						fontSize: "clamp(32px, 7vw, 72px)",
						fontWeight: 400,
						lineHeight: 1.05,
						letterSpacing: "-0.02em",
						color: DARK,
						margin: 0,
					}}
				>
					Add your CMS business name or title here
				</h1>
				<p style={{ marginTop: 20, fontSize: 15, lineHeight: 1.7, opacity: 0.6, maxWidth: 480 }}>
					Every item below is pulled live from a Wix CMS collection — add, edit, or
					remove one in your dashboard and it appears here automatically.
				</p>
				<a
					href="#shop"
					style={{
						display: "inline-block",
						marginTop: 28,
						padding: "14px 32px",
						background: DARK,
						color: "#fff",
						border: "none",
						borderRadius: 24,
						fontSize: 15,
						fontWeight: 500,
						textDecoration: "none",
					}}
				>
					Shop Now
				</a>
			</div>
		</section>
	);
}

function ProductCard({ item, index, onOpen }) {
	const src = imgSrc(item.image, 600, 600);
	return (
		<button
			onClick={() => onOpen(item)}
			style={{ all: "unset", cursor: "pointer", display: "block", textAlign: "left" }}
		>
			<div style={{ width: "100%", aspectRatio: "1", overflow: "hidden", borderRadius: 2 }}>
				{src ? (
					<img
						src={src}
						alt={item.name}
						style={{ width: "100%", height: "100%", objectFit: "cover" }}
					/>
				) : (
					<GradPlaceholder style={{ width: "100%", height: "100%" }} index={index} />
				)}
			</div>
			<p style={{ marginTop: 10, fontSize: 13, fontWeight: 500, color: DARK }}>
				{item.name}
			</p>
			<p style={{ marginTop: 3, fontSize: 13, color: "#6b7280" }}>{money(item.price, item.currency)}</p>
		</button>
	);
}

function ProductModal({ item, onClose }) {
	if (!item) return null;
	const src = imgSrc(item.image, 800, 800);
	return (
		<div
			onClick={onClose}
			style={{
				position: "fixed",
				inset: 0,
				background: "rgba(26,29,46,0.5)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 200,
				padding: 24,
			}}
		>
			<div
				onClick={(e) => e.stopPropagation()}
				style={{
					background: "#fff",
					borderRadius: 4,
					maxWidth: 680,
					width: "100%",
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
					overflow: "hidden",
					boxShadow: "0 20px 60px rgba(26,29,46,0.2)",
				}}
			>
				{src ? (
					<img
						src={src}
						alt={item.name}
						style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
					/>
				) : (
					<GradPlaceholder style={{ minHeight: 360 }} index={0} />
				)}
				<div style={{ padding: "clamp(20px, 5vw, 36px)", display: "flex", flexDirection: "column", gap: 16 }}>
					<button
						onClick={onClose}
						style={{
							alignSelf: "flex-end",
							background: "none",
							border: "none",
							fontSize: 22,
							opacity: 0.35,
							cursor: "pointer",
						}}
					>
						×
					</button>
					<div>
						<p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", opacity: 0.45 }}>
							{item.category?.toUpperCase()}
						</p>
						<p style={{ marginTop: 6, fontSize: 20, fontWeight: 600, lineHeight: 1.3, color: DARK }}>
							{item.name}
						</p>
						<div
							style={{ marginTop: 8, fontSize: 13, opacity: 0.6, lineHeight: 1.7 }}
							dangerouslySetInnerHTML={{ __html: richTextToHtml(item.description) }}
						/>
					</div>
					<p style={{ fontSize: 18, fontWeight: 500, color: DARK }}>{money(item.price, item.currency)}</p>
					<a
						href={`/catalog/${item._id}`}
						style={{
							marginTop: "auto",
							padding: "13px 0",
							background: DARK,
							color: "#fff",
							border: "none",
							borderRadius: 24,
							fontSize: 14,
							fontWeight: 600,
							textAlign: "center",
							textDecoration: "none",
						}}
					>
						View Full Page
					</a>
				</div>
			</div>
		</div>
	);
}

function Footer() {
	return (
		<footer
			style={{
				background: DARK,
				color: "#fff",
				padding: "60px max(20px, calc((100vw - 1280px) / 2 + 40px)) 0",
			}}
		>
			<nav style={{ paddingBottom: 60 }}>
				<p style={footerHeadingStyle}>NAVIGATE</p>
				<a href="/#shop" style={footerLinkStyle}>
					Shop All
				</a>
			</nav>
			<div style={{ borderTop: "1px solid #2d3348", padding: "48px 0 32px", textAlign: "center" }}>
				<p
					style={{
						fontSize: "clamp(60px, 12vw, 140px)",
						fontWeight: 800,
						lineHeight: 0.9,
						letterSpacing: "-0.03em",
						color: "#fff",
						margin: 0,
					}}
				>
					Logo.
				</p>
				<p style={{ marginTop: 40, paddingBottom: 32, fontSize: 13, color: "#6b7080" }}>
					© {new Date().getFullYear()} by Business Name. Powered and secured by Wix.
				</p>
			</div>
		</footer>
	);
}

const footerHeadingStyle = {
	fontSize: 12,
	fontWeight: 600,
	letterSpacing: "0.1em",
	color: "#8b8f9a",
	marginBottom: 16,
};

const footerLinkStyle = {
	display: "block",
	fontSize: 14,
	marginBottom: 10,
	color: "#d1d5db",
	textDecoration: "none",
};

export default function CatalogIsland({ items }) {
	const [category, setCategory] = useState(null);
	const [openItem, setOpenItem] = useState(null);

	const categories = useMemo(
		() => [...new Set((items || []).map((i) => i.category).filter(Boolean))],
		[items],
	);

	const visible = useMemo(
		() => (items || []).filter((i) => (category ? i.category === category : true)),
		[items, category],
	);

	return (
		<div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", color: DARK }}>
			<Header categories={categories} active={category} onSelect={setCategory} />
			<Hero />
			<section
				id="shop"
				style={{
					padding: "clamp(32px, 6vw, 60px) max(20px, calc((100vw - 1280px) / 2 + 40px))",
					flex: 1,
				}}
			>
				{visible.length === 0 ? (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
							gap: 16,
						}}
					>
						{[0, 1, 2, 3].map((i) => (
							<GradPlaceholder key={i} style={{ aspectRatio: "1", borderRadius: 2 }} index={i} />
						))}
					</div>
				) : (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
							gap: 16,
						}}
					>
						{visible.map((item, i) => (
							<ProductCard key={item._id} item={item} index={i} onOpen={setOpenItem} />
						))}
					</div>
				)}
			</section>
			<Footer />
			<ProductModal item={openItem} onClose={() => setOpenItem(null)} />
		</div>
	);
}
