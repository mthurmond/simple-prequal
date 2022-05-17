// define constants
const validClass = 'is-valid'
const invalidClass = 'is-invalid'
const minPurchasePrice = 100_000
const maxPurchasePrice = 4_000_000
const minLoan = 50_000
const minDown = 0.03

// create value class and objects
// possibly remove entryType later if not using
class PrequalValue { 
  constructor(entryType, elementId, mask) { 
    this.entryType = entryType, 
    this.elementId = elementId,
    this.mask = IMask(this.getInputElement(), mask)
  }
  getInputElement() {
    return document.getElementById(`${this.elementId}`)
  }
  getInputValue() {
    return parseInt(this.mask.unmaskedValue)
  }
  updateInputValue(n) {
    this.mask.value = String(n)
  }
  checkValidation(isValid) {
    this.getInputElement().classList.remove(validClass, invalidClass)
    this.getInputElement().classList.add((isValid) ? validClass : invalidClass)
  }
}

// create mask types
const maskType = {
	number: {
		mask: Number,
		min: 0,
		max: 9999999999,
		thousandsSeparator: ','
	}
};

const purchasePrice = new PrequalValue('manual', 'purchase-price', maskType.number)
const downPayment = new PrequalValue('manual', 'down-payment', maskType.number)
const loanAmount = new PrequalValue('calculated', 'loan-amount', maskType.number)

// update values and validation based on user inputs
const prequalForm = document.getElementById('prequal')
prequalForm.addEventListener('focusout', function () {
  // update calculated variables
  loanAmount.updateInputValue(purchasePrice.getInputValue() - downPayment.getInputValue())

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