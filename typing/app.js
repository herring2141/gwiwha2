/* app.js — 한글 타자 연습 (두벌식)
   모드: 자리연습 / 낱글자 / 단문 / 귀화 작문(장문)
   입력은 hangul.js 오토마타로 처리(OS IME 불필요). 정답은 키스트로크 단위 비교. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ===== I18N =====
  var I18N = {
    ko: {
      'app.title': '한글 타자 연습', 'app.toQuiz': '📚 귀화앱',
      'home.lead': '한글 자판이 손에 익을 때까지, 한 단계씩 천천히 연습해요.',
      'home.imeTip': '💡 컴퓨터 입력기를 한글로 바꾸지 않아도 됩니다. 화면이 알려주는 키를 그대로 누르세요.',
      'home.hint': '개인용 연습 도구 · 점수는 이 기기에만 저장됩니다.',
      'mode.position.t': '자리 연습', 'mode.position.s': 'ㅎ ㅁ ㅂ ㅕ — 자판 위치와 손가락 익히기',
      'mode.syllable.t': '낱글자 연습', 'mode.syllable.s': '자음+모음을 모아 한 글자씩 완성',
      'mode.short.t': '단문 연습', 'mode.short.s': '짧은 문장 따라 치기',
      'mode.long.t': '귀화 작문 연습', 'mode.long.s': '작문 모범답안(200자) 따라 치기',
      'common.home': '홈', 'common.list': '목록', 'common.retry': '다시', 'common.next': '다음 →',
      'stat.time': '시간', 'stat.speed': '타수', 'stat.acc': '정확도', 'stat.miss': '오타',
      'next.this': '이 자리', 'next.char': '다음', 'next.space': '스페이스', 'next.enter': '엔터',
      'next.shift': 'Shift 함께', 'done.title': '잘했어요! 완성 🎉', 'done.best': '최고 기록 경신! ⭐',
      'done.speed': '타/분', 'done.acc': '정확도', 'done.time': '걸린 시간',
      'list.position': '단계를 골라 시작하세요. 처음에는 ‘기본 자리’부터.',
      'list.syllable': '쉬운 글자부터 한 글자씩 완성해 보세요.',
      'list.short': '짧은 문장을 따라 치며 손을 풀어요.',
      'list.long': '귀화 작문 시험에 나오는 주제의 모범답안입니다. 의미를 보며 따라 치세요.',
      'sec.sec': '초', 'best.label': '최고', 'topic.label': '주제'
    },
    zh: {
      'app.title': '韩文打字练习', 'app.toQuiz': '📚 入籍App',
      'home.lead': '在熟悉韩文键盘之前，一步一步慢慢练习。',
      'home.imeTip': '💡 不需要把电脑输入法切换成韩文。直接按屏幕提示的键即可。',
      'home.hint': '个人练习工具 · 成绩仅保存在本设备。',
      'mode.position.t': '指位练习', 'mode.position.s': 'ㅎ ㅁ ㅂ ㅕ — 熟悉键位与手指',
      'mode.syllable.t': '单字练习', 'mode.syllable.s': '辅音+元音，一个字一个字组合',
      'mode.short.t': '短句练习', 'mode.short.s': '跟着打短句子',
      'mode.long.t': '入籍作文练习', 'mode.long.s': '跟着打作文范文（200字）',
      'common.home': '主页', 'common.list': '列表', 'common.retry': '重来', 'common.next': '下一个 →',
      'stat.time': '时间', 'stat.speed': '速度', 'stat.acc': '准确率', 'stat.miss': '错字',
      'next.this': '此键', 'next.char': '下一个', 'next.space': '空格', 'next.enter': '回车',
      'next.shift': '同时按 Shift', 'done.title': '做得好！完成 🎉', 'done.best': '刷新最佳成绩！⭐',
      'done.speed': '键/分', 'done.acc': '准确率', 'done.time': '用时',
      'list.position': '选择一个阶段开始。第一次请从“基本键位”开始。',
      'list.syllable': '从简单的字开始，一个字一个字完成。',
      'list.short': '跟着打短句子，活动手指。',
      'list.long': '这些是入籍作文考试主题的范文。看着意思跟着打。',
      'sec.sec': '秒', 'best.label': '最佳', 'topic.label': '主题'
    }
  };
  var lang = localStorage.getItem('typing_lang') || 'ko';
  function t(k) { return (I18N[lang] && I18N[lang][k]) || I18N.ko[k] || k; }

  // ===== 콘텐츠 =====
  var POSITION_STEPS = [
    { title: { ko: '기본 자리 (가운뎃줄)', zh: '基本键位（中排）' }, set: ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'] },
    { title: { ko: '윗줄', zh: '上排' }, set: ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'] },
    { title: { ko: '아랫줄', zh: '下排' }, set: ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'] },
    { title: { ko: '쌍자음·이중모음 (Shift)', zh: '双辅音·复元音（Shift）' }, set: ['ㅃ', 'ㅉ', 'ㄸ', 'ㄲ', 'ㅆ', 'ㅒ', 'ㅖ'] },
    { title: { ko: '전체 섞어서', zh: '全部混合' }, set: ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ', 'ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅕ', 'ㅐ', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅜ', 'ㅡ'] }
  ];
  var SYLLABLE_STEPS = [
    { title: { ko: '기본 글자 (자음 + ㅏ)', zh: '基本字（辅音+ㅏ）' }, text: '가 나 다 라 마 바 사 아 자 차 카 타 파 하' },
    { title: { ko: 'ㄱ + 모든 모음', zh: 'ㄱ + 所有元音' }, text: '가 갸 거 겨 고 교 구 규 그 기' },
    { title: { ko: 'ㅇ + 모든 모음', zh: 'ㅇ + 所有元音' }, text: '아 야 어 여 오 요 우 유 으 이' },
    { title: { ko: '받침이 있는 글자', zh: '带收音的字' }, text: '강 산 물 밤 곰 집 발 손 눈 별 꽃 옷' },
    { title: { ko: '쉬운 낱말', zh: '简单词语' }, text: '한국 사랑 가족 친구 학교 감사 행복 우리 사람 음식 한글 나라' }
  ];
  var CURATED_SHORT = [
    { text: '안녕하세요.', zh: '你好。' },
    { text: '만나서 반갑습니다.', zh: '很高兴见到你。' },
    { text: '저는 외국에서 왔어요.', zh: '我来自外国。' },
    { text: '한국 생활이 즐거워요.', zh: '韩国生活很愉快。' },
    { text: '한국어를 열심히 배워요.', zh: '我努力学习韩语。' },
    { text: '오늘도 좋은 하루 보내세요.', zh: '今天也祝你过得愉快。' }
  ];

  function topicOf(q) {
    if (!q) return '';
    var s = q.replace(/^다음 주제로[^:：]*[:：]\s*/, '').trim();
    s = s.replace(/<br\s*\/?>/gi, ' ').replace(/^["“”']|["“”'.]$/g, '').trim();
    return s;
  }
  function cleanPrompt(q) { return (q || '').replace(/<br\s*\/?>/gi, ' / '); }

  var DATA = window.TYPING_WRITING || [];
  var NAT = DATA.filter(function (d) { return (d.exam || 'nat') === 'nat'; });
  var PRE = DATA.filter(function (d) { return d.exam === 'pre'; });

  var SHORT_ITEMS = CURATED_SHORT.map(function (c) { return { text: c.text, trans: c.zh, kind: 'text' }; })
    .concat(PRE.map(function (d) {
      return { text: (d.model || '').trim(), trans: d.model_zh || '', topic: cleanPrompt(d.q), kind: 'text' };
    }).filter(function (x) { return x.text; }));

  var LONG_ITEMS = NAT.map(function (d) {
    return { text: (d.model || '').trim(), trans: d.model_zh || '', topic: topicOf(d.q), kind: 'text', id: d.id };
  }).filter(function (x) { return x.text; });

  var MODES = {
    position: { kind: 'position', title: { ko: '자리 연습', zh: '指位练习' }, desc: 'list.position', items: POSITION_STEPS },
    syllable: { kind: 'text', title: { ko: '낱글자 연습', zh: '单字练习' }, desc: 'list.syllable', items: SYLLABLE_STEPS },
    short: { kind: 'text', title: { ko: '단문 연습', zh: '短句练习' }, desc: 'list.short', items: SHORT_ITEMS },
    long: { kind: 'text', title: { ko: '귀화 작문 연습', zh: '入籍作文练习' }, desc: 'list.long', items: LONG_ITEMS }
  };

  // ===== 가상 키보드 레이아웃 =====
  var PUNCT = {
    Backquote: ['`', '~'], Digit1: ['1', '!'], Digit2: ['2', '@'], Digit3: ['3', '#'], Digit4: ['4', '$'],
    Digit5: ['5', '%'], Digit6: ['6', '^'], Digit7: ['7', '&'], Digit8: ['8', '*'], Digit9: ['9', '('],
    Digit0: ['0', ')'], Minus: ['-', '_'], Equal: ['=', '+'], BracketLeft: ['[', '{'], BracketRight: [']', '}'],
    Backslash: ['\\', '|'], Semicolon: [';', ':'], Quote: ["'", '"'], Comma: [',', '<'], Period: ['.', '>'], Slash: ['/', '?']
  };
  var KB_ROWS = [
    ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', { code: 'Backspace', label: '⌫', cls: 'special wide' }],
    [{ code: 'Tab', label: 'Tab', cls: 'special wide' }, 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
    [{ code: 'CapsLock', label: 'Caps', cls: 'special wider' }, 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', { code: 'Enter', label: '↵', cls: 'special wider' }],
    [{ code: 'ShiftLeft', label: 'Shift', cls: 'special widest' }, 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', { code: 'ShiftRight', label: 'Shift', cls: 'special widest' }],
    [{ code: 'Space', label: '', cls: 'spacekey' }]
  ];
  var keyEls = {}; // code -> element

  function buildKeyboard() {
    var kb = $('#keyboard');
    kb.innerHTML = '';
    keyEls = {};
    KB_ROWS.forEach(function (row) {
      var r = document.createElement('div');
      r.className = 'kbd-row';
      row.forEach(function (cell) {
        var code = typeof cell === 'string' ? cell : cell.code;
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'key';
        el.dataset.code = code;
        if (typeof cell === 'object') {
          el.className += ' ' + (cell.cls || '');
          var m = document.createElement('span'); m.className = 'key__main'; m.textContent = cell.label; el.appendChild(m);
        } else if (HG.DUBEOL[code]) {
          var f = HG.FINGER[code]; if (f) el.className += ' f-' + f.finger;
          if (code === 'KeyF' || code === 'KeyJ') el.className += ' homedot';
          var main = document.createElement('span'); main.className = 'key__main'; main.textContent = HG.DUBEOL[code].base; el.appendChild(main);
          if (HG.DUBEOL[code].shift) { var sh = document.createElement('span'); sh.className = 'key__shift'; sh.textContent = HG.DUBEOL[code].shift; el.appendChild(sh); }
          var lat = document.createElement('span'); lat.className = 'key__lat'; lat.textContent = code.replace('Key', '').toLowerCase(); el.appendChild(lat);
        } else if (PUNCT[code]) {
          var f2 = HG.FINGER[code]; if (f2) el.className += ' f-' + f2.finger;
          var m2 = document.createElement('span'); m2.className = 'key__main'; m2.textContent = PUNCT[code][0]; el.appendChild(m2);
          var s2 = document.createElement('span'); s2.className = 'key__shift'; s2.textContent = PUNCT[code][1]; el.appendChild(s2);
        }
        el.addEventListener('click', function () { onVirtualKey(code); });
        keyEls[code] = el;
        r.appendChild(el);
      });
      kb.appendChild(r);
    });
    buildHands();
  }

  var FINGER_ORDER = [['L', 'pinky'], ['L', 'ring'], ['L', 'middle'], ['L', 'index'], 'gap', ['R', 'index'], ['R', 'middle'], ['R', 'ring'], ['R', 'pinky']];
  function buildHands() {
    var h = $('#hands'); h.innerHTML = '';
    FINGER_ORDER.forEach(function (fo) {
      if (fo === 'gap') { var g = document.createElement('div'); g.className = 'finger-gap'; h.appendChild(g); return; }
      var d = document.createElement('div');
      d.className = 'finger-dot';
      d.dataset.hand = fo[0]; d.dataset.finger = fo[1];
      d.innerHTML = '<span class="dot"></span><span class="lbl">' + HG.HAND_LABEL[lang][fo[0]] + '<br>' + HG.FINGER_LABEL[lang][fo[1]] + '</span>';
      h.appendChild(d);
    });
  }

  // ===== 상태 =====
  var state = null;
  var timerId = null;

  function newState(mode, idx) {
    var cfg = MODES[mode];
    var item = cfg.items[idx];
    var s = { mode: mode, kind: cfg.kind, idx: idx, item: item, correct: 0, errors: 0, startTime: 0, running: false, finished: false };
    if (cfg.kind === 'position') {
      s.seq = buildDrill(item.set);
      s.posIdx = 0;
      s.total = s.seq.length;
    } else {
      s.target = item.text;
      s.tokens = HG.textToKeystrokes(item.text);
      s.chars = HG.sanitize(item.text).split('');
      s.pos = 0;
      s.total = s.tokens.length;
    }
    return s;
  }

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function buildDrill(set) { return set.slice().concat(shuffle(set)).concat(shuffle(set)); }

  // ===== 화면 전환 =====
  function show(view) { $$('.view').forEach(function (v) { v.classList.add('hidden'); }); $('#view-' + view).classList.remove('hidden'); window.scrollTo(0, 0); }

  function goHome() { stopTimer(); show('home'); }
  function goList(mode) {
    var cfg = MODES[mode];
    $('#listTitle').textContent = cfg.title[lang] || cfg.title.ko;
    $('#listDesc').textContent = t(cfg.desc);
    var box = $('#listItems'); box.innerHTML = '';
    cfg.items.forEach(function (item, i) {
      var b = document.createElement('button');
      b.className = 'select-item';
      var title, sub = '';
      if (cfg.kind === 'position') { title = item.title[lang] || item.title.ko; sub = item.set.join(' '); }
      else { title = (item.topic ? item.topic : item.text); if (item.topic) sub = item.text; }
      var best = getBest(mode, i);
      b.innerHTML = '<span class="select-item__main"><span class="select-item__title">' + esc(clip(title, 42)) + '</span>' +
        (sub ? '<span class="select-item__sub">' + esc(clip(sub, 60)) + '</span>' : '') + '</span>' +
        (best ? '<span class="select-item__best">' + t('best.label') + ' ' + best + '</span>' : '');
      b.addEventListener('click', function () { startPractice(mode, i); });
      box.appendChild(b);
    });
    state = { mode: mode };
    show('list');
  }

  // ===== 연습 시작 =====
  function startPractice(mode, idx) {
    state = newState(mode, idx);
    var cfg = MODES[mode];
    $('#pracTitle').textContent = (cfg.kind === 'position' ? (state.item.title[lang] || state.item.title.ko) : (cfg.title[lang] || cfg.title.ko));
    // 의미/주제
    var meta = $('#pracMeta');
    if (state.kind === 'text' && (state.item.topic || (state.item.trans && lang === 'zh'))) {
      var html = '';
      if (state.item.topic) html += '<div class="prac-meta__topic">' + (mode === 'long' ? (t('topic.label') + ': ') : '') + esc(state.item.topic) + '</div>';
      if (state.item.trans) html += '<div class="prac-meta__trans">' + esc(state.item.trans) + '</div>';
      meta.innerHTML = html; meta.classList.remove('hidden');
    } else { meta.classList.add('hidden'); }
    $('#pracDone').classList.add('hidden');
    show('practice');
    render();
    updateStats();
  }

  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } if (state) state.running = false; }
  function startTimerIfNeeded() {
    if (state.running || state.finished) return;
    state.running = true; state.startTime = Date.now();
    timerId = setInterval(function () { updateStats(); }, 200);
  }

  // ===== 입력 처리 =====
  function currentExpected() {
    if (!state) return null;
    if (state.kind === 'position') {
      if (state.posIdx >= state.seq.length) return null;
      var jamo = state.seq[state.posIdx];
      var key = HG.JAMO_TO_KEY[jamo];
      return { type: 'jamo', jamo: jamo, key: key };
    } else {
      if (state.pos >= state.tokens.length) return null;
      var tok = state.tokens[state.pos];
      return { type: tok.type, jamo: tok.jamo, ch: tok.ch, key: HG.tokenKey(tok), tok: tok };
    }
  }

  function handleInput(code, shift) {
    if (!state || state.finished || ($('#view-practice').classList.contains('hidden'))) return false;
    var exp = currentExpected();
    if (!exp) return false;
    startTimerIfNeeded();
    var ok;
    if (state.kind === 'position') {
      ok = HG.producedJamo(code, shift) === exp.jamo;
    } else {
      ok = HG.matches(exp.tok, code, shift);
    }
    if (ok) {
      if (state.kind === 'position') state.posIdx++; else state.pos++;
      state.correct++;
      flashKey(code, 'pressed');
      render();
      updateStats();
      if (progressCount() >= state.total) finish();
    } else {
      state.errors++;
      flashKey(code, 'miss');
      var ek = exp.key; if (ek && keyEls[ek.code]) { keyEls[ek.code].classList.add('miss'); setTimeout(function (e) { e.classList.remove('miss'); }, 300, keyEls[ek.code]); }
      updateStats();
    }
    return true;
  }

  function progressCount() { return state.kind === 'position' ? state.posIdx : state.pos; }

  function backspace() {
    if (!state || state.finished) return;
    if (state.kind === 'position') { if (state.posIdx > 0) state.posIdx--; }
    else { if (state.pos > 0) state.pos--; }
    render(); updateStats();
  }

  function flashKey(code, cls) {
    var el = keyEls[code]; if (!el) return;
    el.classList.add(cls); setTimeout(function () { el.classList.remove(cls); }, 120);
  }

  function onVirtualKey(code) {
    var exp = currentExpected();
    // 화면 키 탭: 기대 키와 같으면 필요한 shift 자동 적용
    var shift = (exp && exp.key && exp.key.code === code) ? !!exp.key.shift : false;
    if (code === 'Backspace') { backspace(); return; }
    if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'CapsLock' || code === 'Tab') return;
    handleInput(code, shift);
  }

  // 물리 키보드
  document.addEventListener('keydown', function (e) {
    if ($('#view-practice').classList.contains('hidden')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var code = e.code;
    var typingKey = HG.DUBEOL[code] || PUNCT[code] || code === 'Space' || code === 'Enter';
    if (code === 'Backspace') { e.preventDefault(); backspace(); return; }
    if (!typingKey) return;
    e.preventDefault();
    handleInput(code, e.shiftKey);
  });

  // ===== 렌더 =====
  function render() {
    var box = $('#targetBox');
    highlightKeyboard();
    if (state.kind === 'position') renderPosition(box);
    else renderText(box);
    renderNextKey();
    var pct = state.total ? Math.round(progressCount() / state.total * 100) : 0;
    $('#pracProgress').style.width = pct + '%';
  }

  function renderPosition(box) {
    var seq = state.seq, i = state.posIdx;
    var html = '<div class="pos-stage"><div class="pos-queue">';
    for (var k = i - 2; k <= i + 4; k++) {
      if (k < 0 || k >= seq.length) { html += '<div class="pos-cell"></div>'; continue; }
      var cls = 'pos-cell' + (k === i ? ' is-current' : k < i ? ' is-done' : '');
      html += '<div class="' + cls + '">' + (k < i ? '✓' : esc(seq[k])) + '</div>';
    }
    html += '</div><div class="pos-progress">' + Math.min(i + 1, seq.length) + ' / ' + seq.length + '</div></div>';
    box.innerHTML = html;
  }

  function renderText(box) {
    var chars = state.chars, toks = state.tokens, pos = state.pos;
    var currentCi = pos < toks.length ? toks[pos].ci : chars.length;
    var html = '<div class="txt-target">';
    for (var c = 0; c < chars.length; c++) {
      var ch = chars[c];
      var st = c < currentCi ? 'done' : c === currentCi ? 'current' : 'pending';
      if (ch === ' ') {
        // 현재 글자가 공백이면 강조 표시, 아니면 자연 공백(줄바꿈 가능 지점)
        html += (c === currentCi) ? '<span class="ch current sp"> </span>' : ' ';
      } else {
        html += '<span class="ch ' + st + '">' + esc(ch) + '</span>';
      }
    }
    html += '</div>';
    // 입력 echo
    var typed = HG.compose(toks.slice(0, pos));
    html += '<div class="txt-echo"><span class="txt-echo__label">' + (lang === 'zh' ? '我打的' : '내가 친 것') + '</span>' +
      esc(typed) + '<span class="caret"></span></div>';
    box.innerHTML = html;
  }

  function renderNextKey() {
    var exp = currentExpected();
    var nk = $('#nextKey');
    if (!exp) { nk.innerHTML = ''; return; }
    var label, big = '';
    if (state.kind === 'position') { label = t('next.this'); big = exp.jamo; }
    else if (exp.type === 'space') { label = t('next.char'); big = t('next.space'); }
    else if (exp.type === 'enter') { label = t('next.char'); big = t('next.enter'); }
    else if (exp.type === 'jamo') { label = t('next.char'); big = exp.jamo; }
    else { label = t('next.char'); big = exp.ch; }
    var html = '<b>' + esc(label) + '</b> <span class="nk-jamo">' + esc(big) + '</span>';
    var key = exp.key;
    if (key && HG.FINGER[key.code]) {
      var f = HG.FINGER[key.code];
      html += '<span class="nk-finger">' + HG.HAND_LABEL[lang][f.hand] + ' ' + HG.FINGER_LABEL[lang][f.finger] + '</span>';
    }
    if (key && key.shift) html += '<span class="nk-shift">⇧ ' + t('next.shift') + '</span>';
    nk.innerHTML = html;
  }

  function highlightKeyboard() {
    $$('.key.next, .key.next-shift').forEach(function (el) { el.classList.remove('next', 'next-shift'); });
    $$('.finger-dot.on').forEach(function (el) { el.classList.remove('on'); });
    var exp = currentExpected();
    if (!exp || !exp.key) return;
    var key = exp.key;
    var el = keyEls[key.code];
    if (el) el.classList.add('next');
    if (key.shift) {
      var f = HG.FINGER[key.code];
      var shiftCode = (f && f.hand === 'L') ? 'ShiftRight' : 'ShiftLeft';
      if (keyEls[shiftCode]) keyEls[shiftCode].classList.add('next-shift');
    }
    // 손가락 점등
    var fin = HG.FINGER[key.code];
    if (fin && fin.finger !== 'thumb') {
      $$('.finger-dot').forEach(function (d) { if (d.dataset.hand === fin.hand && d.dataset.finger === fin.finger) d.classList.add('on'); });
    }
  }

  // ===== 통계 =====
  function updateStats() {
    if (!state || state.kind === undefined) return;
    var elapsed = state.startTime ? (Date.now() - state.startTime) / 1000 : 0;
    var speed = elapsed >= 0.5 ? Math.min(9999, Math.round(state.correct / (elapsed / 60))) : 0;
    var attempts = state.correct + state.errors;
    var acc = attempts > 0 ? Math.round(state.correct / attempts * 100) : 100;
    $('#statTime').textContent = Math.floor(elapsed) + t('sec.sec');
    $('#statSpeed').textContent = speed;
    $('#statAcc').textContent = acc + '%';
    $('#statMiss').textContent = state.errors;
  }

  // ===== 완료 =====
  function finish() {
    stopTimer();
    state.finished = true;
    var elapsed = (Date.now() - state.startTime) / 1000;
    var speed = elapsed >= 0.5 ? Math.min(9999, Math.round(state.correct / (elapsed / 60))) : 0;
    var attempts = state.correct + state.errors;
    var acc = attempts > 0 ? Math.round(state.correct / attempts * 100) : 100;
    var prevBest = getBest(state.mode, state.idx);
    var isBest = speed > prevBest;
    if (isBest) setBest(state.mode, state.idx, speed);
    var d = $('#pracDone');
    var hasNext = state.idx + 1 < MODES[state.mode].items.length;
    d.innerHTML =
      '<div class="prac-done__title">' + t('done.title') + '</div>' +
      (isBest ? '<div class="prac-done__best">' + t('done.best') + '</div>' : '') +
      '<div class="prac-done__stats">' +
      '<div class="prac-done__stat"><b>' + speed + '</b><span>' + t('done.speed') + '</span></div>' +
      '<div class="prac-done__stat"><b>' + acc + '%</b><span>' + t('done.acc') + '</span></div>' +
      '<div class="prac-done__stat"><b>' + Math.floor(elapsed) + t('sec.sec') + '</b><span>' + t('done.time') + '</span></div>' +
      '</div><div class="prac-done__actions">' +
      '<button class="btn btn--ghost" id="doneRetry">↻ ' + t('common.retry') + '</button>' +
      (hasNext ? '<button class="btn btn--primary" id="doneNext">' + t('common.next') + '</button>' : '') +
      '</div>';
    d.classList.remove('hidden');
    $('#doneRetry').addEventListener('click', function () { startPractice(state.mode, state.idx); });
    if (hasNext) $('#doneNext').addEventListener('click', function () { startPractice(state.mode, state.idx + 1); });
    d.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ===== 저장 =====
  function bestStore() { try { return JSON.parse(localStorage.getItem('typing_best_v1') || '{}'); } catch (e) { return {}; } }
  function getBest(mode, idx) { return bestStore()[mode + ':' + idx] || 0; }
  function setBest(mode, idx, v) { var s = bestStore(); s[mode + ':' + idx] = v; localStorage.setItem('typing_best_v1', JSON.stringify(s)); }

  // ===== 유틸 =====
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clip(s, n) { s = String(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  // ===== i18n 적용 =====
  function applyI18n() {
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    $('#langBtn').textContent = lang === 'ko' ? '한 · 中' : '中 · 한';
  }

  // ===== 이벤트 =====
  function bind() {
    $('#homeBtn').addEventListener('click', goHome);
    $('#langBtn').addEventListener('click', function () {
      lang = lang === 'ko' ? 'zh' : 'ko';
      localStorage.setItem('typing_lang', lang);
      applyI18n(); buildHands();
      if (!$('#view-home').classList.contains('hidden')) { /* home */ }
      else if (!$('#view-list').classList.contains('hidden')) goList(state.mode);
      else if (!$('#view-practice').classList.contains('hidden')) { startPractice(state.mode, state.idx); }
    });
    $$('.mode-card').forEach(function (c) { c.addEventListener('click', function () { goList(c.dataset.mode); }); });
    $$('[data-go]').forEach(function (b) { b.addEventListener('click', function () { var g = b.dataset.go; if (g === 'home') goHome(); }); });
    $('#pracBack').addEventListener('click', function () { stopTimer(); goList(state.mode); });
  }

  // ===== 딥링크 (#모드/번호) =====
  function routeFromHash() {
    var m = (location.hash || '').replace(/^#/, '').split('/');
    var mode = m[0], idx = parseInt(m[1], 10);
    if (MODES[mode] && idx >= 0 && idx < MODES[mode].items.length) { startPractice(mode, idx); return true; }
    return false;
  }

  // ===== 초기화 =====
  function init() {
    buildKeyboard();
    applyI18n();
    bind();
    show('home');
    if (location.hash) routeFromHash();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
