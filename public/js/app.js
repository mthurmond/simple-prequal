var purchasePriceMask = IMask(document.querySelector('#purchase-price'), {
	mask: Number,
	min: 0,
	max: 9999999999,
	thousandsSeparator: ','
});

var downPaymentMask = IMask(document.querySelector('#down-payment'), {
	mask: Number,
	min: 0,
	max: 9999999999,
	thousandsSeparator: ','
});

var downPaymentPercentMask = IMask(document.querySelector('#down-payment-percent'), {
	mask: Number,
	min: 0,
	max: 100, 
	scale: 0
});

var monthlyIncomeMask = IMask(document.querySelector('#monthly-income'), {
	mask: Number,
	min: 0,
	max: 9999999999,
	thousandsSeparator: ','
});

let otherMonthlyDebtMask = IMask(document.querySelector('#other-monthly-debt'), {
	mask: Number,
	min: 0,
	max: 9999999999,
	thousandsSeparator: ','
});

let totalAssetsMask = IMask(document.querySelector('#total-assets'), {
	mask: Number,
	min: 0,
	max: 9999999999,
	thousandsSeparator: ','
});

let creditScoreMask = IMask(document.querySelector('#credit-score'), {
	mask: Number,
	min: 0,
	max: 850,
});

const minLoan = 50000; 
const minDown = 0.03;

let purchaseInput = document.getElementById('purchase-price');
let dpInput = document.getElementById('down-payment');
let dpPercentInput = document.getElementById('down-payment-percent');
let otherMonthlyDebtInput = document.getElementById('other-monthly-debt');
let totalMonthlyIncomeInput = document.getElementById('monthly-income');
let totalAssetsInput = document.getElementById('total-assets');
let creditScoreInput = document.getElementById('credit-score');

(function () {
	'use strict';
	
	// PURCHASE PRICE
	purchaseInput.addEventListener('blur', function (event) {
		// reset
		purchaseInput.classList.remove('is-invalid')
		purchaseInput.classList.remove('is-valid')

		const purchasePrice = parseInt(purchasePriceMask.unmaskedValue);
		const min = parseInt(event.target.min); 
		const max = parseInt(event.target.max); 

		if (!purchasePrice) { return }

		if (purchasePrice < min || purchasePrice > max) {
			purchaseInput.classList.add('is-invalid');
		} else {
			purchaseInput.classList.add('is-valid');
		}

		var event = new Event('blur');
		dpInput.dispatchEvent(event);
		
		calculateDownPaymentPercent(); 
		calculateLoanAmount(); 
		calculateMonthlyLoanPayment(); 
		calculateRequiredAssets(); 
	});

	// DOWN PAYMENT
	dpInput.addEventListener('blur', function (event) {
		// reset
		dpInput.classList.remove('is-invalid')
		dpInput.classList.remove('is-valid')
		
		const purchasePrice = parseInt(purchasePriceMask.unmaskedValue);
		const downPayment = parseInt(downPaymentMask.unmaskedValue);
		const loanAmount = purchasePrice - downPayment; 

		if (!purchasePrice || !downPayment) { return }

		if (downPayment < (minDown * purchasePrice) || loanAmount < minLoan) {
			dpInput.classList.add('is-invalid');
		} else {
			dpInput.classList.add('is-valid');
		}
		calculateDownPaymentPercent(); 
		calculateLoanAmount(); 
		calculateMonthlyLoanPayment(); 
		calculateRequiredAssets(); 
	});

	// DP PERCENT 
	dpPercentInput.addEventListener('blur', function (event) {
		// reset
		dpPercentInput.classList.remove('is-invalid')
		dpPercentInput.classList.remove('is-valid')

		const purchasePrice = parseInt(purchasePriceMask.unmaskedValue);
		const downPaymentPercent = parseInt(dpPercentInput.value) / 100; 
		console.log(downPaymentPercent);
		const newDownPayment = Math.round(purchasePrice * downPaymentPercent); 
		
		if (!purchasePrice) { 
			document.getElementById('down-payment-percent').value = '0';
		} else {
			document.getElementById('down-payment').value = newDownPayment.toString();
		}

		var event = new Event('blur');
		dpInput.dispatchEvent(event);
		
		calculateLoanAmount(); 
		calculateMonthlyLoanPayment(); 
	});

	// OTHER MONTHLY DEBT
	otherMonthlyDebtInput.addEventListener('blur', function (event) {	
		calculateTotalMonthlyDebt();
	});

	// TOTAL MONTHLY INCOME
	totalMonthlyIncomeInput.addEventListener('blur', function (event) {	
		calculateDti();
	});

	// TOTAL ASSETS
	totalAssetsInput.addEventListener('blur', function (event) {	
		prequalCheck();
	});

	// CREDIT SCORE
	creditScoreInput.addEventListener('blur', function (event) {	
		prequalCheck();
	});

})();

