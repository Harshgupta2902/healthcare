/**
 * Builds HTML for prescription PDF — letterhead + DB prescription body + footer.
 *
 * We **do not** use `doc.html()`: jsPDF clones into `.html2pdf__overlay` at `left:-100000px`, which skews
 * html2canvas coordinates so the first PDF pages can be blank and the header shifts horizontally.
 * Instead: `html2canvas` on the live `.rx-wrap` shell, then `jsPDF.addImage` with multipage slicing.
 *
 * Tailwind `oklch()` mitigation:
 * 1) inject `PRESCRIPTION_PDF_STYLE_CSS` into `document.head` while rendering;
 * 2) strip Lexical/Tailwind `class` and inline `style` on **descendants** of `.rx-body` (keep `.rx-body` for PDF CSS).
 */

export const HEALTHHERE_PDF_BRANDING = {
    companyName: "HealthHere",
    tagline: "Making quality healthcare accessible and convenient for everyone.",
    addressLine: "Serving patients digitally across India",
    email: "care@healthhere.com",
    phone: "+91 9981322736",
} as const;

/** Temp `<style>` id — removed after PDF render */
export const HEALTHHERE_PDF_HEAD_STYLE_ID = "healthhere-prescription-pdf-styles";

/** Full-screen mask while html2canvas runs — sits above the off-screen shell so the UI never flashes the letter HTML */
export const HEALTHHERE_PDF_MASK_ID = "healthhere-prescription-pdf-mask";

export const PRESCRIPTION_PDF_STYLE_CSS = `
  .rx-wrap { font-family: ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #0f172a; font-size: 13px; line-height: 1.45; box-sizing: border-box; background: #ffffff; }
  .rx-wrap * { box-sizing: border-box; }
  .rx-header { display: flex; min-height: 108px; background: linear-gradient(115deg, #0d9488 0%, #14b8a6 42%, #5eead4 72%, #f8fafc 100%); border-radius: 0 0 12px 12px; overflow: hidden; }
  .rx-header-left { flex: 1; padding: 22px 20px 20px 24px; }
  .rx-doctor { font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; line-height: 1.15; }
  .rx-qual { margin-top: 6px; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.92); text-transform: uppercase; letter-spacing: 0.14em; }
  .rx-header-right { width: 112px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.25); }
  .rx-badge { width: 72px; height: 72px; border-radius: 50%; background: #0f766e; border: 3px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 34px; line-height: 1; }
  .rx-patient { padding: 18px 8px 4px 8px; }
  .rx-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px 16px; margin-bottom: 10px; }
  .rx-label { font-weight: 700; color: #334155; font-size: 12px; white-space: nowrap; }
  .rx-line { flex: 1; min-width: 80px; border-bottom: 1px solid #94a3b8; min-height: 18px; padding: 0 6px 2px 0px; color: #0f172a; font-weight: 600; white-space: nowrap; }
  .rx-line-short { flex: 0 0 100px; }
  .rx-row-top { flex-wrap: nowrap; gap: 8px 12px; }
  .rx-line-name { flex: 1 1 auto; min-width: 150px; }
  .rx-line-date { flex: 0 0 132px; min-width: 110px; }
  .rx-line-age { flex: 0 0 42px; min-width: 42px; }
  .rx-line-sex { flex: 0 0 58px; min-width: 58px; }
  .rx-row-diag { flex-wrap: nowrap; gap: 8px 12px; }
  .rx-row-diag .rx-label { flex-shrink: 0; }
  .rx-line-diag { flex: 1 1 auto; min-width: 160px; }
  .rx-line-blood { flex: 0 0 58px; min-width: 58px; }
  .rx-line-weight { flex: 0 0 68px; min-width: 68px; }
  .rx-line-height { flex: 0 0 68px; min-width: 68px; }
  .rx-main { display: flex; gap: 12px; margin-top: 14px; padding: 0 8px 8px 8px; }
  .rx-symbol { font-size: 42px; font-weight: 800; color: #1e3a5f; line-height: 1; padding-top: 4px; flex-shrink: 0; }
  .rx-body { flex: 1; min-height: 280px; font-size: 12px; color: #1e293b; }
  .rx-body h1, .rx-body h2, .rx-body h3 { margin: 0.4em 0; font-weight: 700; color: #0f172a; }
  .rx-body p { margin: 0.35em 0; }
  .rx-body ul, .rx-body ol { margin: 0.35em 0; padding-left: 1.25em; }
  .rx-body table { border-collapse: collapse; width: 100%; margin: 0.5em 0; font-size: 11px; }
  .rx-body th, .rx-body td { border: 1px solid #cbd5e1; padding: 4px 6px; vertical-align: top; }
  .rx-body img { max-width: 100%; height: auto; }
  .rx-body a { color: #1d4ed8 !important; text-decoration: underline !important; }
  .rx-sign { margin-top: 36px; padding: 0 12px 8px 12px; text-align: right; }
  .rx-sign-line { display: inline-block; min-width: 180px; border-bottom: 1px solid #334155; margin-bottom: 4px; }
  .rx-sign-label { font-size: 11px; color: #475569; }
  .rx-footer { margin-top: 12px; padding: 14px 18px; background: #e2e8f0; border-radius: 10px 10px 0 0; display: flex; flex-wrap: wrap; gap: 10px 20px; justify-content: space-between; align-items: center; font-size: 11px; color: #1e293b; }
  .rx-footer-brand { font-weight: 800; font-size: 12px; color: #0f172a; letter-spacing: 0.06em; }
  .rx-footer-mid { flex: 1; min-width: 160px; text-align: center; color: #475569; }
  .rx-footer-right { text-align: right; color: #475569; white-space: nowrap; }
`.trim();

