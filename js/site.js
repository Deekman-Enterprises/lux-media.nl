/* LUX Media — kleine scripts voor de website */
(function () {
  'use strict';
  var stil = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Achtergrondvideo's: altijd zonder geluid; stil bij "minder beweging" */
  document.querySelectorAll('video').forEach(function (v) {
    v.muted = true;
    v.setAttribute('muted', '');
    if (stil) { v.removeAttribute('autoplay'); v.pause(); return; }
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  });

  /* 2. Projecten filteren */
  var knoppen = document.querySelectorAll('[data-filter]');
  if (knoppen.length) {
    var kaarten = document.querySelectorAll('[data-tags]');
    var aanStijl = 'color: #0D0A12; border: 0';
    var uitStijl = 'background: #17121F; color: #F7F3FA; border: 1.5px solid #3A3145';
    knoppen.forEach(function (knop) {
      knop.addEventListener('click', function () {
        var f = knop.getAttribute('data-filter');
        knoppen.forEach(function (k) {
          var aan = k === knop;
          k.setAttribute('aria-pressed', aan ? 'true' : 'false');
          k.classList.toggle('grad-bg', aan);
          k.setAttribute('style', aan ? aanStijl : uitStijl);
        });
        var n = 0;
        kaarten.forEach(function (kaart) {
          var tags = kaart.getAttribute('data-tags').split('|');
          var zien = f === 'Alles' || tags.indexOf(f) > -1;
          kaart.hidden = !zien;
          if (zien) {
            kaart.style.animation = 'none';
            void kaart.offsetWidth;
            kaart.style.animation = '';
            kaart.style.animationDelay = (n++ * 0.08) + 's';
          }
        });
      });
    });
  }

  /* 3. Contactformulier */
  var form = document.getElementById('contactformulier');
  if (form) {
    var melding = document.getElementById('c-melding');
    var knop = document.getElementById('c-knop');
    var bedankt = document.getElementById('c-bedankt');
    var cfg = window.LUX_CONFIG || {};
    var toon = function (tekst) { melding.textContent = tekst; melding.hidden = !tekst; };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      toon('');
      if (!form.checkValidity()) {
        var eerste = form.querySelector(':invalid');
        toon(eerste && eerste.type === 'checkbox'
          ? 'Vink het akkoord met de privacyverklaring aan om te versturen.'
          : 'Vul je naam, een geldig e-mailadres en je bericht in.');
        if (eerste) eerste.focus();
        return;
      }
      var g = function (n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; };
      var gegevens = {
        type: 'contact', naam: g('naam'), bedrijf: g('bedrijf'), email: g('email'),
        soort: g('soort'), datum: g('datum'), bericht: g('bericht'), website: g('website')
      };
      if (!cfg.FORM_URL) {
        var onderwerp = encodeURIComponent('Nieuwe aanvraag via de website: ' + gegevens.soort);
        var tekst = encodeURIComponent(
          'Naam: ' + gegevens.naam + '\nBedrijf: ' + gegevens.bedrijf + '\nE-mail: ' + gegevens.email +
          '\nSoort: ' + gegevens.soort + '\nGewenste datum: ' + gegevens.datum + '\n\n' + gegevens.bericht);
        window.location.href = 'mailto:thomasdeekman@lux-media.nl?subject=' + onderwerp + '&body=' + tekst;
        return;
      }
      knop.disabled = true;
      var oud = knop.textContent;
      knop.textContent = 'Versturen…';
      fetch(cfg.FORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gegevens)
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok || !j.ok) throw new Error(j.fout || 'Versturen lukte niet.');
        });
      }).then(function () {
        form.hidden = true;
        bedankt.hidden = false;
        bedankt.focus();
      }).catch(function (err) {
        toon((err && err.message ? err.message + ' ' : '') + 'Probeer het opnieuw of mail ons op thomasdeekman@lux-media.nl.');
        knop.disabled = false;
        knop.textContent = oud;
      });
    });
  }
})();
