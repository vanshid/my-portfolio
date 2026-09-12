// ============================================================
// cycling headline verb
// ============================================================
(function () {
  var el = document.getElementById('cycle');
  if (!el) return;
  var verbs = ['ship', 'lead', 'tune'];
  var i = 0;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fixWidth() {
    var probe = document.createElement('span');
    probe.style.cssText = 'visibility:hidden; position:absolute; white-space:nowrap; font:' + window.getComputedStyle(el).font;
    document.body.appendChild(probe);
    var max = 0;
    verbs.forEach(function (v) { probe.textContent = v; max = Math.max(max, probe.offsetWidth); });
    document.body.removeChild(probe);
    el.style.width = max + 'px';
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fixWidth);
  } else {
    fixWidth();
  }
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fixWidth, 150);
  });

  if (reduceMotion) return;

  setInterval(function () {
    i = (i + 1) % verbs.length;
    el.style.opacity = 0;
    setTimeout(function () {
      el.textContent = verbs[i];
      el.style.opacity = 1;
    }, 250);
  }, 2400);
})();

// ============================================================
// background: vector field (embedding-space nodes + edges)
// ============================================================
(function () {
  var canvas = document.getElementById('bg-field');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var LINK_DIST = 130;

  var W, H, nodes = [];

  function readColors() {
    var s = getComputedStyle(document.documentElement);
    return {
      dot: s.getPropertyValue('--field-dot').trim() || 'rgba(255,255,255,0.6)',
      line: s.getPropertyValue('--field-line').trim() || 'rgba(255,255,255,0.14)'
    };
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    var count = Math.round((W * H) / 24000);
    count = Math.max(26, Math.min(64, count));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14
      });
    }
  }

  function draw() {
    var colors = readColors();
    ctx.clearRect(0, 0, W, H);

    ctx.lineWidth = 1;
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK_DIST) {
          ctx.strokeStyle = colors.line;
          ctx.globalAlpha = (1 - d / LINK_DIST);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.dot;
    ctx.shadowColor = colors.dot;
    ctx.shadowBlur = 4;
    for (var k = 0; k < nodes.length; k++) {
      ctx.beginPath();
      ctx.arc(nodes[k].x, nodes[k].y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function step() {
    nodes.forEach(function (n) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0) n.x = W; else if (n.x > W) n.x = 0;
      if (n.y < 0) n.y = H; else if (n.y > H) n.y = 0;
    });
    draw();
    requestAnimationFrame(step);
  }

  resize();
  draw();

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { resize(); draw(); }, 150);
  });

  if (!reduceMotion) requestAnimationFrame(step);
})();