function calculateLoanAmount() {
	const downPayment = parseInt(downPaymentMask.unmaskedValue);
	const purchasePrice = parseInt(purchasePriceMask.unmaskedValue);
	const loanAmount = purchasePrice - downPayment; 

	// reference: https://stackoverflow.com/questions/2254185/regular-expression-for-formatting-numbers-in-javascript
	const formattedLoanAmount = loanAmount.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );

	if (loanAmount > 0) {
		document.getElementById('loan-amount').innerHTML = `$${formattedLoanAmount}`;
	} else {
		document.getElementById('loan-amount').innerHTML = '';
	}
		
}

function calculateDownPaymentPercent() {
	const purchasePrice = parseInt(purchasePriceMask.unmaskedValue);
	const downPayment = parseInt(downPaymentMask.unmaskedValue);
	const downPaymentPercent = Math.round((downPayment / purchasePrice) * 100); 
	console.log(downPaymentPercent); 

	if (!purchasePrice || !downPayment || downPaymentPercent > 100) { 
		document.getElementById('down-payment-percent').value = '0';
	} else {
		document.getElementById('down-payment-percent').value = downPaymentPercent.toString();
	}

}

let monthlyLoanPaymentCalc = 0; 

function calculateMonthlyLoanPayment() {
	const downPayment = parseInt(downPaymentMask.unmaskedValue);
	const purchasePrice = parseInt(purchasePriceMask.unmaskedValue);
	const loanAmount = purchasePrice - downPayment; 
	monthlyLoanPaymentCalc = Math.round(-pmt(0.05/12, 360, loanAmount));

	// reference: https://stackoverflow.com/questions/2254185/regular-expression-for-formatting-numbers-in-javascript
	const formattedMonthlyLoanPayment = monthlyLoanPaymentCalc.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );

	if (monthlyLoanPaymentCalc > 0) {
		document.getElementById('monthly-payment').innerHTML = `$${formattedMonthlyLoanPayment}`;
	} else {
		document.getElementById('monthly-payment').innerHTML = '';
	}

	calculateTotalMonthlyDebt(); 
		
}

let totalMonthlyDebt; 

function calculateTotalMonthlyDebt() {
	const otherMonthlyDebt = parseInt(otherMonthlyDebtMask.unmaskedValue);
	totalMonthlyDebt = Math.round(otherMonthlyDebt + monthlyLoanPaymentCalc); 

	// reference: https://stackoverflow.com/questions/2254185/regular-expression-for-formatting-numbers-in-javascript
	const formattedTotalMonthlyDebt = totalMonthlyDebt.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );

	if (totalMonthlyDebt > 0) {
		document.getElementById('total-monthly-debt').innerHTML = `$${formattedTotalMonthlyDebt}`;
	} else {
		document.getElementById('total-monthly-debt').innerHTML = '';
	}

	calculateDti(); 
		
}

let dti; 

