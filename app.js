(function () {
  'use strict';
  const MS_PER_DAY = 86400000;
  const START_YEAR = 2026, START_MONTH = 9, END_YEAR = 2027, END_MONTH = 11;
  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const monthNamesUpper = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
  const weekdayNames = ['SEG','TER','QUA','QUI','SEX','SÁB','DOM'];
  const workerName = document.getElementById('workerName');
  const referenceDate = document.getElementById('referenceDate');
  const cyclePosition = document.getElementById('cyclePosition');
  const firstWorkDate = document.getElementById('firstWorkDate');
  const cyclePanel = document.getElementById('cyclePanel');
  const firstPanel = document.getElementById('firstPanel');
  const calendarArea = document.getElementById('calendarArea');
  const status = document.getElementById('status');
  const summary = document.getElementById('summary');
  const showHolidays = document.getElementById('showHolidays');

  function pad(n) { return String(n).padStart(2, '0'); }
  function isoLocalDate(date) { return date.getFullYear() + '-' + pad(date.getMonth()+1) + '-' + pad(date.getDate()); }
  function parseISODate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const parts = value.split('-').map(Number);
    const date = new Date(Date.UTC(parts[0], parts[1]-1, parts[2]));
    if (date.getUTCFullYear() !== parts[0] || date.getUTCMonth() !== parts[1]-1 || date.getUTCDate() !== parts[2]) return null;
    return date;
  }
  function formatDate(date) { return pad(date.getUTCDate()) + '/' + pad(date.getUTCMonth()+1) + '/' + date.getUTCFullYear(); }
  function mod(n, m) { return ((n % m) + m) % m; }
  function isCycleMode() { return document.querySelector('input[name="setupMode"]:checked').value === 'cycle'; }
  function selectedAnchor() {
    if (isCycleMode()) {
      const date = parseISODate(referenceDate.value);
      const position = cyclePosition.value === '' ? null : Number(cyclePosition.value);
      if (!date || position === null || !Number.isInteger(position) || position < 0 || position > 5) return null;
      return { date, position };
    }
    const date = parseISODate(firstWorkDate.value);
    if (!date) return null;
    return { date, position: 0 };
  }
  function cycleInfo(date, anchor) {
    const delta = Math.round((date.getTime() - anchor.date.getTime()) / MS_PER_DAY);
    const position = mod(anchor.position + delta, 6);
    return { position, isWork: position < 4, ordinal: position < 4 ? position + 1 : position - 3 };
  }

  function dateKey(date) {
    return date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1) + '-' + pad(date.getUTCDate());
  }
  function addUtcDays(date, days) {
    return new Date(date.getTime() + days * MS_PER_DAY);
  }
  // Gregorian Easter computus; national movable holidays are derived from Easter Sunday.
  function easterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(Date.UTC(year, month - 1, day));
  }
  function holidayLabels(date) {
    if (!showHolidays.checked) return [];

    const labels = [];
    const monthDay = pad(date.getUTCMonth() + 1) + '-' + pad(date.getUTCDate());
    const year = date.getUTCFullYear();
    const fixedNational = {
      '01-01': 'Ano Novo',
      '04-25': 'Dia da Liberdade',
      '05-01': 'Dia do Trabalhador',
      '06-10': 'Dia de Portugal, de Camões e das Comunidades Portuguesas',
      '08-15': 'Assunção de Nossa Senhora',
      '10-05': 'Implantação da República',
      '11-01': 'Dia de Todos os Santos',
      '12-01': 'Restauração da Independência',
      '12-08': 'Imaculada Conceição',
      '12-25': 'Natal'
    };
    if (fixedNational[monthDay]) labels.push(fixedNational[monthDay]);

    const easter = easterSunday(year);
    if (dateKey(date) === dateKey(addUtcDays(easter, -2))) labels.push('Sexta-Feira Santa');
    if (dateKey(date) === dateKey(easter)) labels.push('Domingo de Páscoa');
    if (dateKey(date) === dateKey(addUtcDays(easter, 60))) labels.push('Corpo de Deus');

    if (monthDay === '06-13') labels.push('Feriado municipal de Lisboa — Santo António');

    // The single display option shows all known dates; the title clarifies
    // that Carnival is facultative under Article 235 of the Labour Code.
    if (dateKey(date) === dateKey(addUtcDays(easter, -47))) {
      labels.push('Terça-feira de Carnaval (facultativo)');
    }
    return labels;
  }
  function getTodayUTC() {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }
  function allMonths() {
    const out = [];
    for (let y = START_YEAR, m = START_MONTH; y < END_YEAR || (y === END_YEAR && m <= END_MONTH); ) {
      out.push({year:y, month:m});
      m++;
      if (m > 11) { m = 0; y++; }
    }
    return out;
  }
  function renderMonth(month, anchor, today) {
    const first = new Date(Date.UTC(month.year, month.month, 1));
    const daysInMonth = new Date(Date.UTC(month.year, month.month + 1, 0)).getUTCDate();
    const mondayOffset = (first.getUTCDay() + 6) % 7;
    let html = '<section class="month-card" aria-label="' + monthNames[month.month] + ' ' + month.year + '">';
    html += '<div class="month-name">' + monthNamesUpper[month.month] + ' ' + month.year + '</div>';
    html += '<div class="days-grid weekday-row">' + weekdayNames.map(d => '<div>' + d + '</div>').join('') + '</div>';
    let day = 1;
    const weeks = Math.ceil((mondayOffset + daysInMonth) / 7);
    for (let w = 0; w < weeks; w++) {
      html += '<div class="days-grid week">';
      for (let col = 0; col < 7; col++) {
        const calendarIndex = w * 7 + col;
        if (calendarIndex < mondayOffset || day > daysInMonth) {
          html += '<div class="day empty" aria-hidden="true"></div>';
          continue;
        }
        const date = new Date(Date.UTC(month.year, month.month, day));
        const info = cycleInfo(date, anchor);
        const isToday = date.getTime() === today.getTime();
        const dateLabel = formatDate(date);
        const holidays = holidayLabels(date);
        const isHoliday = holidays.length > 0;
        const dayTitle = dateLabel + ' — ' + (info.isWork ? info.ordinal + 'º dia de trabalho' : info.ordinal + 'º dia de folga') + (isHoliday ? ' — Feriado: ' + holidays.join('; ') : '') + (isToday ? ' — hoje' : '');
        const classes = 'day ' + (info.isWork ? 'work' : 'off') + (isHoliday ? ' holiday' : '') + (isToday ? ' today' : '');
        html += '<div class="' + classes + '" title="' + dayTitle + '" aria-label="' + dayTitle + '"><span>' + day + '</span></div>';
        day++;
      }
      html += '</div>';
    }
    html += '</section>';
    return html;
  }
  function countPeriod(anchor) {
    let work = 0, off = 0, total = 0, holidayDays = 0;
    const start = new Date(Date.UTC(START_YEAR, START_MONTH, 1));
    const end = new Date(Date.UTC(END_YEAR, END_MONTH + 1, 0));
    for (let t = start.getTime(); t <= end.getTime(); t += MS_PER_DAY) {
      const info = cycleInfo(new Date(t), anchor);
      total++;
      if (info.isWork) work++; else off++;
      if (holidayLabels(new Date(t)).length > 0) holidayDays++;
    }
    return {work, off, total, holidayDays};
  }
  function titleName() {
    const name = workerName.value.trim();
    return name ? 'Calendário ' + name + ' 2026–2027' : 'Calendário de Turnos 2026–2027';
  }
  function renderCalendar() {
    const anchor = selectedAnchor();
    status.textContent = '';
    if (!anchor) {
      if (isCycleMode() && parseISODate(referenceDate.value) && cyclePosition.value === '') {
        status.textContent = 'Selecione a opção que corresponde à posição do ciclo nessa data para gerar o calendário.';
      } else {
        status.textContent = 'Introduza uma data válida para gerar o calendário.';
      }
      calendarArea.innerHTML = '';
      summary.innerHTML = '';
      document.title = titleName();
      return;
    }
    const today = getTodayUTC();
    const months = allMonths();
    const groups = [months.slice(0,8), months.slice(8)];
    const h1 = titleName();
    const counts = countPeriod(anchor);
    calendarArea.innerHTML = groups.map((group, index) => {
      const top = '<header class="top"><div><h2 class="calendar-title">' + escapeHTML(h1) + '</h2><div class="legend"><span class="legend-item"><span class="swatch work"></span> Trabalho</span><span class="legend-item"><span class="swatch off"></span> Folga</span><span class="legend-item"><span class="swatch holiday">F</span> Feriado</span><span class="legend-item">Semana de segunda-feira a domingo</span></div></div><div class="range-mark">OUT 2026<br>— DEZ 2027</div></header>';
      const grid = '<div class="year-grid">' + group.map(month => renderMonth(month, anchor, today)).join('') + '</div>';
      const footer = '<footer class="footer"><span>Período: <strong>01/10/2026 a 31/12/2027</strong> · ' + counts.total + ' dias</span><span>Trabalho: <strong>' + counts.work + '</strong> · Folga: <strong>' + counts.off + '</strong> · Dias com feriado: <strong>' + counts.holidayDays + '</strong>' + (index === 1 ? ' · Página 2 de 2' : ' · Página 1 de 2') + '</span></footer>';
      return '<section class="calendar-sheet" aria-label="Calendário, página ' + (index+1) + ' de 2">' + top + grid + footer + '</section>';
    }).join('');
    summary.innerHTML = '<span>Período: 15 meses</span><span>' + counts.total + ' dias no calendário</span><span>' + counts.work + ' dias de trabalho</span><span>' + counts.off + ' dias de folga</span><span>' + counts.holidayDays + ' dias com feriado assinalado</span>';
    document.title = h1;
  }
  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; });
  }
  function updateMode() {
    const cycle = isCycleMode();
    cyclePanel.classList.toggle('hidden', !cycle);
    firstPanel.classList.toggle('hidden', cycle);
    renderCalendar();
  }
  document.querySelectorAll('input[name="setupMode"]').forEach(el => el.addEventListener('change', updateMode));
  [workerName, referenceDate, cyclePosition, firstWorkDate, showHolidays].forEach(el => { el.addEventListener('input', renderCalendar); el.addEventListener('change', renderCalendar); });
  document.getElementById('useTodayReference').addEventListener('click', function () {
    referenceDate.value = isoLocalDate(new Date());
    cyclePosition.value = '';
    renderCalendar();
    status.textContent = 'Data de hoje preenchida. Agora selecione a posição correta do ciclo nessa data.';
  });
  document.getElementById('useTodayFirst').addEventListener('click', function () {
    firstWorkDate.value = isoLocalDate(new Date());
    renderCalendar();
    status.textContent = 'Hoje foi definido como o 1.º dia de trabalho. Confirme que esta é mesmo a posição correta antes de imprimir.';
  });
  document.getElementById('restoreExample').addEventListener('click', function () {
    const today = isoLocalDate(new Date());
    workerName.value = '';
    document.querySelector('input[name="setupMode"][value="cycle"]').checked = true;
    referenceDate.value = today;
    cyclePosition.value = '';
    firstWorkDate.value = today;
    updateMode();
  });
  document.getElementById('printCalendar').addEventListener('click', function () { window.print(); });

  // Fresh page visits start in the same clean state as the "Restaurar" button.
  // The date defaults to today, but no worker or cycle position is preselected.
  const todayAtStart = isoLocalDate(new Date());
  workerName.value = '';
  referenceDate.value = todayAtStart;
  cyclePosition.value = '';
  firstWorkDate.value = todayAtStart;
  renderCalendar();
})();