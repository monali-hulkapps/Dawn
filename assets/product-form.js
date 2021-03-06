class ProductForm extends HTMLElement {
  constructor() {
    super();   

    this.form = this.querySelector('form');
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.cartNotification = document.querySelector('cart-notification');
  }

  onSubmitHandler(evt) {
    evt.preventDefault();
    this.cartNotification.setActiveElement(document.activeElement);
    
    const submitButton = this.querySelector('[type="submit"]');

    submitButton.setAttribute('disabled', true);
    submitButton.classList.add('loading');

    var properties = {};
    this.form.querySelectorAll('input').forEach(element => {
      if(element.getAttribute('name').indexOf('properties[') > -1){
        let propertyTitle = element.getAttribute('name').replace('properties[','').replace(']','');        
         properties[propertyTitle]= element.value;         
      }
    });
    
    const addons = [];
    document.querySelectorAll('.add-ons input:checked').forEach(element => {
      addons.push({
        id: element.value,
        quantity: 1
      });
    });
    console.log('Addons:',addons);
    
    const body = JSON.stringify({
      ...JSON.parse(serializeForm(this.form)),
      properties:properties,
      sections: this.cartNotification.getSectionsToRender().map((section) => section.id),
      sections_url: window.location.pathname
    });

    
    console.log('check body:', body);
    fetch(`${routes.cart_add_url}`, { ...fetchConfig('javascript'), body })
      .then((response) => response.json())
      .then((parsedState) => {      
      document.querySelectorAll('.add-ons input:checked').forEach(element => {
      let formData = {
         'items': [{
          'id': element.value,
          'quantity': 1
          }]
        };

        fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
        .then(response => {
          this.cartNotification.renderContents(parsedState);
          return response.json();          
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      });
      	
      
        this.cartNotification.renderContents(parsedState);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        submitButton.classList.remove('loading');
        submitButton.removeAttribute('disabled');
      });
  }
}

customElements.define('product-form', ProductForm);
