import { pmt } from './finance.js'; 

// ASSIGN CONSTANTS
// for validation
const minPurchasePrice = 100000;
const maxPurchasePrice = 4000000;
const minLoan = 50000; 
const minDown = 0.03;
const minPossibleFico = 300;
const maxPossibleFico = 850; 

// for prequal decision
const minFico = 600; 
const maxDti = 43;

// declare global variables used in fuctions
let inputValue; 

// CREATE POINTERS TO ELEMENTS
const inputElement = {
	purchasePrice: document.getElementById('purchase-price'),
	dp: document.getElementById('down-payment'),
	dpPercent: document.getElementById('dp-percent'),
	otherMonthlyDebt: document.getElementById('other-monthly-debt'),
	totalMonthlyIncome: document.getElementById('monthly-income'),
	totalAssets: document.getElementById('total-assets'),
	creditScore: document.getElementById('credit-score') 
}

const calculatedElement = {
	loanAmount: document.getElementById('loan-amount'),
	monthlyLoanPayment: document.getElementById('monthly-loan-payment'),
	totalMonthlyDebt: document.getElementById('total-monthly-debt'),
	dti: document.getElementById('dti'),	
	requiredAssets: document.getElementById('required-assets'), 
	dtiQualified: document.getElementById('dti-qualified'),
	creditQualified: document.getElementById('credit-qualified'),
	assetQualified: document.getElementById('asset-qualified'),
	prequalified: document.getElementById('prequalified') 	
}

const hiddenInput = {
	loanAmount: document.getElementById('loan-amount-hidden'),
	monthlyLoanPayment: document.getElementById('monthly-loan-payment-hidden'),
	totalMonthlyDebt: document.getElementById('total-monthly-debt-hidden'),
	dti: document.getElementById('dti-hidden'),	
	requiredAssets: document.getElementById('required-assets-hidden'),
	dtiQualified: document.getElementById('dti-qualified-hidden'),
	creditQualified: document.getElementById('credit-qualified-hidden'),
	assetQualified: document.getElementById('asset-qualified-hidden'),
	prequalified: document.getElementById('prequalified-hidden')
}

const prequalForm = document.getElementById('prequal');

// ADD MASKS TO ELEMENTS --> 

// create mask types
const maskType = {
	number: {
		mask: Number,
		min: 0,
		max: 9999999999,
		thousandsSeparator: ','
	}, 
	percent: {
		mask: Number,
		min: 0,
		max: 100, 
		scale: 0
	}, 
	credit: {
		mask: Number,
		min: 0,
		max: 999
	}
};

// add masks
const inputMask = {
	purchasePrice: IMask(inputElement.purchasePrice, maskType.number),
	dp: IMask(inputElement.dp, maskType.number),
	dpPercent: IMask(inputElement.dpPercent, maskType.percent),
	otherMonthlyDebt: IMask(inputElement.otherMonthlyDebt, maskType.number),
	totalMonthlyIncome: IMask(inputElement.totalMonthlyIncome, maskType.number),
	totalAssets: IMask(inputElement.totalAssets, maskType.number),
	creditScore: IMask(inputElement.creditScore, maskType.credit)
}

// FUNCTIONS --> 

// update calculated elements and prequal status if input elements change
prequalForm.addEventListener('focusout', function (event) {	
	getUserInputs();
	updateCalculatedVariables(event);
	checkPrequalStatus(dti, requiredAssets);
	checkValidation();
});

// get latest user input values
function getUserInputs() {
	inputValue = {
		purchasePrice: parseInt(inputMask.purchasePrice.unmaskedValue),
		dp: parseInt(inputMask.dp.unmaskedValue),
		dpPercent: parseInt(inputMask.dpPercent.unmaskedValue),
		otherMonthlyDebt: parseInt(inputMask.otherMonthlyDebt.unmaskedValue),
		totalMonthlyIncome: parseInt(inputMask.totalMonthlyIncome.unmaskedValue),
		totalAssets: parseInt(inputMask.totalAssets.unmaskedValue),
		creditScore: parseInt(inputMask.creditScore.unmaskedValue) 
	}
}

// declare calculated variables so they persist and can be used by other fuctions
// will save these to database later
let loanAmount, dpPercent, monthlyLoanPayment, totalMonthlyDebt, dti, requiredAssets; 

