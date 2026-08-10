import { imgSrc } from "./imgSrc.js";
import { richTextToHtml } from "../lib/richText.js";
import { money } from "../lib/money.js";

const DARK = "#1a1d2e";
const GRAD = "linear-gradient(135deg, #dde9de 0%, #eaedf4 55%, #e0dced 100%)";

export default function ItemDetailIsland({ item }) {
	if (!item) {
		return (
			<div
				style={{
					minHeight: "100dvh",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 16,
					color: DARK,
				}}
			>
				<p>We couldn't find that item.</p>
				<a href="/" style={{ color: DARK, fontWeight: 600 }}>
					Back to the collection
				</a>
			</div>
		);
	}

	const src = imgSrc(item.image, 900, 900);

	return (
		<div style={{ minHeight: "100dvh", color: DARK }}>
			<div
				style={{
					maxWidth: 1280,
					margin: "0 auto",
					padding: "40px max(40px, calc((100vw - 1280px) / 2 + 40px))",
				}}
			>
				<a
					href="/"
					style={{
						display: "inline-block",
						marginBottom: 32,
						color: DARK,
						opacity: 0.6,
						textDecoration: "none",
						fontSize: 14,
					}}
				>
					← Back to the collection
				</a>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 60,
						alignItems: "start",
					}}
				>
					<div style={{ width: "100%", aspectRatio: "1", overflow: "hidden", borderRadius: 2 }}>
						{src ? (
							<img
								src={src}
								alt={item.name}
								style={{ width: "100%", height: "100%", objectFit: "cover" }}
							/>
						) : (
							<div style={{ width: "100%", height: "100%", background: GRAD }} />
						)}
					</div>
					<div>
						<p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", opacity: 0.45 }}>
							{item.category?.toUpperCase()}
						</p>
						<h1
							style={{
								margin: "10px 0 4px",
								fontSize: "clamp(28px, 3.5vw, 44px)",
								fontWeight: 400,
								lineHeight: 1.15,
								letterSpacing: "-0.01em",
							}}
						>
							{item.name}
						</h1>
						<p style={{ fontSize: 20, fontWeight: 500 }}>{money(item.price, item.currency)}</p>
						<div
							style={{ marginTop: 20, fontSize: 15, lineHeight: 1.8, opacity: 0.7 }}
							dangerouslySetInnerHTML={{ __html: richTextToHtml(item.description) }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
