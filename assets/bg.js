/* =========================================================
   全站脚本：
   1) 首页背景动画（节点 + 连线 + 能量脉冲）
   2) 滚动淡入
   想关掉背景动画：删掉页面里的 <canvas id="grid"> 即可，其余不受影响。
   ========================================================= */
(function () {
  /* ---------- 背景动画 ---------- */
  var canvas = document.getElementById('grid');
  if (canvas && canvas.getContext) {
    (function () {
      var ctx = canvas.getContext('2d');
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var W = 0, H = 0, DPR = 1;
      var nodes = [], pulses = [], raf = null, last = 0, spawnAcc = 0;
      var LINK = 132;

      function resize() {
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        W = canvas.clientWidth;
        H = canvas.clientHeight;
        canvas.width = Math.round(W * DPR);
        canvas.height = Math.round(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        build();
      }

      function build() {
        var count = Math.max(28, Math.min(72, Math.round(W * H / 24000)));
        nodes = [];
        for (var i = 0; i < count; i++) {
          nodes.push({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.16,
            vy: (Math.random() - 0.5) * 0.16,
            r: Math.random() * 1.2 + 0.7
          });
        }
        pulses = [];
      }

      function step(dt) {
        var f = dt / 16.67;
        for (var i = 0; i < nodes.length; i++) {
          var n = nodes[i];
          n.x += n.vx * f;
          n.y += n.vy * f;
          if (n.x < 0) { n.x = 0; n.vx *= -1; }
          if (n.x > W) { n.x = W; n.vx *= -1; }
          if (n.y < 0) { n.y = 0; n.vy *= -1; }
          if (n.y > H) { n.y = H; n.vy *= -1; }
        }

        spawnAcc += dt;
        if (spawnAcc > 480) { spawnAcc = 0; spawnPulse(); }

        for (var p = pulses.length - 1; p >= 0; p--) {
          pulses[p].t += dt / pulses[p].dur;
          if (pulses[p].t > 1) pulses.splice(p, 1);
        }
      }

      function spawnPulse() {
        if (pulses.length > 9 || nodes.length < 2) return;
        var a = nodes[(Math.random() * nodes.length) | 0];
        var near = [];
        for (var i = 0; i < nodes.length; i++) {
          var b = nodes[i];
          if (b === a) continue;
          var dx = b.x - a.x, dy = b.y - a.y;
          if (dx * dx + dy * dy < LINK * LINK * 0.85) near.push(b);
        }
        if (!near.length) return;
        pulses.push({
          a: a,
          b: near[(Math.random() * near.length) | 0],
          t: 0,
          dur: 900 + Math.random() * 700
        });
      }

      function draw() {
        ctx.clearRect(0, 0, W, H);

        var lv = [[], [], []];
        for (var i = 0; i < nodes.length; i++) {
          for (var j = i + 1; j < nodes.length; j++) {
            var a = nodes[i], b = nodes[j];
            var dx = a.x - b.x, dy = a.y - b.y;
            var d2 = dx * dx + dy * dy;
            if (d2 > LINK * LINK) continue;
            var k = 2 - Math.floor((Math.sqrt(d2) / LINK) * 3);
            if (k < 0) k = 0;
            if (k > 2) k = 2;
            lv[k].push(a.x, a.y, b.x, b.y);
          }
        }
        var colors = ['rgba(78,161,255,.06)', 'rgba(78,161,255,.13)', 'rgba(120,190,255,.24)'];
        for (var L = 0; L < 3; L++) {
          var arr = lv[L];
          if (!arr.length) continue;
          ctx.beginPath();
          for (var q = 0; q < arr.length; q += 4) {
            ctx.moveTo(arr[q], arr[q + 1]);
            ctx.lineTo(arr[q + 2], arr[q + 3]);
          }
          ctx.strokeStyle = colors[L];
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.beginPath();
        for (var m = 0; m < nodes.length; m++) {
          var nd = nodes[m];
          ctx.moveTo(nd.x + nd.r, nd.y);
          ctx.arc(nd.x, nd.y, nd.r, 0, Math.PI * 2);
        }
        ctx.fillStyle = 'rgba(150,195,255,.55)';
        ctx.fill();

        for (var p = 0; p < pulses.length; p++) {
          var pu = pulses[p];
          var x = pu.a.x + (pu.b.x - pu.a.x) * pu.t;
          var y = pu.a.y + (pu.b.y - pu.a.y) * pu.t;
          var g = ctx.createRadialGradient(x, y, 0, x, y, 10);
          g.addColorStop(0, 'rgba(190,230,255,.95)');
          g.addColorStop(0.35, 'rgba(78,161,255,.55)');
          g.addColorStop(1, 'rgba(78,161,255,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(235,248,255,.95)';
          ctx.beginPath();
          ctx.arc(x, y, 1.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      function frame(now) {
        var dt = Math.min(40, now - (last || now));
        last = now;
        step(dt);
        draw();
        raf = requestAnimationFrame(frame);
      }

      function start() {
        if (reduce) { draw(); return; }
        if (raf !== null) return;
        last = 0;
        raf = requestAnimationFrame(frame);
      }

      function stop() {
        if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
      }

      var t = null;
      window.addEventListener('resize', function () {
        clearTimeout(t);
        t = setTimeout(function () { stop(); resize(); start(); }, 180);
      });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop(); else start();
      });

      resize();
      start();
    })();
  }

  /* ---------- 滚动淡入 ---------- */
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    for (var i = 0; i < items.length; i++) io.observe(items[i]);
  } else {
    for (var k = 0; k < items.length; k++) items[k].classList.add('in');
  }
})();
