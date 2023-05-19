const { trip, vehicle, vehicle_type, orders, available_vehicles, roles, employees, customers } = require('../models')
const { Op } = require("sequelize");
const { BuscalError } = require('../models/Errors')
const { encrypt } = require("./encrypt")

const getVehiclesAndTrips = async () => {
    try {
        const allTrips = await trip.findAll()

        const allVehicles = await vehicle.findAll({
            include: [{ model: vehicle_type }]
        })

        return { allTrips, allVehicles }

    } catch (err) {
        throw new Error(`Can't get vehicles/trips: ${err.message}`)
    }
}

const addVehicle = async (newVehicle) => {
    try {
        let vehicleIsExist = await vehicle_type.findOne({ where: { type: newVehicle.vehicle_type.type } })
        if (!vehicleIsExist) {

            const newV = await vehicle_type.create({
                type: newVehicle.vehicle_type.type
            })

            await vehicle.create({
                type_id: newV.id,
                capacity: newVehicle.capacity
            })
            return "התווסף בהצלחה"
        }

        await vehicle.create({
            type_id: vehicleIsExist.id,
            capacity: newVehicle.capacity
        })

        return "התווסף בהצלחה"

    } catch (err) {
        throw new Error(`Can't add vehicles: ${err.message}`)
    }

}


const addTrip = async (newTrip) => {

    try {

        let tripIsExist = await trip.findOne({ where: { type: newTrip.type } })
        if (tripIsExist) throw new BuscalError(`סוג נסיעה כבר נמצא`)

        await trip.create({
            type: newTrip.type
        })

        return "התווסף בהצלחה"

    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't add Trip: ${err.message}`)
    }

}


const deleteVehicle = async (idToDelete) => {

    try {
        const vehicleIsExist = await vehicle.findOne({ where: { id: idToDelete } })
        if (!vehicleIsExist) throw new BuscalError(`סוג רכב לא נמצא`)

        const vehicleBelongsTo = await orders.findOne({ where: { vehicle_id: idToDelete } })
        if (vehicleBelongsTo) throw new BuscalError(`אי אפשר למחוק סוג רכב זה בגלל שהוא שייך להזמנה כלשהי`)

        const vehicleBelongs = await available_vehicles.findOne({ where: { vehicle_id: idToDelete } })
        if (vehicleBelongs) throw new BuscalError(`אי אפשר למחוק סוג רכב זה בגלל שהוא שייך להזמנה כלשהי`)

        await vehicle.destroy({
            where: { id: idToDelete }
        })

        return "נמחק בהצלחה"

    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't delete Vehicle: ${err.message}`)
    }
}


const deleteTrip = async (idToDelete) => {
    try {
        const tripIsExist = await trip.findOne({ where: { id: idToDelete } })
        if (!tripIsExist) throw new BuscalError(`סוג נסיעה לא קיים`)

        const tripBelongsTo = await orders.findOne({ where: { trip_id: idToDelete } })
        if (tripBelongsTo) throw new BuscalError(`אי אפשר למחוק סוג נסיעה זה בגלל שהוא שייך להזמנה כלשהי`)

        await trip.destroy({
            where: { id: idToDelete }
        })
        return "נמחק בהצלחה"
    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't delete trip: ${err.message}`)
    }
}

const getRoles = async (userId) => {

    try {

        const user = await employees.findOne({ where: { id: userId } })
        if (user.role_id === 1) {
            employeesRoles = await roles.findAll({
                where: {
                    [Op.or]: [
                        { name: 'sale' },
                        { name: 'subAdmin' },
                        { name: 'support' }
                    ]
                }
            })
        }
        else {
            employeesRoles = await roles.findAll({
                where: {
                    [Op.or]: [
                        { name: 'sale' },
                        { name: 'support' }
                    ]
                }
            })
        }

        return employeesRoles
    } catch (err) {
        throw new Error(`Can't get roles: ${err.message}`)
    }
}

const verifyPassword = async (pass, userId) => {
    try {
        const exist = await employees.findOne({ where: { id: userId, password: encrypt(pass) } })

        if (exist)
            return "סיסמה נכונה"
        throw new BuscalError("סיסמה שגויה")
    } catch (err) {
        if (err instanceof BuscalError)
            throw err
        throw new Error(`Can't confirm password: ${err.message}`)

    }
}

const getOrders = async () => {
    try {
        const Allorders = await orders.findAll({
             where: { active: 1, expired: 0 },
             attributes:['id', 'encrypted_id', 'start_date', 'end_date', 'start_point', 'destination', 'start_hour', 'end_hour', 'description']
            })
        return Allorders
    } catch (err) {
        throw new Error(`Can't get orders: ${err.message}`)
    }
}

const getAV = async () => {
    try {
        const Allorders = await available_vehicles.findAll({ where: {
             active: 1, expired: 0 },
             attributes:['id', 'encrypted_id', 'start_date', 'end_date', 'start_hour', 'end_hour', 'description']
             })
        return Allorders
    } catch (err) {
        throw new Error(`Can't get available vehicles: ${err.message}`)
    }
}

const getOrdersCustomer = async (cusId) => {
    try{
        const allorders = await orders.findAll({
            attributes: ['id', 'start_point', 'destination'],
            where:{active: 1, expired: 0, customer_id: cusId},
            include: [{model: customers, attributes:['first_name', 'last_name']}]
        })

        waitingOrders = allorders.map(w =>{
            return {
            id: w.id,
            start_point: w.start_point,
            destination: w.destination,
            customerName: w.customer.first_name + " " + w.customer.last_name 
        }})
        
        return waitingOrders

    }catch(err){
        throw new Error(`Can't get orders: ${err.message}`)
    }
}

const getAVCustomer = async (cusId) => {
    try{
        const allAV = await available_vehicles.findAll({
            attributes: ['id', 'start_date', 'end_date'],
            where:{active: 1, expired: 0, customer_id: cusId},
            include: [{model: customers, attributes:['first_name', 'last_name']}]
        })

        waiting = allAV.map(w =>{
            return {
            id: w.id,
            startDate: w.start_date,
            endDate: w.end_date,
            customerName: w.customer.first_name + " " + w.customer.last_name 
        }

        })
        return waiting

    }catch(err){
        throw new Error(`Can't get available_vehicles: ${err.message}`)
    }
}

module.exports = {
    getVehiclesAndTrips,
    addVehicle,
    deleteVehicle,
    deleteTrip,
    getRoles,
    addTrip,
    verifyPassword,
    getOrders,
    getAV,
    getOrdersCustomer,
    getAVCustomer
}