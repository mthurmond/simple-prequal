const validClass = 'is-valid'
const invalidClass = 'is-invalid'
const minPurchasePrice = 100_000
const maxPurchasePrice = 4_000_000
const minLoan = 50_000
const minDown = 0.03

class PrequalValue {
  constructor(elementId, mask, validation = 0, formula = 0) {
    this.element = document.getElementById(`${elementId}`),
    this.mask = IMask(this.element, mask),
    this.validation = validation,
    this.formula = formula
  }
  getInputValue() {
    return parseInt(this.mask.unmaskedValue)
  }
  updateInputValue() {
    const n = (this.formula() >= 0) ? this.formula() : 0
    this.mask.value = String(n)
  }
  checkValidation() {
    this.element.classList.remove(validClass, invalidClass)
    this.element.classList.add((this.validation()) ? validClass : invalidClass)
  }
}

// create mask types
const maskType = {
  number: {
    mask: Number,
    min: 0,
    max: 9_999_999_999,
    thousandsSeparator: ','
  }
};

const formula = {
  loanAmount: () => { 
    return (purchasePrice.getInputValue() - downPayment.getInputValue())
  }
}

const validation = {
  purchasePrice: () => {
    return (
      purchasePrice.getInputValue() >= minPurchasePrice &&
      purchasePrice.getInputValue() <= maxPurchasePrice
    )  
  },
  downPayment: () => {
    return (
      downPayment.getInputValue() >= (minDown * purchasePrice.getInputValue()) &&
      loanAmount.getInputValue() >= minLoan &&
      purchasePrice.getInputValue() !== null
    ) 
  }
} 

const purchasePrice = new PrequalValue('purchase-price', maskType.number, validation.purchasePrice)
const downPayment = new PrequalValue('down-payment', maskType.number, validation.downPayment)
const loanAmount = new PrequalValue('loan-amount', maskType.number, 0, formula.loanAmount)

// update values and validation based on user inputs
const prequalForm = document.getElementById('prequal')
prequalForm.addEventListener('focusout', function () {
  // update calculated variables
  loanAmount.updateInputValue()
  purchasePrice.checkValidation()
  downPayment.checkValidation()
})