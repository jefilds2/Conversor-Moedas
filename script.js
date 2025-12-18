const convertBtn = document.querySelector('#converter-btn');
const moedaPara = document.querySelector('#moeda-para');
const imgDe = document.querySelector(".moeda-de");
const imgPara = document.querySelector(".moeda-para");
const currencyName = document.querySelector(".currency-name");
const moedaDe = document.querySelector('#moeda-de');
const currencyNameDe = document.querySelector(".currency");

let dolarToday = 5.2;        // 1 USD = 5.2 BRL
let euroToday = 6.2;        // 1 EUR = 6.2 BRL
let arsToday = 0.0038;     // 1 ARS = 0.0038 BRL (confirme se é isso)
let btcToday = 475553.69;  // 1 BTC = 475553.69 BRL

async function atualizarCotacoes(timeoutSeconds = 3) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeoutSeconds * 1000);

    try {
        const url = "https://api.frankfurter.dev/v1/latest?base=USD&symbols=BRL,EUR";
        const resp = await fetch(url, { signal: controller.signal });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const data = await resp.json();

        const usdBrl = Number(data.rates.BRL); // 1 USD em BRL
        const usdEur = Number(data.rates.EUR); // 1 USD em EUR

        if (!Number.isFinite(usdBrl) || !Number.isFinite(usdEur) || usdEur === 0) {
            throw new Error("Resposta inválida de cotação");
        }

        dolarToday = usdBrl;
        euroToday = usdBrl / usdEur; // 1 EUR em BRL (cruzamento)
    } catch (err) {
        console.warn("Sem cotação online (usando valores pré-salvos):", err);
    } finally {
        clearTimeout(timerId);
    }
}

function getRatesToBRL() {
    return {
        BRL: 1,
        USD: dolarToday,
        EUR: euroToday,
        ARS: arsToday,
        BTC: btcToday
    };
}

function converterMoeda(valor, from, to, ratesToBRL) {
  // 1) transforma valor de "from" para BRL
  const valorEmBRL = valor * ratesToBRL[from];

  // 2) transforma de BRL para "to"
  const valorConvertido = valorEmBRL / ratesToBRL[to];

  return valorConvertido;
}

function formatarValor(valor, moeda) {
  if (moeda === "BTC") {
    return valor.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }) + " BTC";
  }

  const localePorMoeda = {
    BRL: "pt-BR",
    USD: "en-US",
    EUR: "de-DE",
    ARS: "es-AR"
  };

  const locale = localePorMoeda[moeda] || "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: moeda
  }).format(valor);
}

function atualizarMoedaUI(moeda, imgEl, nameEl) {
  const meta = {
    BRL: { src: "./assets/img/brasil.png", alt: "Real", name: "Real Brasileiro (BRL)" },
    USD: { src: "./assets/img/usa.png",    alt: "Dólar", name: "Dólar Americano (USD)" },
    EUR: { src: "./assets/img/euro.png",   alt: "Euro",  name: "Euro (EUR)" },
    ARS: { src: "./assets/img/arg.png",    alt: "Peso",  name: "Peso Argentino (ARS)" },
    BTC: { src: "./assets/img/btc.png",    alt: "Bitcoin", name: "Bitcoin (BTC)" }
  };

  imgEl.src = meta[moeda].src;
  imgEl.alt = meta[moeda].alt;

  if (nameEl) {
    nameEl.textContent = meta[moeda].name;
  }
}

async function convertValues() {
  await atualizarCotacoes();

  const valueInput = document.querySelector('#valor').value;
  const valor = Number(valueInput.replace(',', '.'));

  const valueToConvert = document.querySelector('.currency-value-to-convert');
  const convertedValue = document.querySelector('.currency-value-converted');

  const from = moedaDe.value;
  const to = moedaPara.value;

  const rates = getRatesToBRL();

  const resultado = converterMoeda(valor, from, to, rates);

  // lado esquerdo (origem)
  valueToConvert.innerHTML = formatarValor(valor, from);

  // lado direito (destino)
  convertedValue.innerHTML = formatarValor(resultado, to);
}



moedaPara.addEventListener("change", () => {
  atualizarMoedaUI(moedaPara.value, imgPara, currencyName); // imagem + nome do destino
  convertValues();
});

moedaDe.addEventListener("change", () => {
  atualizarMoedaUI(moedaDe.value, imgDe, currencyNameDe); // só a imagem da origem
  convertValues();
});

convertBtn.addEventListener("click", convertValues,);



