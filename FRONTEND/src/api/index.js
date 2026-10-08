//switching between mock and real api based on env variable
import * as mock from './mock'
import * as real from './real'

export default import.meta.env.VITE_USE_MOCK === 'true' ? mock : real