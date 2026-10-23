/**
 * Moduł integracji z bramką płatności AutoPay (dawniej Blue Media S.A.)
 * Obsługuje:
 * - Generowanie podpisu kryptograficznego HMAC-SHA256 (hash) transakcji
 * - Przygotowanie danych przekierowania do AutoPay (POST / redirect URL)
 * - Obsługę weryfikacji powiadomienia zwrotnego (ITN - Instant Payment Notification)
 * - Tryb Sandbox / Simulator dla testów lokalnych i wdrożeń produkcyjnych
 */

import crypto from 'crypto';

export class AutoPayService {
  /**
   * @param {Object} config
   * @param {string} config.serviceId - ID serwisu nadane przez AutoPay
   * @param {string} config.hashKey - Klucz współdzielony (hash key) do obliczania sum kontrolnych
   * @param {string} config.environment - 'sandbox' lub 'production'
   * @param {string} config.returnUrl - Adres powrotu klienta po udanej/nieudanej transakcji
   */
  constructor(config = {}) {
    this.serviceId = config.serviceId || process.env.AUTOPAY_SERVICE_ID || '123456';
    this.hashKey = config.hashKey || process.env.AUTOPAY_HASH_KEY || 'test-shared-secret-key-123456';
    this.environment = config.environment || process.env.AUTOPAY_ENV || 'sandbox';
    this.returnUrl = config.returnUrl || 'http://localhost:3000/order-success.html';
    
    this.gatewayUrl = this.environment === 'production'
      ? 'https://gateway.autopay.pl/pay'
      : 'https://sandbox.autopay.eu/pay';
  }

  /**
   * Oblicza podpis SHA-256 dla ciągu wartości rozdzielonych separatorem '|'
   * zgodnie ze specyfikacją integracji AutoPay.
   * Format wejściowy: serviceId|orderID|amount|currency|...|hashKey
   * @param {string[]} values
   * @returns {string} Hex hash sha256
   */
  calculateHash(values) {
    const chain = [...values, this.hashKey].join('|');
    return crypto.createHash('sha256').update(chain, 'utf8').digest('hex');
  }

  /**
   * Przygotowuje formularz i parametry rejestracji transakcji w AutoPay
   * @param {Object} order
   * @param {string} order.orderId - Unikalny identyfikator zamówienia
   * @param {number} order.amount - Kwota w PLN (np. 45.50)
   * @param {string} order.customerEmail - Adres email klienta
   * @param {string} order.description - Opis transakcji widoczny na wyciągu/bramce
   * @param {string} [order.channel] - Kod kanału płatności (np. 'BLIK' lub puste dla wyboru na bramce)
   */
  createTransactionPayload(order) {
    const formattedAmount = Number(order.amount).toFixed(2);
    const currency = 'PLN';
    const orderID = order.orderId;
    const title = order.description || `Zamówienie #${orderID} - Bułka & Spółka`;
    const email = order.customerEmail || '';

    // Standardowe pola skrótu AutoPay
    // serviceID|orderID|amount|currency|returnURL|hashKey
    const hashValues = [
      this.serviceId,
      orderID,
      formattedAmount,
      currency,
      this.returnUrl
    ];

    const hash = this.calculateHash(hashValues);

    return {
      actionUrl: this.gatewayUrl,
      method: 'POST',
      params: {
        ServiceID: this.serviceId,
        OrderID: orderID,
        Amount: formattedAmount,
        Currency: currency,
        Description: title,
        GatewayType: '0', // 0 = standardowa strona wyboru banku/BLIK
        CustomerEmail: email,
        ReturnURL: this.returnUrl,
        Hash: hash,
        Channel: order.channel || undefined // Opcjonalne: BLIK, Karta, etc.
      }
    };
  }

  /**
   * Weryfikuje podpis (Hash) nadesłany w notyfikacji ITN (Instant Transaction Notification) przez AutoPay
   * @param {Object} itnData - Pola przesłane w webhooku POST z AutoPay
   * @returns {boolean} Czy podpis jest poprawny i nienaruszony
   */
  verifyNotification(itnData) {
    const { ServiceID, OrderID, Amount, PaymentStatus, Hash } = itnData;
    if (!Hash) return false;

    // Przykładowy układ weryfikacyjny ITN
    const expectedHash = this.calculateHash([
      ServiceID,
      OrderID,
      Amount,
      PaymentStatus
    ]);

    return expectedHash.toLowerCase() === Hash.toLowerCase();
  }
}
