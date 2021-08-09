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
   
    console.log(properties);
//     console.log(JSON.parse(serializeForm(this.form)));
    
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
