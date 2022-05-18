const validClass = 'is-valid'
const invalidClass = 'is-invalid'
const minPurchasePrice = 100_000
const maxPurchasePrice = 4_000_000
const minLoan = 50_000
const minDown = 0.03

class PrequalValue {
  constructor(elementId, mask, formula = 0) {
    this.element = document.getElementById(`${elementId}`),
      this.mask = IMask(this.element, mask),
      this.formula = formula
  }
  getInputValue() {
    return parseInt(this.mask.unmaskedValue)
  }
  updateInputValue() {
    this.mask.value = String(this.formula())
  }
  checkValidation(isValid) {
    this.element.classList.remove(validClass, invalidClass)
    this.element.classList.add((isValid) ? validClass : invalidClass)
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
    return purchasePrice.getInputValue() - downPayment.getInputValue() 
  }
}

const purchasePrice = new PrequalValue('purchase-price', maskType.number)
const downPayment = new PrequalValue('down-payment', maskType.number)
const loanAmount = new PrequalValue('loan-amount', maskType.number, formula.loanAmount)

// update values and validation based on user inputs
const prequalForm = document.getElementById('prequal')
prequalForm.addEventListener('focusout', function () {
  // update calculated variables
  loanAmount.updateInputValue()

  purchasePrice.checkValidation(
    purchasePrice.getInputValue() >= minPurchasePrice &&
    purchasePrice.getInputValue() <= maxPurchasePrice
  )

  downPayment.checkValidation(
    downPayment.getInputValue() >= (minDown * purchasePrice.getInputValue()) &&
    loanAmount.getInputValue() >= minLoan &&
    purchasePrice.getInputValue() !== null
  )
})