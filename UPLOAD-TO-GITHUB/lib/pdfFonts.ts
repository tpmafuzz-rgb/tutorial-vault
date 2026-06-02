import { Font } from "@react-pdf/renderer";

/**
 * Font registration for the PDF exports.
 *
 * The built-in PDF font (Helvetica) only covers Latin/WinAnsi, so any
 * non-Latin script — Bangla (Bengali), Hindi, etc. — renders as garbage
 * ("Á¯Ë—…"). Noto Sans Bengali covers the full Bengali block *and* basic
 * Latin, so mixed English + Bangla text renders correctly from one family.
 *
 * The TTFs are bundled in /public/fonts and served by Next at /fonts/*.
 */
export const PDF_FONT = "NotoBengali";

let registered = false;

export function registerPdfFonts() {
  if (registered) return;
  registered = true;

  Font.register({
    family: PDF_FONT,
    fonts: [
      { src: "/fonts/NotoSansBengali-Regular.ttf", fontWeight: "normal" },
      { src: "/fonts/NotoSansBengali-Bold.ttf", fontWeight: "bold" },
    ],
  });

  // react-pdf hyphenates Latin words by default, which mangles Bengali
  // (and is unwanted in our short labels). Disable it — never split a word.
  Font.registerHyphenationCallback((word) => [word]);
}
