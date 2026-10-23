# 🌯 Bułka & Spółka Kraft Food (Kebab Tychy) – Platforma Zamówień Online

Profesjonalny, nowoczesny sklep internetowy i platforma zamówień online stworzona w oparciu o menu, branding i identyfikację wizualną lokalu **Bułka & Spółka – Kebab Tychy** (100% kraftowe mięso w płatach).

---

## 🚀 Kluczowe Funkcjonalności

1. **Wizualna tożsamość lokalu:**
   - Ciemna kolorystyka z neonowym akcentem (fiolet, neonowy róż, błękit cyjan, złoto), inspirowana oryginalnymi grafikami menu.
   - Wbudowane logo lokalu i autentyczne zdjęcia pozycji menu.

2. **Zaawansowany Konfigurator Produktu:**
   - **Wybór mięsa:** 🐔 Kurczak, 🐷 Wieprzowina, 🐮 Wołowina, 🌓 Mięso Mieszane (automatyczne wyliczanie średniej ceny wg menu).
   - **Rozmiary:** Mały, Średni, Duży, Mega.
   - **Pieczywo:** Kraftowa bułka (z lokalnej piekarni), Chlebek arabski, Lawasz, Talerz, Kubełek.
   - **Darmowe autorskie sosy:** Czosnkowy, Jogurtowy, Ostry, Mieszany, Ketchup Fanex.
   - **Darmowa posypka / przyprawy:** Płatki chili 🌶️, Cayenne 🌶️🌶️, Bazylia, Oregano, Pietruszka, Papryka słodka.
   - **Dodatki standardowe (+2/4/8 zł):** Ser żółty, feta, cheddar, bekon, oliwki, jalapeño, prażona cebulka, frytki w środku, pieczarki zasmażane z cebulką.
   - **Dodatki Premium (+3/5/9 zł):** Onion rings, placki ziemniaczane, mozzarella sticks, cheddar bites, camembert bites.
   - **Dodatkowe mięso:** +50g / +100g dla każdego rodzaju mięsa.

3. **Koszyk i Kasa:**
   - Pływający koszyk boczny (Drawer) z dynamicznym przeliczaniem kwot.
   - Wybór: **Dostawa** (z automatycznym uwzględnieniem darmowej dostawy od 70 zł) lub **Odbiór osobisty w lokalu**.
   - Walidacja danych klienta, numeru telefonu i adresu.

4. **Pełna Integracja z Bramką Płatności AutoPay:**
   - Wyliczanie skrótów kryptograficznych **HMAC-SHA256** dla integralności transakcji.
   - Gotowy endpoint tworzenia sesji płatności (`/api/orders/create`).
   - Gotowy webhook powiadomień zwrotnych ITN (`/api/autopay/webhook`) z weryfikacją sumy kontrolnej.
   - Wbudowany symulator testowy do natychmiastowego sprawdzania całego procesu zakupu (BLIK / Przelew) bez konieczności oczekiwania na aktywację umowy produkcyjnej.

---

## 🛠️ Uruchomienie

Wymagany jest zainstalowany **Node.js** (v18+).

1. Przejdź do katalogu projektu:
   ```bash
   cd C:\Users\Wasser\.gemini\antigravity\scratch\bulka-spolka-kebab
   ```

2. Uruchom serwer:
   ```bash
   node server.js
   ```

3. Otwórz w przeglądarce:
   👉 **http://localhost:3000**

---

## 💳 Konfiguracja Produkcyjna AutoPay

Aby podpiąć produkcyjne konto AutoPay (dawniej Blue Media), ustaw zmienne środowiskowe:
- `AUTOPAY_SERVICE_ID` - ID Twojego punktu płatności z panelu AutoPay
- `AUTOPAY_HASH_KEY` - Twój unikalny klucz skrótu (hash key)
- `AUTOPAY_ENV` - `production`
- `PORT` - np. `3000` lub `80`
