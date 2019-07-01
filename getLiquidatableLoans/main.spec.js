// Libraries
const chai = require("chai");
// Function to test
const getLiquidatableLoans = require("./main");

const expect = chai.expect;

describe("getLiquidatableLoans", () => {
	describe("when given sample date in ReadMe", () => {
		it("returns an array with 7 values", async () => {			
			const result = getLiquidatableLoans(1558650159442);

			expect(result).to.eql([6368, 6362, 6179, 6121, 6120, 6114, 5879]);
		});
	});

	describe("when given date that matches first date in eth-price.json file", () => {
		it("returns an array with 8 values (i.e. includes defaulted loan)", async () => {
			const result = getLiquidatableLoans(1558656000000);
			expect(result).to.eql([5876, 6368, 6362, 6179, 6121, 6120, 6114, 5879]);
		});
	});

	describe("when given date that matches last date in eth-price.json file", () => {
		it("returns an array with 7 values", async () => {
			const result = getLiquidatableLoans(1558535880000);
			expect(result).to.eql([6368, 6362, 6179, 6121, 6120, 6114, 5879]);
		});
	});

	describe("when given date that does not exist in eth-price.json file", () => {
		it("returns an empty array", async () => {
			const result = getLiquidatableLoans(1561961661031);
			expect(result).to.eql([]);
		});
	});
});