document.addEventListener("DOMContentLoaded", (event) => {
  document.querySelectorAll('.qty-btn').forEach((quantityBtn) => {
    quantityBtn.addEventListener('click',function(e){
      e.preventDefault();
      var get_val = parseInt(quantityBtn.dataset.val);
      if(quantityBtn.classList.contains('qty-dec')){
        get_val = get_val - 1;
        quantityBtn.closest('.product-qty').querySelector('.qty-dec').setAttribute('data-val',get_val);
        quantityBtn.closest('.product-qty').querySelector('.qty-inc').setAttribute('data-val',get_val);
        if(get_val == 1){
          quantityBtn.closest('.product-qty').querySelector('.qty-dec').classList.add('disabled');
        }
      }else{
        get_val = get_val + 1;
        quantityBtn.closest('.product-qty').querySelector('.qty-dec').setAttribute('data-val',get_val);
        quantityBtn.closest('.product-qty').querySelector('.qty-inc').setAttribute('data-val',get_val);
        if(get_val > 1){
          quantityBtn.closest('.product-qty').querySelector('.qty-dec').classList.remove('disabled');
        }
      }
    })
  })
});

(function () {
  const ATTRIBUTE_KEY = '_location_address';
  const INPUT_SELECTOR = '#b2b_address_json';
  const ENDPOINT_PATTERNS = [
    '/cart/add', '/cart/add.js',
    '/cart/update', '/cart/update.js',
    '/cart/change', '/cart/change.js',
    '/cart/clear', '/cart/clear.js'
  ];

  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function urlMatchesCartEndpoint(input) {
    try {
      const urlStr = typeof input === 'string'
        ? input
        : (input instanceof Request ? input.url : String(input));
      const u = new URL(urlStr, location.origin);
      const path = u.pathname;
      return ENDPOINT_PATTERNS.some(p => path.includes(p));
    } catch {
      return false;
    }
  }

  function getAttributeValue() {
    const el = document.querySelector(INPUT_SELECTOR);
    if (el && typeof el.value === 'string' && el.value.length) {
      return el.value;
    }

    return '';
  }

  let isSelfUpdating = false;

  const handleChange = debounce(async function handleCartChange() {
    if (isSelfUpdating) return;

    try {
      const cartRes = await fetch('/cart.js', { credentials: 'same-origin', cache: 'no-store' });
      if (!cartRes.ok) return;
      const cart = await cartRes.json();

      const newValue = getAttributeValue();
      if (newValue === '') {
        return;
      }

      const current = (cart.attributes && cart.attributes[ATTRIBUTE_KEY]) || '';
      if (current === newValue) return;

      isSelfUpdating = true;
      await fetch('/cart/update.js', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attributes: {
            ...(cart.attributes || {}),
            [ATTRIBUTE_KEY]: newValue
          }
        })
      }).catch(console.warn).finally(() => {
        setTimeout(() => { isSelfUpdating = false; }, 150);
      });

    } catch (e) {
      isSelfUpdating = false;
    }
  }, 200);

  const _fetch = window.fetch;
  window.fetch = function (...args) {
    const [input] = args;
    const p = _fetch.apply(this, args);
    if (urlMatchesCartEndpoint(input)) {
      p.finally(handleChange);
    }
    return p;
  };

  const _open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.addEventListener('loadend', function () {
      if (urlMatchesCartEndpoint(url)) handleChange();
    });
    return _open.apply(this, [method, url, ...rest]);
  };

  document.addEventListener('submit', function (evt) {
    try {
      const form = evt.target;
      if (!(form instanceof HTMLFormElement)) return;
      const action = form.getAttribute('action') || '';
      const abs = new URL(action, location.origin).pathname;
      if (ENDPOINT_PATTERNS.some(p => abs.includes(p))) {
        setTimeout(handleChange, 0);
      }
    } catch (_) {}
  }, true);

  window.__triggerCartObserver = handleChange;  // manual debug trigger
  document.addEventListener('visibilitychange', () => { if (!document.hidden) handleChange(); });
  setTimeout(handleChange, 150);
})();
