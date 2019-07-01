const loans = require('../loans.json')
const tokens = require('../tokens.json')
const ETHPrices = require('../eth-price.json')

const tokenMap = mapTokens(tokens);

// Given a date, returns which loans were liquidatable.
function getLiquidatableLoans(givenDate) {
	//declare variables
	const givenDateUTC = new Date(givenDate);

	//calculate price of ether @ given date
	const currPriceOfETH = getCurrentPriceOfETH(givenDateUTC)
	
	//if unable to find price of ether for given date, return null
	if(!currPriceOfETH) {
		return [];
	}

	//otherwise calculate the default loan cut off date, and find the most recently defaulted loan index in loans using binary search
	let oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
	let ninetyDays = oneDay * 90;
	let defaultedLoanCutoffDate = givenDate - ninetyDays;

	let mostRecentDefaultedLoanIndex = findMostRecentDefaultedLoan(defaultedLoanCutoffDate) || loans.length;
	
	//add all defaulted loans, if any, to defaultedLoanIds array
	let defaultedLoanIds = loans.slice(mostRecentDefaultedLoanIndex).map((loan) => {
		return loan.id;
	})

	//grab remaining non-defaulted loans
	let remainingLoans = loans.slice(0, mostRecentDefaultedLoanIndex);
	let underCollateralizedLoanIds = [];

	//iterate through each remaining non-defaulted loan
	for(let loan of remainingLoans) {
		//and calc USD value of principal and collateral 
		let loanPrincipalValInUSD = convertToUSD(loan.principalAmount, loan.principalTokenId, currPriceOfETH)
		let loanCollateralValInUSD = convertToUSD(loan.collateralAmount, loan.collateralTokenId, currPriceOfETH);

		//if collateral value less than principal, push loan id to underCollateralizedLoanIds array
		if(loanCollateralValInUSD < loanPrincipalValInUSD) {
			underCollateralizedLoanIds.push(loan.id);
		}
	}

	//combine defaultedLoanIds w/ underCollateralizedLoanIds and return
	let liquidatableLoans = [...defaultedLoanIds, ...underCollateralizedLoanIds];
	return liquidatableLoans
}

//find price of ETH at a given point in time using binary search
function getCurrentPriceOfETH(targetTime) {
	return binarySearch("price", ETHPrices, targetTime, null)
}

//find most recent defaulted loan given a point in time using binary search
function findMostRecentDefaultedLoan(cutOffDate) {
	return binarySearch("default", loans, cutOffDate, null)
}

//binary search helper function (note: with more time would refactor as this isn't super legible)
function binarySearch(toggle, dataSource, targetTime, result) {
	let low = 0;
	let high = dataSource.length - 1;

	//only relevant for finding most recent defaulted loan
	if (toggle === "default") {
		if (dataSource[high].filledAt > targetTime) {
			return result;
		}
	} else {
		if(new Date(dataSource[low].date) < targetTime || new Date(dataSource[high]) > targetTime) {
			return result;
		}
	}

	while (low < high) {
		let mid = Math.floor((low + high) / 2)
		let midTime = toggle === "default" ? dataSource[mid].filledAt : new Date(dataSource[mid].date);
		let midPlusOneTime, midMinusOneTime

		//TODO REFACTOR
		//if mid equal to beg or end of data set
		if(mid !== 0 && mid !== dataSource.length-1) {
			midPlusOneTime = (toggle === "default" ? dataSource[mid + 1].filledAt : new Date(dataSource[mid + 1].date));
			midMinusOneTime = toggle === "default" ? dataSource[mid - 1].filledAt : new Date(dataSource[mid - 1].date);
		} else if(mid === 0) {
			midPlusOneTime = (toggle === "default" ? dataSource[mid + 1].filledAt : new Date(dataSource[mid + 1].date));
			midMinusOneTime = mid;
		} else if (mid === dataSource.length - 1) {
			midPlusOneTime = mid;
			midMinusOneTime = toggle === "default" ? dataSource[mid - 1].filledAt : new Date(dataSource[mid - 1].date);
		}
		
		//if mid time eql to target time or target time in between mid time and next highest time, return index (if finding most recent defaulted loan)
		//OR price (if finding current ETH price)
		if (midTime - targetTime === 0 || midTime < targetTime && targetTime < midMinusOneTime) {
			result = toggle === "default" ? mid : dataSource[mid].value;
			return result
		}

		//else if, target time is b/w midTIme and next lowest time, set index to mid + 1 index (if finding most recent defaulted loan)
		//OR mid + 1 price (if finding current ETH price)
		else if (midTime > targetTime && (targetTime > midPlusOneTime || targetTime - midPlusOneTime === 0)) {
			result = toggle === "default" ? mid + 1 : dataSource[mid + 1].value
			return result;
		}

		//otherwise modify low/high
		else {
			if (targetTime < midTime) {
				low = mid + 1;
			} else {
				high = mid - 1;
			}
		}
	}

	return result;
}

//convert a value to USD 
function convertToUSD(val, currencyId, currPriceOfETH) {
	if(tokenMap[currencyId] === "ETH") {
		return val * currPriceOfETH;
	} else {
		return val;
	}
}

//convert tokens to a hash map for easier look up (esp if currency types increase over time)
function mapTokens(tokens) {
	let map = {}

	for(let token of tokens) {
		map[token.id] = token.symbol;
	}

	return map;
}

module.exports = getLiquidatableLoans;