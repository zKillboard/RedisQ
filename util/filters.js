'use strict';

const OP_REGEX = /(<=|>=|!=|=|<|>)/;

// Parse filter string into rules
function parseFilters(filterStr) {
	if (!filterStr) return null;

	const hasAnd = filterStr.includes(";");
	const hasOr = filterStr.includes(",");

	if (hasAnd && hasOr) {
		throw new Error("Cannot mix ; and , in filter string");
	}

	const operator = hasAnd ? "AND" : hasOr ? "OR" : "AND";
	const parts = filterStr.split(hasAnd ? ";" : ",");


	const rules = parts.map(p => {
		const match = p.match(OP_REGEX);
		if (!match) throw new Error("Invalid filter format, use key<op>value");

		const [key, val] = p.split(match[0]);
		return {
			key: key.trim(),
			op: match[0],
			val: isNaN(val.trim()) ? val.trim() : Number(val.trim())
		};
	});

	return { operator, rules };
}

// Recursive traversal — collects ALL values for a given key, including inside arrays
function findValues(obj, key) {
	let results = [];

	if (Array.isArray(obj)) {
		for (const el of obj) {
			results = results.concat(findValues(el, key));
		}
	} else if (obj && typeof obj === "object") {
		for (const k in obj) {
			if (k === key) results.push(obj[k]);
			results = results.concat(findValues(obj[k], key));
		}
	}

	return results;
}

// Comparison logic
function compare(op, a, b) {
	// auto-cast strings to numbers if both look numeric
	const isNum = !isNaN(a) && !isNaN(b);
	if (isNum) {
		a = Number(a);
		b = Number(b);
	}
	switch (op) {
		case "=": return a == b;
		case "!=": return a != b;
		case "<": return a < b;
		case "<=": return a <= b;
		case ">": return a > b;
		case ">=": return a >= b;
		default: return false;
	}
}

// Check if a package matches the rules
function matchesFilter(pkg, filter) {
	if (!filter) return true;
	const { operator, rules } = filter;

	const results = rules.map(r => {
		const values = findValues(pkg, r.key);
		return values.some(v => compare(r.op, v, r.val));
	});

	return operator === "AND" ? results.every(Boolean) : results.some(Boolean);
}

module.exports = {
	parseFilters,
	findValues,
	compare,
	matchesFilter
};