   /*Interaksi: sidebar mobile, toggle password, konfirmasi aksi,
   dan chart canvas native (tanpa library eksternal).*/
(function () {
    'use strict';

    /*Sidebar mobile*/
    var toggle = document.getElementById('sidebarToggle');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    if (toggle && sidebar) {
        toggle.addEventListener('click', function () {
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('show');
        });
        if (overlay) {
            overlay.addEventListener('click', function () {
                sidebar.classList.remove('open');
                overlay.classList.remove('show');
            });
        }
    }

    /*Tampil/sembunyikan password*/
    document.querySelectorAll('.toggle-pw').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var input = document.getElementById(btn.dataset.target);
            if (!input) return;
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    });

    /*Konfirmasi (hapus / logout)*/
    document.querySelectorAll('[data-confirm]').forEach(function (el) {
        el.addEventListener('click', function (e) {
            if (!window.confirm(el.dataset.confirm)) {
                e.preventDefault();
            }
        });
    });
    document.querySelectorAll('form[data-confirm]').forEach(function (form) {
        form.addEventListener('submit', function (e) {
            if (!window.confirm(form.dataset.confirm)) {
                e.preventDefault();
            }
        });
    });

    /*Auto-hide alert sukses*/
    window.setTimeout(function () {
        document.querySelectorAll('.alert-success').forEach(function (a) {
            a.style.transition = 'opacity .5s';
            a.style.opacity = '0';
            window.setTimeout(function () { a.remove(); }, 500);
        });
    }, 4000);