function calculateDti() {
	const totalMonthlyIncome = parseInt(monthlyIncomeMask.unmaskedValue);
	dti = Math.round(((totalMonthlyDebt / totalMonthlyIncome) * 100)); 

	// reference: https://stackoverflow.com/questions/2254185/regular-expression-for-formatting-numbers-in-javascript
	const formattedDti = `${dti.toString()}%`;

	if (dti > 0) {
		document.getElementById('dti').innerHTML = `${formattedDti}`;
	} else {
		document.getElementById('dti').innerHTML = '';
	}	
	prequalCheck(); 
}

let requiredAssetsCalc = 0; 

function calculateRequiredAssets() {
	const downPayment = parseInt(downPaymentMask.unmaskedValue);
	const purchasePrice = parseInt(purchasePriceMask.unmaskedValue);
	requiredAssetsCalc = Math.round(downPayment + (purchasePrice * 0.03));

	// reference: https://stackoverflow.com/questions/2254185/regular-expression-for-formatting-numbers-in-javascript
	const formattedRequiredAssets = requiredAssetsCalc.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );

	if (requiredAssetsCalc > 0) {
		document.getElementById('required-assets').innerHTML = `$${formattedRequiredAssets}`;
	} else {
		document.getElementById('required-assets').innerHTML = '';
	}
		
}

const minFico = 600; 
const maxDti = 43;

function prequalCheck() {
	const assets = parseInt(totalAssetsMask.unmaskedValue);
	const creditScore = parseInt(creditScoreMask.unmaskedValue); 
	
	const dtiQualified = (dti <= maxDti) ? true:false; 
	console.log('max dti' + maxDti + ' dti ' + dti); 
	console.log(dtiQualified); 	

	const creditQualified = (creditScore >= minFico) ? true:false; 
	console.log(creditQualified);

	const assetsQualified = (assets >= requiredAssetsCalc) ? true:false; 
	console.log(assetsQualified);

	// const prequalStatus = 
	let dtiMessage = (dtiQualified) ? 'DTI qualifies':'DTI is too high'; 
	let creditMessage = (creditQualified) ? 'Credit qualifies':'Credit is too low';
	let assetsMessage = (assetsQualified) ? 'Assets qualify':'Assets are too low'; 

	const prequalifiedDecision = (dtiQualified && creditQualified && assetsQualified) ? 'Congratulations, you are pre-qualified!':'Unfotunately, you are not pre-qualified at this time.'; 

	document.getElementById('prequal-check').innerHTML = prequalifiedDecision;
	document.getElementById('prequal-details').innerHTML = `${dtiMessage}, ${creditMessage}, ${assetsMessage}.`;

}  










// TRIX JS FOR LOADING IMAGES - DELETE LATER
(function () {
	var HOST = "https://d13txem1unpe48.cloudfront.net/"

	addEventListener("trix-attachment-add", function (event) {
		if (event.attachment.file) {
			uploadFileAttachment(event.attachment)
		}
	})

	function uploadFileAttachment(attachment) {
		uploadFile(attachment.file, setProgress, setAttributes)

		function setProgress(progress) {
			attachment.setUploadProgress(progress)
		}

		function setAttributes(attributes) {
			attachment.setAttributes(attributes)
		}
	}

	function uploadFile(file, progressCallback, successCallback) {
		var key = createStorageKey(file)
		var formData = createFormData(key, file)
		var xhr = new XMLHttpRequest()

		xhr.open("POST", HOST, true)

		xhr.upload.addEventListener("progress", function (event) {
			var progress = event.loaded / event.total * 100
			progressCallback(progress)
		})

		xhr.addEventListener("load", function (event) {
			if (xhr.status == 204) {
				var attributes = {
					url: HOST + key,
					href: HOST + key + "?content-disposition=attachment"
				}
				successCallback(attributes)
			}
		})

		xhr.send(formData)
	}

	function createStorageKey(file) {
		var date = new Date()
		var day = date.toISOString().slice(0, 10)
		var name = date.getTime() + "-" + file.name
		return ["tmp", day, name].join("/")
	}

	function createFormData(key, file) {
		var data = new FormData()
		data.append("key", key)
		data.append("Content-Type", file.type)
		data.append("file", file)
		return data
	}
})();