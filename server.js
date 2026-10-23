import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AutoPayService } from './autopay-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const autoPay = new AutoPayService({
  serviceId: process.env.AUTOPAY_SERVICE_ID || '123456',
  hashKey: process.env.AUTOPAY_HASH_KEY || 'demo-test-secret-key-123',
  environment: 'sandbox',
  returnUrl: `http://localhost:${PORT}/order-success.html`
});

// Prosta pamięć zamówień w RAM (w produkcji baza danych PostgreSQL/MongoDB)
const ordersDb = new Map();

// Stan magazynowy mięsa na rożnach oraz szacowany czas oczekiwania
let liveKebabStatus = {
  meats: {
    chicken: { 
      name: 'Kurczak Kraft', 
      icon: '🐔', 
      percentRemaining: 68, 
      status: 'AVAILABLE' 
    },
    pork: { 
      name: 'Wieprzowina Kraft', 
      icon: '🐷', 
      percentRemaining: 42, 
      status: 'AVAILABLE' 
    },
    beef: { 
      name: 'Wołowina Kraft 100%', 
      icon: '🐮', 
      percentRemaining: 19, 
      status: 'LOW' 
    }
  },
  delivery: {
    estimatedMinutes: '35-45 min',
    pickupMinutes: '15-20 min',
    trafficStatus: 'NORMAL' // 'NORMAL', 'BUSY', 'RUSH_HOUR'
  },
  announcement: 'Dzisiaj w menu świeży wypiek kraftowej bułki z lokalnej piekarni i sosy autorskie!',
  updatedAt: new Date().toISOString()
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.apk': 'application/vnd.android.package-archive',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // Helper do wysyłania odpowiedzi JSON (z nagłówkami CORS)
  const sendJson = (status, data) => {
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
  };

  // Obsługa preflight OPTIONS dla CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // Helper do odbierania body JSON
  const readJsonBody = () => new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });

  // 1. ENDPOINT: Pobranie konfiguracji bramki
  if (req.method === 'GET' && pathname === '/api/config') {
    return sendJson(200, {
      serviceId: autoPay.serviceId,
      environment: autoPay.environment,
      gatewayUrl: autoPay.gatewayUrl,
      isConfigured: autoPay.serviceId !== '123456'
    });
  }

  // 1b. ENDPOINTS: Stan mięsa i czas dostawy (Ticker / Pasek przesuwny)
  if (req.method === 'GET' && pathname === '/api/meat-inventory') {
    return sendJson(200, liveKebabStatus);
  }

  if (req.method === 'POST' && pathname === '/api/meat-inventory') {
    try {
      const data = await readJsonBody();
      liveKebabStatus = {
        ...liveKebabStatus,
        ...data,
        updatedAt: new Date().toISOString()
      };
      return sendJson(200, { success: true, liveKebabStatus });
    } catch (err) {
      return sendJson(500, { error: 'Błąd zapisu stanu mięsa' });
    }
  }

  // 2. ENDPOINT: Składanie zamówienia i inicjacja AutoPay
  if (req.method === 'POST' && pathname === '/api/orders/create') {
    try {
      const orderData = await readJsonBody();
      
      if (!orderData.items || orderData.items.length === 0) {
        return sendJson(400, { error: 'Koszyk nie może być pusty.' });
      }

      const orderId = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const amount = Number(orderData.totalAmount || 0);

      const orderRecord = {
        orderId,
        createdAt: new Date().toISOString(),
        customer: orderData.customer,
        deliveryType: orderData.deliveryType,
        items: orderData.items,
        totalAmount: amount,
        paymentMethod: orderData.paymentMethod || 'autopay',
        status: 'PENDING_PAYMENT'
      };

      ordersDb.set(orderId, orderRecord);

      // Generujemy parametry z podpisem HMAC SHA-256 dla bramki AutoPay
      const paymentPayload = autoPay.createTransactionPayload({
        orderId,
        amount,
        customerEmail: orderData.customer?.email,
        description: `Bułka & Spółka Tychy - Zamówienie #${orderId}`,
        channel: orderData.channel // np. 'BLIK' lub puste dla wyboru na bramce
      });

      return sendJson(200, {
        success: true,
        orderId,
        paymentPayload,
        // URL do symulatora dla celów testowych/prezentacji bez aktywnej umowy produkcyjnej
        simulatorUrl: `/autopay-simulator.html?orderId=${orderId}&amount=${amount.toFixed(2)}`
      });
    } catch (err) {
      console.error('Błąd tworzenia zamówienia:', err);
      return sendJson(500, { error: 'Błąd przetwarzania zamówienia.' });
    }
  }

  // 3. ENDPOINT: Webhook / ITN z AutoPay (powiadomienie o statusie wpłaty)
  if (req.method === 'POST' && pathname === '/api/autopay/webhook') {
    try {
      const itnData = await readJsonBody();
      const isValid = autoPay.verifyNotification(itnData);
      
      console.log(`[AutoPay Webhook] Otrzymano powiadomienie dla #${itnData.OrderID}. Status: ${itnData.PaymentStatus}. Podpis ważny: ${isValid}`);
      
      if (isValid && ordersDb.has(itnData.OrderID)) {
        const order = ordersDb.get(itnData.OrderID);
        order.status = itnData.PaymentStatus === 'SUCCESS' ? 'PAID' : 'FAILED';
        order.paidAt = new Date().toISOString();
        ordersDb.set(itnData.OrderID, order);
      }

      // Odpowiedź wymagana przez specyfikację AutoPay
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end('CONFIRMED');
    } catch (err) {
      console.error('Błąd webhooka AutoPay:', err);
      res.writeHead(400);
      return res.end('ERROR');
    }
  }

  // 4. ENDPOINT: Pobranie wszystkich zamówień (dla panelu pracownika KDS)
  if (req.method === 'GET' && pathname === '/api/orders') {
    const list = Array.from(ordersDb.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sendJson(200, list);
  }

  // 4b. ENDPOINT: Zmiana statusu zamówienia i czasu realizacji przez pracownika (np. PREPARING, READY, COMPLETED, CANCELLED)
  if (req.method === 'PATCH' && pathname.startsWith('/api/orders/') && pathname.endsWith('/status')) {
    const parts = pathname.split('/');
    const orderId = parts[3];
    if (ordersDb.has(orderId)) {
      const { status, estimatedMinutes, cancelReason } = await readJsonBody();
      const order = ordersDb.get(orderId);
      if (status) order.status = status;
      if (estimatedMinutes !== undefined) {
        order.estimatedMinutes = estimatedMinutes;
        const target = new Date();
        target.setMinutes(target.getMinutes() + Number(estimatedMinutes));
        order.estimatedReadyAt = target.toISOString();
      }
      if (cancelReason !== undefined) {
        order.cancelReason = cancelReason;
      }
      order.updatedAt = new Date().toISOString();
      ordersDb.set(orderId, order);
      return sendJson(200, { success: true, order });
    }
    return sendJson(404, { error: 'Nie znaleziono takiego zamówienia.' });
  }

  // 4c. ENDPOINT: Pobranie statusu pojedynczego zamówienia
  if (req.method === 'GET' && pathname.startsWith('/api/orders/')) {
    const orderId = pathname.replace('/api/orders/', '');
    if (ordersDb.has(orderId)) {
      return sendJson(200, ordersDb.get(orderId));
    }
    return sendJson(404, { error: 'Nie znaleziono takiego zamówienia.' });
  }

  // 5. ENDPOINT: Aktualizacja statusu przez symulator (dla celów demonstracyjnych)
  if (req.method === 'POST' && pathname === '/api/orders/simulate-success') {
    const { orderId } = await readJsonBody();
    if (ordersDb.has(orderId)) {
      const order = ordersDb.get(orderId);
      order.status = 'PAID';
      order.paidAt = new Date().toISOString();
      ordersDb.set(orderId, order);
      return sendJson(200, { success: true, order });
    }
    return sendJson(404, { error: 'Nie znaleziono zamówienia.' });
  }

  // 6. OBSŁUGA PLIKÓW STATYCZNYCH (HTML, CSS, JS, ASSETS)
  let safePath = pathname === '/' ? '/index.html' : pathname;
  let filePath = path.join(__dirname, safePath);

  // Bezpieczeństwo directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Zabroniony dostęp');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<h1>404 - Nie znaleziono strony</h1>');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌯 Platforma Bułka & Spółka Kraft Food uruchomiona!`);
  console.log(`🌐 Strona zamówień:  http://localhost:${PORT}`);
  console.log(`💳 Bramka AutoPay:   Tryb ${autoPay.environment.toUpperCase()}`);
  console.log(`=======================================================`);
});
