const { cities } = require('../models')

const getAll = async () => {
    try {
        const allCities = await cities.findAll()
        return allCities
    } catch (err) {
        throw new Error(`Can't get cities: ${err.message}`)
    }
}

module.exports = { getAll }