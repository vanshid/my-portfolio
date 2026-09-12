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
// fragments: physics playground + click-to-reveal console
// ============================================================
(function () {
  var stage = document.getElementById('stage');
  var consoleText = document.getElementById('console-text');
  if (!stage) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var fragments = [
    { label: 'concierge test', detail: 'Ran a concierge test on eligibility rules before engineering scoped a rules engine — the manual path resolved faster than the build would have taken. The build never got scoped.' },
    { label: 'confidence floor', detail: 'LLM search across membership content returns ranked source links instead of a generated answer below a set confidence threshold. A wrong answer about eligibility costs more than no answer.' },
    { label: 'migration, risk-first', detail: 'Resequenced a legacy system migration around what breaks a member\u2019s day first — registration and renewals moved before reporting and admin tooling.' },
    { label: 'checkout completions', detail: 'Owned the hypothesis and instrumentation behind guest checkout, autofill and address-validation A/B tests. Measured on completed checkouts, not click-through.' },
    { label: 'technical pm', detail: 'Three years as a software engineer before product — she owns the parts most PMs hand off: API contracts, data models, retrieval quality, cutover sequencing.' },
    { label: 'ai / llm products', detail: 'Ships AI features end to end: retrieval design, eval sets, hallucination guardrails and confidence fallbacks, with cost and latency trade-offs weighed in from day one.' },
    { label: 'cross-functional', detail: 'Works at the contract level with engineering on integrations — request and response shape, auth flows, error semantics, idempotency on retries — before they become bug tickets.' },
    { label: 'rag + retrieval', detail: 'Chunking strategy, metadata filtering, eval sets and regression suites, hallucination guardrails, confidence fallbacks, cost and latency trade-offs.' },
    { label: 'rice / moscow', detail: 'Prioritization frameworks used alongside JTBD switch interviews \u2014 RICE and MoSCoW for what to build, switch interviews for why someone actually moved.' },
    { label: 'sub-1% failures', detail: 'Integrated Apple Pay, Razorpay and Stripe at sub-1% transaction failure targets, backed by alerting tuned ahead of global sale events.' },
    { label: 'iit patna, mba', detail: 'MBA in International Business and Finance, IIT Patna, 2022\u20132027, focused on generative AI and business strategy.' },
    { label: 'ga4 + amplitude', detail: 'Product analytics stack: GA4, Amplitude, Metabase, Power BI, SQL, funnel and cohort analysis, HEART.' },
    { label: 'python / flask', detail: 'Hands-on: Python, Flask, Django, JavaScript, MongoDB, GCP, TensorFlow, REST API design \u2014 three years of production code before product.' },
    { label: 'iot gps tracker', detail: 'Built an IoT GPS tracking system on Raspberry Pi during her M.Sc., adopted by three schools at 95% location accuracy.' }
  ];
  var classes = ['chip-1', 'chip-2', 'chip-3', 'chip-4', 'chip-5', 'chip-6'];

  var style = document.createElement('style');
  style.textContent = classes.map(function (c, i) {
    var n = i + 1;
    return '.' + c + '{ background: var(--chip-' + n + '-bg); color: var(--chip-' + n + '-fg); }';
  }).join('\n');
  document.head.appendChild(style);

  var chips = [];
  var W = stage.clientWidth;
  var H = stage.clientHeight;
  var GAP = 16; // minimum breathing room between fragments on placement

  // Find a spot that doesn't overlap any fragment already placed. Falls
  // back to a fully random spot if the stage is too crowded to fit cleanly.
  function findOpenSpot(w, h) {
    var maxX = Math.max(W - w, 8);
    var maxY = Math.max(H - h, 8);
    for (var attempt = 0; attempt < 80; attempt++) {
      var x = Math.random() * maxX;
      var y = Math.random() * maxY;
      var clear = true;
      for (var i = 0; i < chips.length; i++) {
        var c = chips[i];
        var cw = c.el.offsetWidth, ch = c.el.offsetHeight;
        if (x < c.x + cw + GAP && x + w + GAP > c.x &&
            y < c.y + ch + GAP && y + h + GAP > c.y) {
          clear = false;
          break;
        }
      }
      if (clear) return { x: x, y: y };
    }
    return { x: Math.random() * maxX, y: Math.random() * maxY };
  }

  fragments.forEach(function (frag, i) {
    var el = document.createElement('div');
    el.className = 'frag ' + classes[i % classes.length];
    el.textContent = frag.label;
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Expand: ' + frag.label);
    stage.appendChild(el);

    var w = el.offsetWidth, h = el.offsetHeight;
    var spot = findOpenSpot(w, h);
    var angle = Math.random() * Math.PI * 2;
    var speed = 0.1 + Math.random() * 0.12;
    chips.push({
      el: el, x: spot.x, y: spot.y, w: w, h: h, detail: frag.detail,
      // constant slow drift, like debris floating in space — this never decays to zero
      baseVx: Math.cos(angle) * speed,
      baseVy: Math.sin(angle) * speed,
      speed: speed,
      // temporary nudge from cursor proximity/drag throw, decays back to nothing
      jitterVx: 0, jitterVy: 0,
      headingTimer: 90 + Math.floor(Math.random() * 150)
    });
  });

  function activate(chip) {
    chips.forEach(function (c) { c.el.classList.remove('is-active'); });
    chip.el.classList.add('is-active');
    if (consoleText) consoleText.textContent = chip.detail;
  }

  chips.forEach(function (c) {
    c.el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(c); }
    });
  });

  if (reduceMotion) {
    chips.forEach(function (c) {
      c.el.style.transform = 'translate(' + c.x + 'px,' + c.y + 'px)';
      c.el.addEventListener('click', function () { activate(c); });
    });
    return;
  }

  var mouse = { x: -9999, y: -9999 };
  var dragTarget = null;
  var downPos = null;
  var moved = false;

  function localPos(e) {
    var r = stage.getBoundingClientRect();
    var cx = (e.touches ? e.touches[0].clientX : e.clientX);
    var cy = (e.touches ? e.touches[0].clientY : e.clientY);
    return { x: cx - r.left, y: cy - r.top };
  }

  stage.addEventListener('mousemove', function (e) {
    var p = localPos(e);
    mouse.x = p.x; mouse.y = p.y;
    if (dragTarget) {
      dragTarget.x = p.x; dragTarget.y = p.y;
      if (downPos && (Math.abs(p.x - downPos.x) > 4 || Math.abs(p.y - downPos.y) > 4)) moved = true;
    }
  });
  stage.addEventListener('mouseleave', function () { mouse.x = -9999; mouse.y = -9999; });

  chips.forEach(function (c) {
    c.el.addEventListener('mousedown', function (e) {
      dragTarget = c; moved = false; downPos = localPos(e); c.jitterVx = 0; c.jitterVy = 0; e.preventDefault();
    });
    c.el.addEventListener('mouseup', function () {
      if (!moved) activate(c);
    });
    c.el.addEventListener('touchstart', function (e) {
      dragTarget = c; moved = false; downPos = localPos(e); c.jitterVx = 0; c.jitterVy = 0;
    }, { passive: true });
    c.el.addEventListener('touchend', function () {
      if (!moved) activate(c);
    });
  });
  window.addEventListener('mouseup', function () { dragTarget = null; });
  window.addEventListener('touchend', function () { dragTarget = null; });
  window.addEventListener('touchmove', function (e) {
    if (dragTarget) {
      var p = localPos(e);
      dragTarget.x = p.x; dragTarget.y = p.y;
      if (downPos && (Math.abs(p.x - downPos.x) > 4 || Math.abs(p.y - downPos.y) > 4)) moved = true;
    }
  }, { passive: true });

  window.addEventListener('resize', function () {
    W = stage.clientWidth; H = stage.clientHeight;
    chips.forEach(function (c) { c.w = c.el.offsetWidth; c.h = c.el.offsetHeight; });
  });

  function tick() {
    chips.forEach(function (c) {
      if (c === dragTarget) {
        c.el.style.transform = 'translate(' + c.x + 'px,' + c.y + 'px)';
        return;
      }

      // gentle cursor-avoidance nudge — only ever fires with a real mouse;
      // on touch, mouse.x/y sit off-stage so this is a no-op and drift alone carries it
      var dx = c.x - mouse.x, dy = c.y - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 110 && dist > 0.1) {
        var force = ((110 - dist) / 110) * 0.9;
        c.jitterVx += (dx / dist) * force;
        c.jitterVy += (dy / dist) * force;
      }
      c.jitterVx *= 0.94;
      c.jitterVy *= 0.94;

      // every couple of seconds, nudge the heading by a modest turn (not a full
      // random reversal) so the path curves naturally instead of snapping around
      c.headingTimer--;
      if (c.headingTimer <= 0) {
        var curAngle = Math.atan2(c.baseVy, c.baseVx);
        var turn = (Math.random() - 0.5) * 2.2; // up to ~±63°
        var newAngle = curAngle + turn;
        c.targetVx = Math.cos(newAngle) * c.speed;
        c.targetVy = Math.sin(newAngle) * c.speed;
        c.headingTimer = 90 + Math.floor(Math.random() * 150);
      }
      if (c.targetVx !== undefined) {
        c.baseVx += (c.targetVx - c.baseVx) * 0.02;
        c.baseVy += (c.targetVy - c.baseVy) * 0.02;
      }

      c.x += c.baseVx + c.jitterVx;
      c.y += c.baseVy + c.jitterVy;

      // bounce off the stage edges — never teleport or vanish, just turn and keep drifting
      if (c.x < 0) {
        c.x = 0; c.baseVx = Math.abs(c.baseVx); c.jitterVx = Math.abs(c.jitterVx); c.targetVx = c.baseVx;
      } else if (c.x > W - c.w) {
        c.x = W - c.w; c.baseVx = -Math.abs(c.baseVx); c.jitterVx = -Math.abs(c.jitterVx); c.targetVx = c.baseVx;
      }
      if (c.y < 0) {
        c.y = 0; c.baseVy = Math.abs(c.baseVy); c.jitterVy = Math.abs(c.jitterVy); c.targetVy = c.baseVy;
      } else if (c.y > H - c.h) {
        c.y = H - c.h; c.baseVy = -Math.abs(c.baseVy); c.jitterVy = -Math.abs(c.jitterVy); c.targetVy = c.baseVy;
      }

      c.el.style.transform = 'translate(' + c.x + 'px,' + c.y + 'px)';
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
