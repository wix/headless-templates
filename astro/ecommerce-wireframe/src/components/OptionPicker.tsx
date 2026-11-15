// Options (variant-defining) and modifiers (extra input) for one product.
// Shared by quick add and the product page so they can't drift.
import { isColorOption, choiceSelectable } from "../lib/store";

type Props = {
  product: any; idx: Map<string, any>;
  selected: Record<string, string>; onSelect: (optionId: string, choiceId: string) => void;
  mods: Record<string, string>; onMod: (key: string, value: string) => void;
  showErrors?: boolean; compact?: boolean;
};

export default function OptionPicker({ product, idx, selected, onSelect, mods, onMod, showErrors, compact }: Props) {
  return (
    <div className="picker">
      {(product.options ?? []).map((o: any) => {
        const chosen = o.choicesSettings?.choices?.find((c: any) => c.choiceId === selected[o._id]);
        const missing = showErrors && !chosen;
        return (
          <fieldset key={o._id} className="picker__group">
            <legend className="picker__legend">
              <span className="field__label">{o.name}</span>
              <span className={missing ? "field__error" : "muted small"}>{chosen ? chosen.name : missing ? `Choose a ${String(o.name).toLowerCase()}` : ""}</span>
            </legend>
            <div className="choice-row" role="radiogroup" aria-label={o.name}>
              {(o.choicesSettings?.choices ?? []).filter((c: any) => c.visible !== false).map((c: any) => {
                const ok = choiceSelectable(product, idx, selected, o._id, c.choiceId);
                const on = selected[o._id] === c.choiceId;
                const label = `${c.name}${ok ? "" : " — out of stock"}`;
                return isColorOption(o) ? (
                  <button key={c.choiceId} type="button" role="radio" aria-checked={on} aria-label={label}
                    className="swatch" data-unavailable={!ok} onClick={() => onSelect(o._id, c.choiceId)}>
                    <span className="swatch__dot" style={{ background: c.colorCode ?? "var(--media)" }} />
                  </button>
                ) : (
                  <button key={c.choiceId} type="button" role="radio" aria-checked={on} aria-label={label}
                    className="pill" data-unavailable={!ok} onClick={() => onSelect(o._id, c.choiceId)}>{c.name}</button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
      {(product.modifiers ?? []).map((m: any) => {
        const k = m.modifierRenderType === "FREE_TEXT" ? m.freeTextSettings?.key ?? m.key : m.key;
        const v = mods[k] ?? "";
        const missing = showErrors && m.mandatory && !v.trim();
        if (m.modifierRenderType === "FREE_TEXT") {
          const id = `mod-${k}`;
          return (
            <div key={k} className="field">
              <label htmlFor={id} className="field__label">{m.freeTextSettings?.title || m.name}{m.mandatory ? "" : " (optional)"}</label>
              <input id={id} className="input" value={v} maxLength={m.freeTextSettings?.maxCharCount || undefined}
                aria-invalid={missing || undefined} aria-describedby={`${id}-hint`} onChange={(e) => onMod(k, e.target.value)} />
              <span id={`${id}-hint`} className={missing ? "field__error" : "field__hint"}>
                {missing ? `Add your ${String(m.name).toLowerCase()}` : m.freeTextSettings?.maxCharCount ? `${v.length} / ${m.freeTextSettings.maxCharCount} characters` : ""}
              </span>
            </div>
          );
        }
        return (
          <fieldset key={k} className="picker__group">
            <legend className="picker__legend"><span className="field__label">{m.name}{m.mandatory ? "" : " (optional)"}</span>
              {missing ? <span className="field__error">Choose an option</span> : null}</legend>
            <div className="choice-row" role="radiogroup" aria-label={m.name}>
              {(m.choicesSettings?.choices ?? []).map((c: any) => (
                <button key={c.key} type="button" role="radio" aria-checked={v === c.key} className="pill"
                  onClick={() => onMod(k, v === c.key && !m.mandatory ? "" : c.key)}>
                  {c.name}{c.addedPrice && Number(c.addedPrice) > 0 ? ` (+${c.addedPrice})` : ""}
                </button>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
