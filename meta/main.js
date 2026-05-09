import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/DiegoIno1/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        configurable: true,
        writable: true,
        enumerable: false,
      });

      return ret;
    });
}

function renderCommitInfo(data, commits) {
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  const fileLengths = d3.rollups(
    data,
    (v) => d3.max(v, (v) => v.line),
    (d) => d.file,
  );

  const workByPeriod = d3.rollups(
    data,
    (v) => v.length,
    (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' }),
  );
  const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

  let card = dl.append('div').attr('class', 'stat-card');
  card.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  card.append('dd').text(data.length);

  card = dl.append('div').attr('class', 'stat-card');
  card.append('dt').text('Total commits');
  card.append('dd').text(commits.length);

  card = dl.append('div').attr('class', 'stat-card');
  card.append('dt').text('Number of files');
  card.append('dd').text(d3.group(data, (d) => d.file).size);

  card = dl.append('div').attr('class', 'stat-card');
  card.append('dt').text('Max file length');
  card.append('dd').text(d3.max(data, (d) => d.line));

  card = dl.append('div').attr('class', 'stat-card');
  card.append('dt').text('Avg file length');
  card.append('dd').text(Math.round(d3.mean(fileLengths, (d) => d[1])));

  card = dl.append('div').attr('class', 'stat-card');
  card.append('dt').text('Avg line length');
  card.append('dd').text(Math.round(d3.mean(data, (d) => d.length)));

  card = dl.append('div').attr('class', 'stat-card');
  card.append('dt').text('Most active');
  card.append('dd').text(maxPeriod);
}

let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);