export type PrescriptionPdfLayoutInput = {
    prescriptionHtml: string;
    doctorDisplayName: string;
    qualificationLine: string;
    patientFullName: string;
    issueDateDisplay: string;
    patientAge: number;
    patientSex?: string;
    patientBloodGroup?: string;
    patientWeight?: string;
    patientHeight?: string;
    diagnosisCategory: string;
};

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function formatDoctorDisplayName(name: string | null | undefined): string {
    const t = (name || "").trim();
    if (!t) return "Consulting physician";
    if (/^dr\.?\s/i.test(t)) return t;
    return `Dr. ${t}`;
}

export function buildQualificationLine(
    specialization: string | null | undefined,
    degreesSummary: string | null | undefined
): string {
    const spec = (specialization || "").trim();
    const deg = (degreesSummary || "").trim();
    if (spec && deg) return `${spec} · ${deg}`;
    if (spec) return spec;
    if (deg) return deg;
    return "Healthcare professional";
}

/**
 * Parse full PDF HTML and return a live `.rx-wrap` node (imported into `document`) for jsPDF.
 */
export function importPrescriptionPdfShellFromHtml(fullHtml: string): HTMLElement {
    const pdoc = new DOMParser().parseFromString(fullHtml, "text/html");
    const node = pdoc.body.querySelector(".rx-wrap");
    if (!node || !(node instanceof HTMLElement)) {
        throw new Error("Prescription PDF HTML is missing .rx-wrap root.");
    }
    return document.importNode(node, true) as HTMLElement;
}

/**
 * Remove Tailwind / Lexical `class` and inline `style` inside the prescription area only.
 * The `.rx-body` class must stay on the root so `PRESCRIPTION_PDF_STYLE_CSS` selectors (`.rx-body p`, etc.) still apply.
 */
export function stripPrescriptionBodyForPdfEngine(shell: HTMLElement): void {
    const body = shell.querySelector(".rx-body");
    if (!body || !(body instanceof HTMLElement)) return;
    body.removeAttribute("style");
    const stripDescendant = (el: Element) => {
        if (!(el instanceof HTMLElement)) return;
        el.removeAttribute("class");
        el.removeAttribute("style");
    };
    body.querySelectorAll("*").forEach(stripDescendant);
}

export function attachPrescriptionPdfStylesToHead(): HTMLStyleElement {
    const existing = document.getElementById(HEALTHHERE_PDF_HEAD_STYLE_ID);
    if (existing instanceof HTMLStyleElement) {
        existing.remove();
    }
    const style = document.createElement("style");
    style.id = HEALTHHERE_PDF_HEAD_STYLE_ID;
    style.textContent = PRESCRIPTION_PDF_STYLE_CSS;
    document.head.appendChild(style);
    return style;
}

