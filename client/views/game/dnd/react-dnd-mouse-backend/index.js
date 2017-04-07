import MouseBackend from './MouseBackend'

const createMouseBackend = (manager) => new MouseBackend(manager)

export default createMouseBackend