/*
       Canvas charts (native)
       Elemen: <canvas data-chart="bar|donut" data-labels='[...]'
               data-values='[...]' data-colors='["#..",...]'>
 */
    var PALETTE = ['#4f46e5', '#16a34a', '#d97706', '#0284c7', '#dc2626', '#7c3aed', '#0d9488', '#db2777'];

    function setupCanvas(canvas, height) {
        var dpr = window.devicePixelRatio || 1;
        var w = canvas.parentElement.clientWidth || 600;
        canvas.width = w * dpr;
        canvas.height = height * dpr;
        canvas.style.height = height + 'px';
        var ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        return { ctx: ctx, w: w, h: height };
    }

    function drawBar(canvas) {
        var labels = JSON.parse(canvas.dataset.labels || '[]');
        var values = JSON.parse(canvas.dataset.values || '[]');
        var colors = JSON.parse(canvas.dataset.colors || '[]');
        var s = setupCanvas(canvas, 240);
        var ctx = s.ctx, W = s.w, H = s.h;
        var padL = 40, padB = 40, padT = 16, padR = 12;
        var maxV = Math.max.apply(null, values.concat([1]));
        maxV = Math.ceil(maxV * 1.15);
        var cw = W - padL - padR, ch = H - padT - padB;
        var n = labels.length;
        var slot = cw / n, barW = Math.min(56, slot * 0.55);

        // gridlines + label Y
        ctx.strokeStyle = '#e2e8f0';
        ctx.fillStyle = '#64748b';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        var steps = 5;
        for (var i = 0; i <= steps; i++) {
            var y = padT + ch - (ch * i / steps);
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(W - padR, y);
            ctx.stroke();
            ctx.fillText(Math.round(maxV * i / steps), padL - 8, y + 4);
        }

        // batang
        ctx.textAlign = 'center';
        for (var j = 0; j < n; j++) {
            var bh = ch * (values[j] / maxV);
            var x = padL + slot * j + (slot - barW) / 2;
            var yb = padT + ch - bh;
            ctx.fillStyle = colors[j] || PALETTE[j % PALETTE.length];
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(x, yb, barW, bh, [5, 5, 0, 0]);
            else ctx.rect(x, yb, barW, bh);
            ctx.fill();

            // nilai di atas batang
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(values[j], x + barW / 2, yb - 6);

            // label X (dipotong bila panjang)
            ctx.fillStyle = '#64748b';
            ctx.font = '11px sans-serif';
            var lbl = String(labels[j]);
            if (lbl.length > 12) lbl = lbl.substr(0, 11) + '…';
            ctx.fillText(lbl, padL + slot * j + slot / 2, H - padB + 16);
        }
    }

    function drawDonut(canvas) {
        var labels = JSON.parse(canvas.dataset.labels || '[]');
        var values = JSON.parse(canvas.dataset.values || '[]');
        var colors = JSON.parse(canvas.dataset.colors || '[]');
        var s = setupCanvas(canvas, 220);
        var ctx = s.ctx;
        var total = values.reduce(function (a, b) { return a + b; }, 0) || 1;
        var cx = s.w / 2, cy = s.h / 2, r = Math.min(cx, cy) - 14, inner = r * 0.62;
        var start = -Math.PI / 2;
        for (var i = 0; i < values.length; i++) {
            var ang = (values[i] / total) * Math.PI * 2;
            ctx.beginPath();
            ctx.fillStyle = colors[i] || PALETTE[i % PALETTE.length];
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, start, start + ang);
            ctx.closePath();
            ctx.fill();
            start += ang;
        }
        // lubang tengah
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(cx, cy, inner, 0, Math.PI * 2);
        ctx.fill();
        // teks tengah
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(total, cx, cy + 2);
        ctx.fillStyle = '#64748b';
        ctx.font = '11px sans-serif';
        ctx.fillText('Total', cx, cy + 20);

        // legend di bawah canvas
        var legend = canvas.parentElement.querySelector('.chart-legend');
        if (legend) {
            legend.innerHTML = labels.map(function (l, i) {
                var pct = Math.round(values[i] / total * 100);
                return '<span><i class="legend-dot" style="background:' +
                    (colors[i] || PALETTE[i % PALETTE.length]) + '"></i>' +
                    l + ' (' + values[i] + ' · ' + pct + '%)</span>';
            }).join('');
        }
    }

    function renderCharts() {
        document.querySelectorAll('canvas[data-chart]').forEach(function (c) {
            try {
                if (c.dataset.chart === 'bar') drawBar(c);
                else if (c.dataset.chart === 'donut') drawDonut(c);
            } catch (err) { /* abaikan chart rusak */ }
        });
    }

    renderCharts();
    var rT;
    window.addEventListener('resize', function () {
        clearTimeout(rT);
        rT = setTimeout(renderCharts, 200);
    });

    /* ---------- Baris nilai dinamis (form ujian) ---------- */
    var addRowBtn = document.getElementById('addNilaiRow');
    if (addRowBtn) {
        addRowBtn.addEventListener('click', function () {
            var tbody = document.getElementById('nilaiRows');
            var tpl = document.getElementById('nilaiRowTpl');
            if (!tbody || !tpl) return;
            var tr = tpl.content.cloneNode(true);
            tbody.appendChild(tr);
            bindNilaiEvents(tbody);
        });
    }

    function bindNilaiEvents(scope) {
        scope.querySelectorAll('.remove-nilai').forEach(function (btn) {
            btn.onclick = function () {
                var tbody = document.getElementById('nilaiRows');
                if (tbody.querySelectorAll('tr').length > 1) {
                    btn.closest('tr').remove();
                }
            };
        });
    }
    bindNilaiEvents(document);

    /*Form ujian: jurusan otomatis + datalist pelajaran*/
    var nisSel = document.getElementById('nis');
    if (nisSel && window.UJIAN) {
        var jurIn = document.getElementById('jurusanDisplay');
        var dlist = document.getElementById('pelajaranList');
        var escOpt = function (s) {
            return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        };
        var refreshUjian = function () {
            var opt = nisSel.options[nisSel.selectedIndex];
            var jur = opt ? (opt.dataset.jurusan || '') : '';
            if (jurIn) jurIn.value = jur;
            if (dlist) {
                var items = window.UJIAN.pelajaranPerJurusan[jur] || window.UJIAN.semuaPelajaran;
                dlist.innerHTML = items.map(function (p) {
                    return '<option value="' + escOpt(p) + '">';
                }).join('');
            }
        };
        nisSel.addEventListener('change', refreshUjian);
        refreshUjian();
    }
})();
