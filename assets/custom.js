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