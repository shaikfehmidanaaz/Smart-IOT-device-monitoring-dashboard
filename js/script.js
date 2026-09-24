const deviceState = {
  'living-room': {
    metric: 23.4,
    label: 'Temperature',
    unit: '°C',
    min: 20,
    max: 28,
    status: 'online'
  },
  thermostat: {
    metric: 48,
    label: 'Humidity',
    unit: '%',
    min: 35,
    max: 60,
    status: 'online'
  },
  camera: {
    metric: 2,
    label: 'Motion Events',
    unit: '',
    min: 0,
    max: 9,
    status: 'warning'
  },
  water: {
    metric: 142,
    label: 'Daily Usage',
    unit: 'L',
    min: 110,
    max: 190,
    status: 'online'
  },
  plug: {
    metric: 184,
    label: 'Power Draw',
    unit: 'W',
    min: 120,
    max: 220,
    status: 'offline'
  }
};

const temperatureSeries = [21.4, 21.8, 22.3, 22.9, 22.6, 23.1, 23.4, 24.2, 23.8, 24.4, 24.6, 25.1];
const energySeries = [410, 470, 520, 490, 560, 610, 590, 650, 620, 690, 660, 710];

function updateDeviceCards() {
  const cards = document.querySelectorAll('.device-card');

  cards.forEach((card) => {
    const key = card.dataset.device;
    const info = deviceState[key];
    if (!info) return;

    const metricEl = card.querySelector('.metric-value');
    const statusEl = card.querySelector('.status-badge');
    const labelEl = card.querySelector('.metric-label');

    if (metricEl) {
      const displayValue = info.unit === '' ? `${Math.round(info.metric)}` : `${info.metric.toFixed(info.unit === '°C' ? 1 : 0)}${info.unit}`;
      metricEl.textContent = displayValue;
    }

    if (statusEl) {
      statusEl.className = `status-badge ${info.status}`;
      statusEl.textContent = info.status === 'online' ? 'Online' : info.status === 'warning' ? 'Warning' : 'Offline';
    }

    if (labelEl) {
      labelEl.textContent = info.label;
    }
  });
}

function randomizeMetrics() {
  Object.keys(deviceState).forEach((key) => {
    const info = deviceState[key];
    const randomDelta = (Math.random() - 0.5) * ((info.max - info.min) * 0.26);
    const candidate = Math.min(info.max, Math.max(info.min, info.metric + randomDelta));
    info.metric = Number(candidate.toFixed(1));

    if (key === 'camera') {
      info.metric = Math.round(info.metric);
    }
  });

  const lastTemp = temperatureSeries[temperatureSeries.length - 1];
  const nextTemp = Number((lastTemp + (Math.random() - 0.4) * 2.2).toFixed(1));
  temperatureSeries.push(Math.min(28, Math.max(19, nextTemp)));
  temperatureSeries.shift();

  const lastEnergy = energySeries[energySeries.length - 1];
  const nextEnergy = Math.min(820, Math.max(350, lastEnergy + Math.round((Math.random() - 0.45) * 110)));
  energySeries.push(nextEnergy);
  energySeries.shift();

  updateDeviceCards();
  renderTemperatureChart();
  renderEnergyChart();
}

function drawGrid(ctx, width, height, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i += 1) {
    const y = (height / 4) * i;
    ctx.beginPath();
    ctx.moveTo(28, y + 20);
    ctx.lineTo(width - 12, y + 20);
    ctx.stroke();
  }
}

function renderTemperatureChart() {
  const canvas = document.getElementById('temperatureChart');
  const ctx = canvas.getContext('2d');
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height, 'rgba(155, 176, 200, 0.15)');

  const min = Math.min(...temperatureSeries) - 1;
  const max = Math.max(...temperatureSeries) + 1;
  const padding = { top: 20, right: 12, bottom: 28, left: 28 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  ctx.beginPath();
  temperatureSeries.forEach((value, index) => {
    const x = padding.left + (index / (temperatureSeries.length - 1)) * innerWidth;
    const y = padding.top + ((max - value) / (max - min || 1)) * innerHeight;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.lineWidth = 3;
  ctx.strokeStyle = '#52d6ff';
  ctx.stroke();

  const gradient = ctx.createLinearGradient(0, padding.top, 0, height);
  gradient.addColorStop(0, 'rgba(82, 214, 255, 0.35)');
  gradient.addColorStop(1, 'rgba(82, 214, 255, 0)');

  ctx.beginPath();
  temperatureSeries.forEach((value, index) => {
    const x = padding.left + (index / (temperatureSeries.length - 1)) * innerWidth;
    const y = padding.top + ((max - value) / (max - min || 1)) * innerHeight;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.fillStyle = '#9bb0c8';
  ctx.font = '12px Inter';
  ctx.fillText('18°', 6, height - 18);
  ctx.fillText('26°', 6, padding.top + 8);
}

function renderEnergyChart() {
  const canvas = document.getElementById('energyChart');
  const ctx = canvas.getContext('2d');
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height, 'rgba(155, 176, 200, 0.12)');

  const padding = { top: 20, right: 12, bottom: 28, left: 28 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...energySeries);
  const minValue = Math.min(...energySeries);

  const barWidth = innerWidth / energySeries.length - 8;

  energySeries.forEach((value, index) => {
    const barHeight = ((value - minValue) / (maxValue - minValue || 1)) * innerHeight;
    const x = padding.left + index * ((innerWidth + 8) / energySeries.length);
    const y = height - padding.bottom - barHeight;

    const gradient = ctx.createLinearGradient(0, y, 0, height - padding.bottom);
    gradient.addColorStop(0, '#52d6ff');
    gradient.addColorStop(1, '#36e3c5');

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);
  });

  ctx.fillStyle = '#9bb0c8';
  ctx.font = '12px Inter';
  ctx.fillText('Mon', 30, height - 8);
  ctx.fillText('Sun', width - 44, height - 8);
}

function attachAlertDismiss() {
  document.querySelectorAll('.close-alert').forEach((button) => {
    button.addEventListener('click', () => {
      button.closest('.alert-item').remove();
    });
  });
}

function initDashboard() {
  updateDeviceCards();
  renderTemperatureChart();
  renderEnergyChart();
  attachAlertDismiss();

  setInterval(randomizeMetrics, 3500);
}

window.addEventListener('load', initDashboard);
window.addEventListener('resize', () => {
  renderTemperatureChart();
  renderEnergyChart();
});