export function detachPrescriptionPdfStyles(styleEl: HTMLStyleElement | null): void {
    styleEl?.remove();
    document.getElementById(HEALTHHERE_PDF_HEAD_STYLE_ID)?.remove();
}

/**
 * jsPDF `doc.html()` mounts a fixed full-viewport `.html2pdf__overlay` on `document.body`.
 * On html2canvas failure, the plugin never removes it, which blocks all pointer events.
 */
export function removeJspdfHtmlOverlaysFromBody(): void {
    document.querySelectorAll(".html2pdf__overlay").forEach((el) => {
        el.remove();
    });
}

/**
 * jsPDF clones this node (including inline `style`) into `.html2pdf__overlay` at `left:-100000px`.
 * If the source is far off-screen (`left:-9999px`, `top:100vh`, etc.), some engines skip paint and
 * html2canvas returns a blank bitmap. Pin the live node to the viewport origin briefly so pixels exist.
 * (`pointer-events:none` avoids blocking clicks.) Keep z-index **below** {@link attachPrescriptionPdfLoadingMask}.
 */
export function preparePrescriptionPdfShellForRaster(shell: HTMLElement): void {
    shell.style.cssText = [
        "position:fixed",
        "left:0",
        "top:0",
        "width:794px",
        "max-width:min(794px,100vw)",
        "box-sizing:border-box",
        "z-index:9000",
        "background:#ffffff",
        "pointer-events:none",
        "opacity:1",
        "visibility:visible",
        "overflow:visible",
    ].join(";");
    shell.style.setProperty("color", "#0f172a", "important");
}

export function attachPrescriptionPdfLoadingMask(): HTMLDivElement {
    document.getElementById(HEALTHHERE_PDF_MASK_ID)?.remove();
    const mask = document.createElement("div");
    mask.id = HEALTHHERE_PDF_MASK_ID;
    mask.setAttribute("role", "status");
    mask.setAttribute("aria-live", "polite");
    mask.style.cssText = [
        "position:fixed",
        "inset:0",
        "z-index:9100",
        "display:flex",
        "align-items:center",
        "justify-content:center",
        "background:rgba(248,250,252,0.96)",
        "backdrop-filter:blur(10px)",
        "-webkit-backdrop-filter:blur(10px)",
    ].join(";");
    const p = document.createElement("p");
    p.textContent = "Preparing PDF…";
    p.style.cssText =
        "margin:0;font:600 15px ui-sans-serif,system-ui,\"Segoe UI\",sans-serif;color:#0f172a;letter-spacing:0.02em;";
    mask.appendChild(p);
    document.body.appendChild(mask);
    return mask;
}

export function detachPrescriptionPdfLoadingMask(mask: HTMLDivElement | null): void {
    mask?.remove();
    document.getElementById(HEALTHHERE_PDF_MASK_ID)?.remove();
}

/**
 * Open the generated PDF blob in a **new browser tab** (no `about:blank` step).
 *
 * Do **not** pass `noopener` in `window.open`'s windowFeatures: many browsers open the tab but still
 * return `null`, which made our previous `<a target="_blank">` fallback run too — **two tabs** for one click.
 * Blob URLs are same-origin; omitting noopener here is acceptable.
 */
export function openPrescriptionPdfBlobInNewTab(pdfBlobUrl: string): boolean {
    const w = window.open(pdfBlobUrl, "_blank");
    if (w != null) {
        try {
            w.opener = null;
        } catch {
            /* ignore */
        }
        return true;
    }
    const a = document.createElement("a");
    a.href = pdfBlobUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return false;
}

/** Double rAF after DOM writes so the shell is committed before html2canvas runs. */
export function flushPrescriptionPdfShellLayout(): Promise<void> {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
        });
    });
}

type Html2CanvasFn = (element: HTMLElement, options?: Record<string, unknown>) => Promise<HTMLCanvasElement>;

/**
 * Rasterize the prepared `.rx-wrap` shell with html2canvas-pro, then build a multi-page A4 PDF (portrait).
 */
