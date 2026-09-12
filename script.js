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
    // slightly slower drift on narrow/mobile screens — less frantic in a tighter space
    var mobileSpeedMul = W < 560 ? 0.8 : 1;
    var speed = (0.1 + Math.random() * 0.12) * mobileSpeedMul;
    chips.push({
      el: el, x: spot.x, y: spot.y, w: w, h: h, detail: frag.detail,
      // constant slow drift, like debris floating in space — this never decays to zero
      baseVx: Math.cos(angle) * speed,
      baseVy: Math.sin(angle) * speed,
      speed: speed,
      // seeded up front so they're never undefined: an edge bounce sets only
      // the axis it bounced on, and the lerp below reads both. If targetVy
      // were still undefined there, (undefined - baseVy) is NaN — which then
      // spreads to every other fragment through the collision pass and
      // freezes the whole stage.
      targetVx: Math.cos(angle) * speed,
      targetVy: Math.sin(angle) * speed,
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
  var lastDragMove = 0;

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
      lastDragMove = Date.now();
      if (downPos && (Math.abs(p.x - downPos.x) > 4 || Math.abs(p.y - downPos.y) > 4)) moved = true;
    }
  });
  stage.addEventListener('mouseleave', function () { mouse.x = -9999; mouse.y = -9999; });

  // release whatever is being dragged and forget the cursor. Touch devices
  // fire synthetic mouse events after a tap but never fire mouseleave, so
  // without the reset the last tap point stays as a permanent repulsion
  // source shoving nearby fragments around.
  function endDrag() {
    dragTarget = null;
    downPos = null;
    mouse.x = -9999; mouse.y = -9999;
  }

  chips.forEach(function (c) {
    c.el.addEventListener('mousedown', function (e) {
      dragTarget = c; moved = false; downPos = localPos(e); lastDragMove = Date.now();
      c.jitterVx = 0; c.jitterVy = 0; e.preventDefault();
    });
    c.el.addEventListener('mouseup', function () {
      if (!moved) activate(c);
    });
    c.el.addEventListener('touchstart', function (e) {
      dragTarget = c; moved = false; downPos = localPos(e); lastDragMove = Date.now();
      c.jitterVx = 0; c.jitterVy = 0;
    }, { passive: true });
    c.el.addEventListener('touchend', function () {
      if (!moved) activate(c);
    });
  });

  window.addEventListener('mouseup', endDrag);
  window.addEventListener('touchend', endDrag);
  // touchcancel is the one that actually bites: the browser fires it instead
  // of touchend whenever it takes the gesture over (page scroll, edge swipe,
  // an incoming notification), and without this the fragment stays pinned as
  // the drag target and never moves again.
  window.addEventListener('touchcancel', endDrag);
  window.addEventListener('pointercancel', endDrag);
  window.addEventListener('blur', endDrag);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) endDrag();
  });

  window.addEventListener('touchmove', function (e) {
    if (dragTarget) {
      var p = localPos(e);
      dragTarget.x = p.x; dragTarget.y = p.y;
      lastDragMove = Date.now();
      if (downPos && (Math.abs(p.x - downPos.x) > 4 || Math.abs(p.y - downPos.y) > 4)) moved = true;
    }
  }, { passive: true });

  window.addEventListener('resize', function () {
    W = stage.clientWidth; H = stage.clientHeight;
    chips.forEach(function (c) { c.w = c.el.offsetWidth; c.h = c.el.offsetHeight; });
  });

  // treat each fragment as a bounding circle for collision purposes —
  // deliberately smaller than the true half-diagonal so glancing passes don't
  // count as contact
  function radiusOf(c) { return (c.w + c.h) / 4.6; }

  // atom-style elastic bounce between every pair of fragments, run once per
  // frame after positions are integrated. Works identically whether the
  // motion driving it came from a mouse (desktop) or touch drag (mobile) —
  // it only ever looks at x/y/velocity, never the input method.
  function resolveCollisions() {
    for (var i = 0; i < chips.length; i++) {
      for (var j = i + 1; j < chips.length; j++) {
        var a = chips[i], b = chips[j];
        var acx = a.x + a.w / 2, acy = a.y + a.h / 2;
        var bcx = b.x + b.w / 2, bcy = b.y + b.h / 2;
        var dx = bcx - acx, dy = bcy - acy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var minDist = radiusOf(a) + radiusOf(b);
        if (dist >= minDist || dist < 0.0001) continue;

        var nx = dx / dist, ny = dy / dist;
        var overlap = minDist - dist;
        var aDrag = (a === dragTarget), bDrag = (b === dragTarget);

        // separate them — the dragged fragment (if any) doesn't get pushed,
        // everything else shares the correction
        if (!aDrag && !bDrag) {
          a.x -= nx * overlap * 0.5; a.y -= ny * overlap * 0.5;
          b.x += nx * overlap * 0.5; b.y += ny * overlap * 0.5;
        } else if (aDrag) {
          b.x += nx * overlap; b.y += ny * overlap;
        } else if (bDrag) {
          a.x -= nx * overlap; a.y -= ny * overlap;
        }

        // equal-mass elastic collision: swap the velocity component along
        // the collision normal, leave the tangential component alone
        var avx = a.baseVx + a.jitterVx, avy = a.baseVy + a.jitterVy;
        var bvx = b.baseVx + b.jitterVx, bvy = b.baseVy + b.jitterVy;
        var rel = (avx - bvx) * nx + (avy - bvy) * ny;
        if (rel <= 0) continue; // already moving apart

        // a floor on post-collision speed — in a crowded/mobile layout many
        // pairs can be "colliding" every single frame, and without this the
        // repeated elastic exchange cancels itself into a near-total freeze
        var MIN_SPEED = 0.1;

        if (!aDrag) {
          avx -= rel * nx; avy -= rel * ny;
          var aMag = Math.sqrt(avx * avx + avy * avy);
          if (aMag < MIN_SPEED) {
            var aAngle = aMag > 0.0001 ? Math.atan2(avy, avx) : Math.random() * Math.PI * 2;
            avx = Math.cos(aAngle) * MIN_SPEED; avy = Math.sin(aAngle) * MIN_SPEED;
            aMag = MIN_SPEED;
          }
          a.baseVx = avx; a.baseVy = avy; a.jitterVx = 0; a.jitterVy = 0;
          a.speed = aMag;
          a.targetVx = a.baseVx; a.targetVy = a.baseVy;
        }
        if (!bDrag) {
          bvx += rel * nx; bvy += rel * ny;
          var bMag = Math.sqrt(bvx * bvx + bvy * bvy);
          if (bMag < MIN_SPEED) {
            var bAngle = bMag > 0.0001 ? Math.atan2(bvy, bvx) : Math.random() * Math.PI * 2;
            bvx = Math.cos(bAngle) * MIN_SPEED; bvy = Math.sin(bAngle) * MIN_SPEED;
            bMag = MIN_SPEED;
          }
          b.baseVx = bvx; b.baseVy = bvy; b.jitterVx = 0; b.jitterVy = 0;
          b.speed = bMag;
          b.targetVx = b.baseVx; b.targetVy = b.baseVy;
        }
      }
    }
  }

  function tick() {
    // watchdog: if something is still flagged as being dragged but hasn't
    // moved in a second, the release event went missing — let it go, so a
    // fragment can never end up frozen for the rest of the session
    if (dragTarget && Date.now() - lastDragMove > 1000) endDrag();

    chips.forEach(function (c) {
      if (c === dragTarget) {
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
      if (c.targetVx !== undefined && c.targetVy !== undefined) {
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
    });

    resolveCollisions();

    chips.forEach(function (c) {
      c.el.style.transform = 'translate(' + c.x + 'px,' + c.y + 'px)';
    });

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

// ============================================================
// blog carousel: one card visible at a time, crossfades as you swipe
// ============================================================
(function () {
  var grids = document.querySelectorAll('.blog-grid');
  if (!grids.length) return;

  grids.forEach(function (grid) {
    var originalCards = Array.prototype.slice.call(grid.querySelectorAll('.blog-card'));
    var loopable = originalCards.length > 1;

    // infinite loop: a hidden clone of the last card before the first, and a
    // hidden clone of the first card after the last. Landing on a clone jumps
    // (no animation, same content either side) straight to the real card it
    // mirrors, so swiping past either end just wraps around.
    if (loopable) {
      var startClone = originalCards[originalCards.length - 1].cloneNode(true);
      var endClone = originalCards[0].cloneNode(true);
      [startClone, endClone].forEach(function (clone) {
        clone.setAttribute('aria-hidden', 'true');
        clone.tabIndex = -1;
      });
      grid.insertBefore(startClone, originalCards[0]);
      grid.appendChild(endClone);
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.blog-card'));
    var ticking = false;
    var wrapTimer = null;
    var touching = false;

    function update() {
      ticking = false;
      var gridRect = grid.getBoundingClientRect();
      var centerX = gridRect.left + gridRect.width / 2;
      var closestI = 0, closestDist = Infinity;
      cards.forEach(function (card, i) {
        var r = card.getBoundingClientRect();
        var cardCenter = r.left + r.width / 2;
        var d = Math.abs(cardCenter - centerX);
        var dist = Math.min(d / gridRect.width, 1); // 0 at rest, 1 one card-width away
        // smoothstep easing so the crossfade accelerates through the middle
        // and settles softly at both ends
        var eased = dist * dist * (3 - 2 * dist);
        card.style.opacity = (1 - eased * 0.82).toFixed(3);
        if (d < closestDist) { closestDist = d; closestI = i; }
      });
      return closestI;
    }

    // scrollLeft that centres a given card — derived from real geometry, so
    // it stays correct whatever the card width/gap is at this breakpoint
    function scrollTargetFor(index) {
      var gridRect = grid.getBoundingClientRect();
      var cardRect = cards[index].getBoundingClientRect();
      return grid.scrollLeft + (cardRect.left - gridRect.left) - (gridRect.width - cardRect.width) / 2;
    }

    // the wrap is the one thing that must never fight the user: only run it
    // once the finger is off AND the scroll has actually come to rest on a
    // clone. Jumping scrollLeft mid-gesture yanks the carousel out from under
    // the swipe, which reads as "the carousel doesn't work".
    function maybeWrap() {
      if (!loopable || touching) return;
      var index = update();
      if (index !== 0 && index !== cards.length - 1) return;
      // No centring check here: at either end the scroller clamps, so a
      // centre-aligned clone can never actually sit dead centre. Getting here
      // already means the finger is off and no scroll event has fired for
      // 260ms, i.e. it has come to rest.
      grid.scrollLeft = scrollTargetFor(index === 0 ? cards.length - 2 : 1);
      update();
    }

    grid.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
      clearTimeout(wrapTimer);
      wrapTimer = setTimeout(maybeWrap, 260);
    }, { passive: true });

    // native scrollend where it exists (Chrome 114+/Safari 17.4+) is exact —
    // the debounce above is the fallback for older phones
    if ('onscrollend' in window) {
      grid.addEventListener('scrollend', function () {
        clearTimeout(wrapTimer);
        maybeWrap();
      });
    }

    ['touchstart', 'pointerdown'].forEach(function (ev) {
      grid.addEventListener(ev, function () { touching = true; }, { passive: true });
    });
    ['touchend', 'touchcancel', 'pointerup', 'pointercancel'].forEach(function (ev) {
      window.addEventListener(ev, function () {
        if (!touching) return;
        touching = false;
        clearTimeout(wrapTimer);
        wrapTimer = setTimeout(maybeWrap, 260);
      }, { passive: true });
    });

    window.addEventListener('resize', function () {
      var index = update();
      grid.scrollLeft = scrollTargetFor(index);
      update();
    });

    function start() {
      if (loopable) grid.scrollLeft = scrollTargetFor(1); // the real first card
      update();
    }
    start();
    // covers get lazy-loaded, so card geometry can still shift after first
    // paint — re-anchor once everything has actually settled
    window.addEventListener('load', start);
  });
})();
