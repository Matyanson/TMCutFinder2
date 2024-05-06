import bruteForceSearch from './bruteForceSearch';
import reverseSearch from './reverseSearch';
import reverseSearch3 from './reverseSearch3';

const algorithms = [bruteForceSearch, reverseSearch, reverseSearch3];

export const algorithmNames = algorithms.map((a) => a.name);

export default algorithms;
