import bruteForceSearch from "./bruteForceSearch";
import reverseSearch from "./reverseSearch";


const algorithms = [
    bruteForceSearch,
    reverseSearch
]

export const algorithmNames = algorithms.map(a => a.name);

export default algorithms;