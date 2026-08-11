import { media } from "@wix/sdk";

export function imgSrc(v, w = 800, h = 600) {
	if (!v) return "";
	if (typeof v === "string" && v.startsWith("wix:image://")) {
		return media.getScaledToFillImageUrl(v, w, h, {});
	}
	return typeof v === "string" ? v : (v?.url ?? "");
}
