import { readFileSync, appendFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TOTOLOTO_PATH     = join(__dirname, '../../totoloto.jsonl');
const EUROMILLIONS_PATH = join(__dirname, '../../euromillions.jsonl');
const EURODREAMS_PATH   = join(__dirname, '../../eurodreams.jsonl');

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' },
    signal: AbortSignal.timeout(10000),
  });
  const buf = await res.arrayBuffer();
  return new TextDecoder('iso-8859-1').decode(buf);
}

async function fetchTotoloto() {
  const html = await fetchHtml('https://www.jogossantacasa.pt/web/ResultsBoard/totoloto');

  const drawMatch    = html.match(/Sorteio:\s*(\S+)/);
  const dateMatch    = html.match(/Data do Sorteio\s*-\s*(\d{2})\/(\d{2})\/(\d{4})/);
  const numbersMatch = html.match(/class="colums">\s*<li>([\d\s]+)\+\s*(\d+)\s*<\/li>/);

  if (!drawMatch || !dateMatch || !numbersMatch) {
    throw new Error('Could not parse Totoloto draw data');
  }

  const numbers = numbersMatch[1].trim().split(/\s+/).map(Number).sort((a, b) => a - b);
  const lucky   = parseInt(numbersMatch[2]);
  const date    = dateMatch[3] + '-' + dateMatch[2] + '-' + dateMatch[1];

  return { draw: drawMatch[1], date, numbers, lucky };
}

async function fetchEuromillions() {
  const html = await fetchHtml('https://www.jogossantacasa.pt/web/ResultsBoard/euromilhoes');

  const drawMatch    = html.match(/Sorteio:\s*(\S+)/);
  const dateMatch    = html.match(/Data do Sorteio\s*-\s*(\d{2})\/(\d{2})\/(\d{4})/);
  const numbersMatch = html.match(/class="colums">\s*<li>([\d\s]+)\+\s*([\d\s]+)<\/li>/);

  if (!drawMatch || !dateMatch || !numbersMatch) {
    throw new Error('Could not parse Euromillions draw data');
  }

  const numbers = numbersMatch[1].trim().split(/\s+/).map(Number).sort((a, b) => a - b);
  const stars   = numbersMatch[2].trim().split(/\s+/).map(Number).sort((a, b) => a - b);
  const date    = dateMatch[3] + '-' + dateMatch[2] + '-' + dateMatch[1];

  return { draw: drawMatch[1], date, numbers, stars };
}

async function fetchEurodreams() {
  const html = await fetchHtml('https://www.jogossantacasa.pt/web/ResultsBoard/EuroDreams');

  const drawMatch    = html.match(/Sorteio:\s*(\S+)/);
  const dateMatch    = html.match(/Data do Sorteio\s*-\s*(\d{2})\/(\d{2})\/(\d{4})/);
  const numbersMatch = html.match(/class="colums">\s*<li>([\d\s]+)\+\s*(\d+)\s*<\/li>/);

  if (!drawMatch || !dateMatch || !numbersMatch) {
    throw new Error('Could not parse Eurodreams draw data');
  }

  const numbers = numbersMatch[1].trim().split(/\s+/).map(Number).sort((a, b) => a - b);
  const dream   = numbersMatch[2].trim();
  const date    = dateMatch[3] + '-' + dateMatch[2] + '-' + dateMatch[1];

  return { draw: drawMatch[1], date, numbers, dream };
}

function updateArchive(archivePath, latest, label) {
  const lines = readFileSync(archivePath, 'utf8').trim().split('\n');
  if (lines.some(l => JSON.parse(l).draw === latest.draw)) {
    console.log(`${label} ${latest.draw} already in archive — nothing to update.`);
    return;
  }
  appendFileSync(archivePath, JSON.stringify(latest) + '\n');
  const tail = latest.stars ? latest.stars.join(' ') : (latest.dream ?? latest.lucky);
  console.log(`Added ${label} ${latest.draw} (${latest.date}): ${latest.numbers.join(' ')} + ${tail}`);
}

updateArchive(TOTOLOTO_PATH,     await fetchTotoloto(),     'Totoloto');
updateArchive(EUROMILLIONS_PATH, await fetchEuromillions(), 'Euromillions');
updateArchive(EURODREAMS_PATH,   await fetchEurodreams(),   'Eurodreams');