export async function rasterizePrescriptionShellToPdfBlobUrl(shell: HTMLElement): Promise<string> {
    const [{ jsPDF }, mod] = await Promise.all([import("jspdf"), import("html2canvas-pro")]);
    const html2canvas = (mod as { default?: Html2CanvasFn }).default ?? (mod as unknown as Html2CanvasFn);
    const scale = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1.5 : 2);
    const canvas = await html2canvas(shell, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
    });

    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 20;
    const printableW = pageW - 2 * margin;
    const printableH = pageH - 2 * margin;

    const imgW = printableW;
    const imgH = (canvas.height * imgW) / canvas.width;

    if (imgH <= printableH + 0.5) {
        doc.addImage(canvas, "PNG", margin, margin, imgW, imgH, undefined, "FAST");
    } else {
        let heightLeft = imgH;
        let y = margin;
        doc.addImage(canvas, "PNG", margin, y, imgW, imgH, undefined, "FAST");
        heightLeft -= printableH;
        while (heightLeft > 0.5) {
            y = margin - (imgH - heightLeft);
            doc.addPage();
            doc.addImage(canvas, "PNG", margin, y, imgW, imgH, undefined, "FAST");
            heightLeft -= printableH;
        }
    }

    const out = doc.output("bloburl");
    return typeof out === "string" ? out : (out as URL).href;
}

export function buildPrescriptionPdfDocumentHtml(input: PrescriptionPdfLayoutInput): string {
    const b = HEALTHHERE_PDF_BRANDING;
    const safe = {
        doctor: escapeHtml(input.doctorDisplayName),
        qual: escapeHtml(input.qualificationLine),
        patient: escapeHtml(input.patientFullName),
        date: escapeHtml(input.issueDateDisplay),
        age: escapeHtml(input.patientAge ? String(input.patientAge) : ""),
        sex: escapeHtml(input.patientSex?.trim() || ""),
        blood: escapeHtml(input.patientBloodGroup?.trim() || ""),
        weight: escapeHtml(input.patientWeight?.trim() || ""),
        height: escapeHtml(input.patientHeight?.trim() || ""),
        diagnosis: escapeHtml(input.diagnosisCategory),
        company: escapeHtml(b.companyName),
        addr: escapeHtml(b.addressLine),
        email: escapeHtml(b.email),
        phone: escapeHtml(b.phone),
    };

    return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>${PRESCRIPTION_PDF_STYLE_CSS}</style></head><body>
<div class="rx-wrap">
  <div class="rx-header">
    <div class="rx-header-left">
      <div class="rx-doctor">${safe.doctor}</div>
      <div class="rx-qual">${safe.qual}</div>
    </div>
    <div class="rx-header-right">
      <div class="rx-badge" aria-hidden="true">🩺</div>
    </div>
  </div>
  <div class="rx-patient">
    <div class="rx-row rx-row-top">
      <span class="rx-label">Patient name:</span>
      <span class="rx-line rx-line-name">${safe.patient}</span>
      <span class="rx-label">Age:</span>
      <span class="rx-line rx-line-age">${safe.age}</span>
      <span class="rx-label">Sex:</span>
      <span class="rx-line rx-line-sex">${safe.sex}</span>
      <span class="rx-label">Date:</span>
      <span class="rx-line rx-line-date">${safe.date}</span>
    </div>
    <div class="rx-row rx-row-diag">
      <span class="rx-label">Diagnosis:</span>
      <span class="rx-line rx-line-diag">${safe.diagnosis}</span>
      <span class="rx-label">Blood group:</span>
      <span class="rx-line rx-line-blood">${safe.blood}</span>
      <span class="rx-label">Weight:</span>
      <span class="rx-line rx-line-weight">${safe.weight}</span>
      <span class="rx-label">Height:</span>
      <span class="rx-line rx-line-height">${safe.height}</span>
    </div>
  </div>
  <div class="rx-main">
    <div class="rx-symbol">℞</div>
    <div class="rx-body">${input.prescriptionHtml}</div>
  </div>
  <div class="rx-sign">
    <div class="rx-sign-line"></div>
    <div class="rx-sign-label">Signature</div>
  </div>
  <div class="rx-footer">
    <div class="rx-footer-brand">${safe.company}</div>
    <div class="rx-footer-mid">${escapeHtml(b.tagline)}<br/><span style="font-weight:600">${safe.addr}</span></div>
    <div class="rx-footer-right">${safe.phone}<br/>${safe.email}</div>
  </div>
</div>
</body></html>`;
}
