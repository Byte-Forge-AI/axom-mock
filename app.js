// Test engine. State stays in memory; nothing is sent to a server.
(function () {
  var MINUTES = 90; // practice timer; the official duration is on the admit card
  var T = {
    en: { arith: 'Arithmetic', english: 'English', reason: 'Reasoning', assam: 'Assam', gk: 'General Knowledge',
      start: 'Start', intro: 'Mock Test ' + MOCK_N, rules: '100 questions. 50 marks. No negative marking. Practice timer: ' + MINUTES + ' minutes.',
      prev: 'Back', next: 'Next', submit: 'Submit the test', confirm: 'Submit now? Unanswered questions: ',
      score: 'Your score', outOf: 'out of 50', section: 'Section', correct: 'Correct', review: 'Review the answers',
      again: 'Do the test again', home: 'Home', yours: 'Your answer', none: 'Not answered', q: 'Question', time: 'Time is up.' },
    as: { arith: 'পাটীগণিত', english: 'ইংৰাজী', reason: 'যুক্তি', assam: 'অসম', gk: 'সাধাৰণ জ্ঞান',
      start: 'আৰম্ভ কৰক', intro: 'মক টেষ্ট ' + MOCK_N, rules: '100 টা প্ৰশ্ন। 50 নম্বৰ। ঋণাত্মক নম্বৰ নাই। অনুশীলনৰ সময়: ' + MINUTES + ' মিনিট।',
      prev: 'পিছলৈ', next: 'আগলৈ', submit: 'টেষ্ট জমা দিয়ক', confirm: 'এতিয়া জমা দিব নে? উত্তৰ নিদিয়া প্ৰশ্ন: ',
      score: 'আপোনাৰ নম্বৰ', outOf: '50 ৰ ভিতৰত', section: 'শাখা', correct: 'শুদ্ধ', review: 'উত্তৰসমূহ চাওক',
      again: 'আকৌ টেষ্ট দিয়ক', home: 'মূল পৃষ্ঠা', yours: 'আপোনাৰ উত্তৰ', none: 'উত্তৰ দিয়া নাই', q: 'প্ৰশ্ন', time: 'সময় শেষ।' }
  };
  if (!window.MOCK) { document.getElementById('app').innerHTML = '<div class="card"><p>This test is not available. <a href="index.html">Home</a></p></div>'; return; }
  document.title = 'Mock Test ' + MOCK_N + ' – AxomMock';
  var qs = window.MOCK.questions, ans = new Array(qs.length).fill(null);
  var cur = 0, view = 'intro', left = MINUTES * 60, tick = null, app = document.getElementById('app');
  function t(k) { return T[LANG][k]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(s) { var m = Math.floor(s / 60), x = s % 60; return m + ':' + (x < 10 ? '0' : '') + x; }

  function render() {
    if (view === 'intro') {
      app.innerHTML = '<h1>' + t('intro') + '</h1><div class="card"><p>' + t('rules') + '</p><button class="btn" id="go">' + t('start') + '</button></div>';
      document.getElementById('go').onclick = function () { view = 'test'; tick = setInterval(step, 1000); render(); };
    } else if (view === 'test') {
      var q = qs[cur], h = '<div class="bar"><span class="sec">' + t(q.s) + ' · ' + t('q') + ' ' + (cur + 1) + '/100</span><span class="timer' + (left < 300 ? ' low' : '') + '" id="tm">' + fmt(left) + '</span></div>';
      h += '<div class="card"><p class="qtext">' + esc(q.q[LANG]) + '</p>';
      q.o.forEach(function (o, i) { h += '<button class="opt' + (ans[cur] === i ? ' sel' : '') + '" data-i="' + i + '">' + 'ABCD'[i] + '. ' + esc(o[LANG]) + '</button>'; });
      h += '<div class="nav"><button class="btn ghost" id="pv"' + (cur ? '' : ' disabled') + '>' + t('prev') + '</button>' +
        (cur < 99 ? '<button class="btn" id="nx">' + t('next') + '</button>' : '<button class="btn" id="sb">' + t('submit') + '</button>') + '</div></div>';
      h += '<div class="grid">' + qs.map(function (_, i) { return '<button data-g="' + i + '" class="' + (ans[i] !== null ? 'done ' : '') + (i === cur ? 'cur' : '') + '">' + (i + 1) + '</button>'; }).join('') + '</div>';
      h += '<p style="text-align:center;margin-top:16px"><button class="btn ghost" id="sb2">' + t('submit') + '</button></p>';
      app.innerHTML = h;
      app.querySelectorAll('.opt').forEach(function (b) { b.onclick = function () { ans[cur] = +b.dataset.i; render(); }; });
      app.querySelectorAll('[data-g]').forEach(function (b) { b.onclick = function () { cur = +b.dataset.g; render(); }; });
      var pv = document.getElementById('pv'), nx = document.getElementById('nx'), sb = document.getElementById('sb');
      if (pv) pv.onclick = function () { cur--; render(); };
      if (nx) nx.onclick = function () { cur++; render(); window.scrollTo(0, 0); };
      if (sb) sb.onclick = finish;
      document.getElementById('sb2').onclick = finish;
    } else {
      var by = {}, right = 0;
      qs.forEach(function (q, i) { by[q.s] = by[q.s] || [0, 0]; by[q.s][1]++; if (ans[i] === q.a) { by[q.s][0]++; right++; } });
      var r = '<h1>' + t('score') + '</h1><div class="card"><p class="score">' + (right / 2) + ' <small style="font-size:1rem;color:var(--muted)">' + t('outOf') + '</small></p><table><tr><th>' + t('section') + '</th><th>' + t('correct') + '</th></tr>';
      Object.keys(by).forEach(function (k) { r += '<tr><td>' + t(k) + '</td><td>' + by[k][0] + ' / ' + by[k][1] + '</td></tr>'; });
      r += '</table><p><a class="btn" href="test.html?m=' + MOCK_N + '">' + t('again') + '</a> <a class="btn ghost" href="index.html">' + t('home') + '</a></p></div><h2>' + t('review') + '</h2>';
      qs.forEach(function (q, i) {
        r += '<div class="card"><span class="sec">' + t(q.s) + ' · ' + (i + 1) + '</span><p class="qtext">' + esc(q.q[LANG]) + '</p>';
        q.o.forEach(function (o, j) { r += '<div class="opt' + (j === q.a ? ' right' : (ans[i] === j ? ' wrong' : '')) + '">' + 'ABCD'[j] + '. ' + esc(o[LANG]) + '</div>'; });
        r += '<p class="exp">' + t('yours') + ': ' + (ans[i] === null ? t('none') : 'ABCD'[ans[i]]) + (q.e ? ' · ' + esc(q.e) : '') + '</p></div>';
      });
      app.innerHTML = r;
    }
  }
  function step() { left--; var e = document.getElementById('tm'); if (e) { e.textContent = fmt(left); if (left < 300) e.classList.add('low'); } if (left <= 0) { clearInterval(tick); view = 'result'; render(); window.scrollTo(0, 0); } }
  function finish() {
    var open = ans.filter(function (a) { return a === null; }).length;
    if (open && !window.confirm(t('confirm') + open)) return;
    clearInterval(tick); view = 'result'; render(); window.scrollTo(0, 0);
  }
  window.onLangChange = render;
  window.__axom = { ans: ans, finish: function () { clearInterval(tick); view = 'result'; render(); } };
})();
