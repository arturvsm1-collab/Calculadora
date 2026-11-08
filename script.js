const curElem = document.getElementById('current-operand');
const prevElem = document.getElementById('previous-operand');
const themeBtn = document.getElementById('theme-toggle');
const historyList = document.getElementById('history-list');

let current = '0', previous = '', op = null, resetNext = false, history = [];
const opSymbols = { add: '+', subtract: '-', multiply: '×', divide: '÷' };

function updateDisplay() {
    curElem.textContent = formatNum(current);
    prevElem.textContent = op ? `${formatNum(previous)} ${opSymbols[op]}` : '';
}

function formatNum(str) {
    if (!str || str === '-') return str;
    const [int, dec] = str.split('.');
    if (int.length > 15) return Number(str).toExponential(8);
    const formattedInt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return dec !== undefined ? `${formattedInt},${dec}` : formattedInt;
}

function appendNumber(num) {
    if (current === '0' || resetNext) { current = num; resetNext = false; }
    else {
        if (current.replace('.', '').length >= 15) return;
        current += num;
    }
    updateDisplay();
}

function appendDecimal() {
    if (resetNext) { current = '0.'; resetNext = false; updateDisplay(); return; }
    if (!current.includes('.')) { current += '.'; updateDisplay(); }
}

function chooseOperation(action) {
    if (!current) return;
    if (previous && !resetNext) compute();
    op = action; previous = current; resetNext = true;
    updateDisplay();
}

function compute() {
    const prev = parseFloat(previous.replace(',', '.'));
    const curr = parseFloat(current.replace(',', '.'));
    if (isNaN(prev) || isNaN(curr)) return;

    let res;
    switch (op) {
        case 'add': res = prev + curr; break;
        case 'subtract': res = prev - curr; break;
        case 'multiply': res = prev * curr; break;
        case 'divide':
            if (curr === 0) { alert('Erro: Divisão por zero!'); clearAll(); return; }
            res = prev / curr; break;
        default: return;
    }

    res = parseFloat(res.toFixed(10));
    history.unshift(`${formatNum(previous)} ${opSymbols[op]} ${formatNum(current)} = ${formatNum(res.toString())}`);
    if (history.length > 10) history.pop();
    renderHistory();

    current = res.toString().replace('.', ',');
    op = null; previous = ''; resetNext = true;
    updateDisplay();
}

function clearAll() { current = '0'; previous = ''; op = null; resetNext = false; updateDisplay(); }
function deleteDigit() {
    if (resetNext) return;
    current = (current.length === 1 || (current.length === 2 && current.startsWith('-'))) ? '0' : current.slice(0, -1);
    updateDisplay();
}
function toggleSign() {
    if (current === '0') return;
    current = current.startsWith('-') ? current.slice(1) : '-' + current;
    updateDisplay();
}
function calculatePercent() {
    const curr = parseFloat(current.replace(',', '.'));
    if (isNaN(curr)) return;
    const res = (previous && op) ? (parseFloat(previous.replace(',', '.')) * curr) / 100 : curr / 100;
    current = res.toString().replace('.', ',');
    updateDisplay();
}

function renderHistory() {
    historyList.innerHTML = history.map(item => `<li>${item}</li>`).join('');
}

document.getElementById('clear-history').addEventListener('click', () => { history = []; renderHistory(); });

document.querySelectorAll('.btn.number').forEach(b => b.addEventListener('click', () => {
    b.dataset.decimal ? appendDecimal() : appendNumber(b.dataset.number);
}));

document.querySelectorAll('.btn.operator').forEach(b => b.addEventListener('click', () => chooseOperation(b.dataset.action)));

document.querySelectorAll('.btn.function').forEach(b => {
    const act = b.dataset.action;
    b.addEventListener('click', () => {
        if (act === 'clear') clearAll();
        if (act === 'delete') deleteDigit();
        if (act === 'sign') toggleSign();
        if (act === 'percent') calculatePercent();
    });
});

document.querySelector('.btn.equals').addEventListener('click', () => { if (op && previous) compute(); });

window.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
    else if (e.key === '.' || e.key === ',') appendDecimal();
    else if (e.key === '+') chooseOperation('add');
    else if (e.key === '-') chooseOperation('subtract');
    else if (e.key === '*') chooseOperation('multiply');
    else if (e.key === '/') { e.preventDefault(); chooseOperation('divide'); }
    else if (e.key === 'Enter' || e.key === '=') { if (op && previous) compute(); }
    else if (e.key === 'Backspace') deleteDigit();
    else if (e.key === 'Escape') clearAll();
});

themeBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    themeBtn.querySelector('i').className = newTheme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
});

updateDisplay();