// ============================================================
// session replay: her career as a scrubbable recording
// ============================================================
(function () {
  var stage = document.getElementById('replay-stage');
  if (!stage) return;

  var cursorEl = document.getElementById('replay-cursor');
  var cardEl = document.getElementById('replay-card');
  var cardTagEl = document.getElementById('replay-card-tag');
  var cardTextEl = document.getElementById('replay-card-text');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // real content, reused as-is — spaced across the timeline in order
  var milestones = [
    { tag: 'role', label: 'technical pm', detail: 'Spent three years as a software engineer before moving into product — I still own the parts most PMs hand off: API contracts, data models, retrieval quality, cutover sequencing.' },
    { tag: 'project', label: 'iot gps tracker', detail: 'Built an IoT GPS tracking system on Raspberry Pi during my M.Sc., adopted by three schools at 95% location accuracy.' },
    { tag: 'tools', label: 'python / flask', detail: 'Hands-on with Python, Flask, Django, JavaScript, MongoDB, GCP, TensorFlow, REST API design — three years writing production code before product.' },
    { tag: 'education', label: 'iit patna, mba', detail: 'Pursued an MBA in International Business and Finance at IIT Patna, 2022–2027, focused on generative AI and business strategy.' },
    { tag: 'practice', label: 'concierge test', detail: 'Ran a concierge test on eligibility rules before engineering scoped a rules engine — the manual path resolved faster than the build would have taken. I never let the build get scoped.' },
    { tag: 'framework', label: 'rice / moscow', detail: 'Use RICE and MoSCoW for what to build, alongside JTBD switch interviews for why someone actually moved.' },
    { tag: 'shipped', label: 'checkout completions', detail: 'Owned the hypothesis and instrumentation behind guest checkout, autofill and address-validation A/B tests. Measured on completed checkouts, not click-through.' },
    { tag: 'shipped', label: 'sub-1% failures', detail: 'Integrated Apple Pay, Razorpay and Stripe at sub-1% transaction failure targets, backed by alerting I tuned ahead of global sale events.' },
    { tag: 'tools', label: 'ga4 + amplitude', detail: 'Built my product analytics stack around GA4, Amplitude, Metabase, Power BI and SQL — funnel and cohort analysis, HEART.' },
    { tag: 'practice', label: 'cross-functional', detail: 'Worked at the contract level with engineering on integrations — request and response shape, auth flows, error semantics, idempotency on retries — before they became bug tickets.' },
    { tag: 'shipped', label: 'migration, risk-first', detail: 'Resequenced a legacy system migration around what breaks a member’s day first — moved registration and renewals ahead of reporting and admin tooling.' },
    { tag: 'skill', label: 'rag + retrieval', detail: 'Designed chunking strategy, metadata filtering, eval sets and regression suites — hallucination guardrails, confidence fallbacks, cost and latency trade-offs.' },
    { tag: 'shipped', label: 'confidence floor', detail: 'Shipped LLM search across membership content that returns ranked source links instead of a generated answer below a set confidence threshold. A wrong answer about eligibility costs more than no answer.' },
    { tag: 'focus', label: 'ai / llm products', detail: 'Ship AI features end to end: retrieval design, eval sets, hallucination guardrails and confidence fallbacks, weighing cost and latency trade-offs from day one.' }
  ];

  // spread evenly with a touch of padding at each end
  milestones.forEach(function (m, i) {
    m.t = (i + 0.5) / milestones.length;
  });

  var nodeEls = milestones.map(function () {
    var el = document.createElement('div');
    el.className = 'replay-node';
    stage.appendChild(el);
    return el;
  });

  var DURATION = 12000; // ms for a full pass, before per-node slow-down
  var progress = 0.01;
  var direction = 1; // ping-pongs between 0 and 1 — never jump-cuts back to the start
  var dragging = false;
  var last = null;

  function pathBounds() {
    var w = stage.clientWidth;
    var pad = 36;
    // cap the usable width so the wave doesn't stretch flat and sparse on very wide screens
    var usableW = Math.min(w - pad * 2, 920);
    var offsetX = pad + Math.max(w - pad * 2 - usableW, 0) / 2;
    return { offsetX: offsetX, usableW: Math.max(usableW, 10) };
  }

  function pathPoint(p) {
    var b = pathBounds();
    var h = stage.clientHeight;
    var x = b.offsetX + p * b.usableW;
    var midY = h / 2;
    var amp = Math.min(h * 0.34, 90);
    // fewer wiggles on narrow screens so 14 dots don't bunch up at each curve peak
    var freq = b.usableW < 420 ? 1.3 : 2.6;
    var y = midY + Math.sin(p * Math.PI * freq) * amp;
    return { x: x, y: y };
  }

  // inverse of pathPoint's x mapping — turns a touch/click x back into progress
  function progressFromX(x) {
    var b = pathBounds();
    var p = Math.max(0, Math.min(1, (x - b.offsetX) / b.usableW));
    // snap to the nearest milestone when the touch lands reasonably close to
    // one — makes tapping near a crowded dot land exactly on it instead of
    // requiring pixel-perfect precision
    var snapRadius = (1 / milestones.length) * 0.6;
    var nearest = null, nearestDist = Infinity;
    milestones.forEach(function (m) {
      var d = Math.abs(m.t - p);
      if (d < nearestDist) { nearestDist = d; nearest = m; }
    });
    if (nearest && nearestDist < snapRadius) return nearest.t;
    return p;
  }

  function render() {
    var pos = pathPoint(progress);
    cursorEl.style.left = (pos.x - 3) + 'px';
    cursorEl.style.top = (pos.y - 14) + 'px';

    var nearest = null, nearestDist = 999;
    milestones.forEach(function (m, i) {
      var d = Math.abs(m.t - progress);
      if (d < nearestDist) { nearestDist = d; nearest = m; }
      var pt = pathPoint(m.t);
      nodeEls[i].style.left = pt.x + 'px';
      nodeEls[i].style.top = pt.y + 'px';
      nodeEls[i].classList.toggle('active', d < 0.018);
    });

    var showCard = nearestDist < 0.03;
    if (showCard && nearest) {
      var cpt = pathPoint(nearest.t);
      cardTagEl.textContent = nearest.tag + ' — ' + nearest.label;
      cardTextEl.textContent = nearest.detail;
      cardEl.classList.add('show');

      // clamp against the card's real measured size so long detail text
      // never overflows the stage, on any screen width
      var stageW = stage.clientWidth, stageH = stage.clientHeight;
      var cw = cardEl.offsetWidth, ch = cardEl.offsetHeight;
      var pad = 10;
      var cx = Math.min(stageW - cw / 2 - pad, Math.max(cw / 2 + pad, cpt.x));

      var below = cpt.y + 26;
      var above = cpt.y - ch - 26;
      var cy;
      if (above >= pad) {
        cy = above;
      } else if (below + ch <= stageH - pad) {
        cy = below;
      } else {
        // neither side clears the stage cleanly (short stage / long text) — pin inside bounds
        cy = Math.min(Math.max(cpt.y - ch / 2, pad), stageH - ch - pad);
      }

      cardEl.style.left = cx + 'px';
      cardEl.style.top = cy + 'px';
    } else {
      cardEl.classList.remove('show');
    }
  }

  function loop(now) {
    requestAnimationFrame(loop);
    if (last === null) last = now;
    var dt = now - last;
    last = now;
    if (!dragging) {
      // ease speed down near each node and back up leaving it — a smooth
      // ramp, not a step, so it never jumps speed abruptly
      var nearestDist = 999;
      milestones.forEach(function (m) { nearestDist = Math.min(nearestDist, Math.abs(m.t - progress)); });
      var falloff = 0.06;
      var t = Math.min(nearestDist / falloff, 1);
      var eased = t * t * (3 - 2 * t); // smoothstep
      var speedMul = 0.12 + eased * 0.88;
      var next = progress + (dt / DURATION) * speedMul * direction;
      // ping-pong at the ends instead of snapping back to the start
      if (next >= 1) { next = 1; direction = -1; }
      else if (next <= 0) { next = 0; direction = 1; }
      progress = next;
    }
    render();
  }

  function seekFromEvent(e) {
    var rect = stage.getBoundingClientRect();
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    progress = progressFromX(clientX - rect.left);
    render();
  }

  // touching a point on the stage pauses playback and highlights the nearest
  // dot right there; releasing resumes autoplay onward from that point — it never rewinds
  stage.addEventListener('mousedown', function (e) {
    dragging = true; seekFromEvent(e);
  });
  stage.addEventListener('touchstart', function (e) {
    dragging = true; seekFromEvent(e);
  }, { passive: true });
  window.addEventListener('mousemove', function (e) { if (dragging) seekFromEvent(e); });
  window.addEventListener('touchmove', function (e) { if (dragging) seekFromEvent(e); }, { passive: true });
  window.addEventListener('mouseup', function () { dragging = false; });
  window.addEventListener('touchend', function () { dragging = false; });

  window.addEventListener('resize', render);

  render();
  if (!reduceMotion) requestAnimationFrame(loop);
})();