function updateCalculatedVariables(event) {
	// recalculate calculated elements 
	// if user updated dp percent, set dp % to new value and update dp. if not, use formula.
	if (event.target == inputElement.dpPercent) {
		dpPercent = inputValue.dpPercent; 
		inputElement.dpPercent.value = dpPercent; 
		updateDownPayment(); 
	} else {
		dpPercent = Math.round((inputValue.dp / inputValue.purchasePrice) * 100); 	
	}
	loanAmount = inputValue.purchasePrice - inputValue.dp; 
	monthlyLoanPayment = Math.round(-pmt(0.05/12, 360, loanAmount));
	totalMonthlyDebt = Math.round(inputValue.otherMonthlyDebt + monthlyLoanPayment); 
	dti = Math.round(((totalMonthlyDebt / inputValue.totalMonthlyIncome) * 100)); 
	requiredAssets = Math.round(inputValue.dp + (inputValue.purchasePrice * 0.03));

	updateElementValue(loanAmount, calculatedElement.loanAmount, hiddenInput.loanAmount); 
	updateElementValue(monthlyLoanPayment, calculatedElement.monthlyLoanPayment, hiddenInput.monthlyLoanPayment); 
	updateElementValue(totalMonthlyDebt, calculatedElement.totalMonthlyDebt, hiddenInput.totalMonthlyDebt);
	updateElementValue(requiredAssets, calculatedElement.requiredAssets, hiddenInput.requiredAssets); 

	// write dp percent using custom rules
	if (!inputValue.purchasePrice || !inputValue.dp || dpPercent > 100) { 
		inputElement.dpPercent.value = '0';
	} else {
		inputElement.dpPercent.value = dpPercent.toString();
	}

	// write dti using custom rules
	const formattedDti = `${dti.toString()}%`;
	if (dti > 0) {
		calculatedElement.dti.innerHTML = `${formattedDti}`;
		hiddenInput.dti.value = formattedDti; 
	} else {
		calculatedElement.dti.innerHTML = '';
		hiddenInput.dti.value = '';
	}	
};

// update down payment when user enters dp percent value
function updateDownPayment() {
	inputValue.dp = (dpPercent / 100) * inputValue.purchasePrice; 
	inputElement.dp.value = inputValue.dp.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
}

function updateElementValue(value, element, hiddenElement) {
	// reference: https://stackoverflow.com/questions/2254185/regular-expression-for-formatting-numbers-in-javascript
	const formattedValue = value.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
	if (value > 0) {
		element.innerHTML = `$${formattedValue}`;
		hiddenElement.value = formattedValue; 
	} else {
		element.innerHTML = '';
		hiddenElement.value = ''; 
	}
}

const validClass = 'is-valid'
const invalidClass = 'is-invalid'

function checkValidation() {
	// pass this info in as an argument later
	let inputs = [
		{
			element: inputElement.purchasePrice,
			isValid:
				(inputValue.purchasePrice >= minPurchasePrice &&
				inputValue.purchasePrice <= maxPurchasePrice)
		},
		{
			element: inputElement.dp,
			isValid: 
				(inputValue.dp >= (minDown * inputValue.purchasePrice) &&
				loanAmount >= minLoan &&
				inputValue.purchasePrice)
		},
		{
			element: inputElement.creditScore,
			isValid: (inputValue.creditScore >= minPossibleFico 
					&& inputValue.creditScore <= maxPossibleFico)
		},
	]

	inputs.forEach((input) => {
		input.element.classList.remove(validClass, invalidClass)
		input.element.classList.add((input.isValid) ? validClass : invalidClass) 
	})
}

function checkPrequalStatus(dti, requiredAssets) {
	const dtiQualified = (dti <= maxDti) ? true:false; 
	const creditQualified = (inputValue.creditScore >= minFico) ? true:false; 
	const assetQualified = (inputValue.totalAssets >= requiredAssets) ? true:false; 
	const prequalified = (dtiQualified && creditQualified && assetQualified) ? true:false;

	// add pre-qual decisions to form inputs so they're sent to the db
	hiddenInput.dtiQualified.value = dtiQualified;
	hiddenInput.creditQualified.value = creditQualified;
	hiddenInput.assetQualified.value = assetQualified;
	hiddenInput.prequalified.value = prequalified;
	// give user real-time feedback
	calculatedElement.dtiQualified.innerHTML = `DTI qualified: ${dtiQualified}`;
	calculatedElement.creditQualified.innerHTML = `Credit qualified: ${creditQualified}`;
	calculatedElement.assetQualified.innerHTML = `Asset qualified: ${assetQualified}`;
	calculatedElement.prequalified.innerHTML = `Prequalified: ${prequalified}`;
}