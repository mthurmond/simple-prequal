// assign admin vars
const minLoan = 50000; 
const minDown = 0.03;
const minFico = 600; 
const maxDti = 43;

// update calculated elements if any input elements change
const prequalForm = document.getElementById('prequal');
prequalForm.addEventListener('focusout', function (event) {	
	updateCalculatedElements();
});

function updateCalculatedElements() {
	getInputElementValues();
	
	// recalculate system calculated elements 
	const loanAmount = inputValue.purchasePrice - inputValue.dp; 
	const dpPercent = Math.round((inputValue.dp / inputValue.purchasePrice) * 100); 
	const monthlyLoanPayment = Math.round(-pmt(0.05/12, 360, loanAmount));
	const totalMonthlyDebt = Math.round(inputValue.otherMonthlyDebt + monthlyLoanPayment); 
	const dti = Math.round(((totalMonthlyDebt / inputValue.totalMonthlyIncome) * 100)); 
	const requiredAssets = Math.round(inputValue.dp + (inputValue.purchasePrice * 0.03));

	writeCalculatedElementValue(loanAmount, calculatedElement.loanAmount); 
	writeCalculatedElementValue(monthlyLoanPayment, calculatedElement.monthlyLoanPayment); 
	writeCalculatedElementValue(totalMonthlyDebt, calculatedElement.totalMonthlyDebt);
	writeCalculatedElementValue(requiredAssets, calculatedElement.requiredAssets); 

	// write dp percent using custom rules
	if (!inputValue.purchasePrice || !inputValue.dp || dpPercent > 100) { 
		document.getElementById('dp-percent').value = '0';
	} else {
		document.getElementById('dp-percent').value = dpPercent.toString();
	}

	// write dti using custom rules
	const formattedDti = `${dti.toString()}%`;
	if (dti > 0) {
		document.getElementById('dti').innerHTML = `${formattedDti}`;
	} else {
		document.getElementById('dti').innerHTML = '';
	}	
	prequalCheck(dti, requiredAssets); 
};

function writeCalculatedElementValue(value, element) {
	// reference: https://stackoverflow.com/questions/2254185/regular-expression-for-formatting-numbers-in-javascript
	const formattedValue = value.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
	if (value > 0) {
		element.innerHTML = `$${formattedValue}`;
	} else {
		element.innerHTML = '';
	}
}

const calculatedElement = {
	loanAmount: document.getElementById('loan-amount'),
	dpPercent: document.getElementById('dp-percent'),
	monthlyLoanPayment: document.getElementById('monthly-loan-payment'),
	totalMonthlyDebt: document.getElementById('total-monthly-debt'),
	dti: document.getElementById('dti'),	
	requiredAssets: document.getElementById('required-assets')	
}

// repull latest input values
let inputValue; 
function getInputElementValues() {
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
		max: 850
	}
};

const inputElement = {
	purchasePrice: document.getElementById('purchase-price'),
	dp: document.getElementById('down-payment'),
	dpPercent: document.getElementById('dp-percent'),
	otherMonthlyDebt: document.getElementById('other-monthly-debt'),
	totalMonthlyIncome: document.getElementById('monthly-income'),
	totalAssets: document.getElementById('total-assets'),
	creditScore: document.getElementById('credit-score') 
}

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


function prequalCheck(dti, requiredAssets) {
	const dtiQualified = (dti <= maxDti) ? true:false; 
	const creditQualified = (inputValue.creditScore >= minFico) ? true:false; 
	const assetQualified = (inputValue.totalAssets >= requiredAssets) ? true:false; 

	// const prequalStatus = 
	let dtiMessage = (dtiQualified) ? 'DTI qualifies':'DTI is too high'; 
	let creditMessage = (creditQualified) ? 'Credit qualifies':'Credit is too low';
	let assetsMessage = (assetQualified) ? 'Assets qualify':'Assets are too low'; 

	const prequalifiedDecision = (dtiQualified && creditQualified && assetQualified) ? 'Congratulations, you are pre-qualified!':'Unfotunately, you are not pre-qualified at this time.'; 

	document.getElementById('prequal-check').innerHTML = prequalifiedDecision;
	document.getElementById('prequal-details').innerHTML = `${dtiMessage}, ${creditMessage}, ${assetsMessage}.`;

}  




/**
 * Copy of Excel's PMT function.
 * Credit: https://gist.github.com/maarten00/23400873d51bf2ec4eeb
 *
 * @param rate_per_period       The interest rate for the loan.
 * @param number_of_payments    The total number of payments for the loan in months.
 * @param present_value         The present value, or the total amount that a series of future payments is worth now;
 *                              Also known as the principal.
 * @param future_value          The future value, or a cash balance you want to attain after the last payment is made.
 *                              If fv is omitted, it is assumed to be 0 (zero), that is, the future value of a loan is 0.
 * @param type                  Optional, defaults to 0. The number 0 (zero) or 1 and indicates when payments are due.
 *                              0 = At the end of period
 *                              1 = At the beginning of the period
 * @returns {number}
 */
 function pmt(rate_per_period, number_of_payments, present_value, future_value, type){
    future_value = typeof future_value !== 'undefined' ? future_value : 0;
    type = typeof type !== 'undefined' ? type : 0;

	if(rate_per_period != 0.0){
		// Interest rate exists
		var q = Math.pow(1 + rate_per_period, number_of_payments);
		return -(rate_per_period * (future_value + (q * present_value))) / ((-1 + q) * (1 + rate_per_period * (type)));

	} else if(number_of_payments != 0.0){
		// No interest rate, but number of payments exists
		return -(future_value + present_value) / number_of_payments;
	}

	return 0;
}