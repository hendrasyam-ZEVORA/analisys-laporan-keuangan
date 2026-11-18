/* Infografis bersama: label nilai di ujung batang dan unduh kartu sebagai PNG.
   Pakai: set window.IG_SOURCE = "Sumber: ..." di halaman, beri opsi plugins.valLabels = [teks per batang]. */
(function () {
  const labelPlugin = {
    id: "valLabels",
    afterDatasetsDraw(chart) {
      const lbl = chart.options.plugins && chart.options.plugins.valLabels;
      if (!Array.isArray(lbl)) return;
      const { ctx } = chart;
      chart.getDatasetMeta(0).data.forEach((bar, i) => {
        const txt = lbl[i];
        if (!txt) return;
        ctx.save();
        ctx.font = "600 11px system-ui, sans-serif";
        ctx.fillStyle = "#1d2430";
        ctx.textBaseline = "middle";
        const right = Math.max(bar.x, bar.base) + 6;
        if (right + ctx.measureText(txt).width > chart.chartArea.right + 4) {
          ctx.textAlign = "right"; ctx.fillText(txt, Math.min(bar.x, bar.base) - 6, bar.y);
        } else {
          ctx.textAlign = "left"; ctx.fillText(txt, right, bar.y);
        }
        ctx.restore();
      });
    }
  };
  if (typeof Chart !== "undefined") Chart.register(labelPlugin);

  window.exportCard = function (cardId, canvasId) {
    const card = document.getElementById(cardId);
    const src = document.getElementById(canvasId);
    if (!card || !src) return;
    const title = card.querySelector(".info-title").textContent.trim();
    const sub = card.querySelector(".info-sub").textContent.trim();
    const meanEl = card.querySelector(".info-mean");
    const mean = meanEl ? meanEl.textContent.trim() : "";
    const W = 1080, pad = 60, cw = W - pad * 2;
    const out = document.createElement("canvas");
    const c = out.getContext("2d");
    const wrap = (txt, font, maxW) => {
      c.font = font; const lines = []; let line = "";
      for (const w of txt.split(/\s+/)) {
        const t = line ? line + " " + w : w;
        if (c.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
      }
      if (line) lines.push(line); return lines;
    };
    const fT = "800 52px system-ui, sans-serif", fS = "400 26px system-ui, sans-serif", fM = "400 28px system-ui, sans-serif";
    const tL = wrap(title, fT, cw), sL = wrap(sub, fS, cw), mL = mean ? wrap(mean, fM, cw - 40) : [];
    const chH = Math.round(cw * src.height / src.width);
    const meanH = mL.length ? mL.length * 38 + 30 : 0;
    const H = pad + 40 + tL.length * 62 + 10 + sL.length * 34 + 10 + chH + 30 + meanH + 90;
    out.width = W; out.height = H;
    const acc = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#1f3a8a";
    c.fillStyle = "#fff"; c.fillRect(0, 0, W, H);
    c.fillStyle = acc; c.fillRect(0, 0, W, 14);
    let y = pad + 40;
    c.fillStyle = "#1d2430"; c.font = fT; tL.forEach(l => { c.fillText(l, pad, y); y += 62; });
    c.fillStyle = acc; c.fillRect(pad, y - 34, 220, 6); y += 10;
    c.fillStyle = "#6b7385"; c.font = fS; sL.forEach(l => { c.fillText(l, pad, y); y += 34; });
    y += 10;
    c.drawImage(src, pad, y, cw, chH); y += chH + 30;
    if (mL.length) {
      c.fillStyle = "#f1f3f7"; c.fillRect(pad, y, cw, meanH);
      c.fillStyle = "#1d2430"; c.font = fM; y += 40; mL.forEach(l => { c.fillText(l, pad + 20, y); y += 38; });
    }
    c.fillStyle = "#6b7385"; c.font = "400 22px system-ui, sans-serif";
    c.fillText((window.IG_SOURCE || "") + " · analisys.hendrasyam.online", pad, H - 34);
    const a = document.createElement("a");
    a.download = cardId + "-" + (window.IG_NAME || "infografis") + ".png";
    a.href = out.toDataURL("image/png");
    a.click();
  };
})();
