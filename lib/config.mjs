import { config } from 'dotenv';
const result = config();

if (result.error) { throw result.error; }

export function set_credentials(src, total, key){
    result['parsed'].src = src,
    result['parsed'].total = total,
    result['parsed'].key = key
}

const { parsed: envs } = result;
export default envs;