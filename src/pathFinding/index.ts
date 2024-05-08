import bruteForceSearch from './bruteForceSearch';
import reverseSearch from './reverseSearch';
import reverseSearch2 from './reverseSearch2';
import reverseSearch3 from './reverseSearch3';

const algorithms = [bruteForceSearch, reverseSearch, reverseSearch2, reverseSearch3];

export const algorithmNames = algorithms.map((a) => a.name);

export default algorithms;
