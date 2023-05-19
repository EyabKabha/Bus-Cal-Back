const Sequelize = require('sequelize');

const db = require("../config/database");
const Companies = require('./companies');
const Companies_files = require('./companies_files');
const Customers = require('./customers');
const Employees = require('./employees');
const Employees_files = require('./employees_files');
const Extra = require('./extra');
const Extra_orders = require('./extra_orders');
const Orders = require('./orders');
const Roles = require('./roles');
const Stop_stations_orders = require('./stop_stations_orders');
const Trip = require('./trip');
const Vehicle = require('./vehicle');
const Vehicle_type = require('./vehicle_type');
const Cities = require('./cities');
const Available_vehicles = require('./available_vehicles');
const Closed_orders = require('./closed_orders')
const Closed_available_vehicles = require('./closed_available_vehicles')
const Waiting_customers = require('./waiting_customers')
const Waiting_files = require('./waiting_files')

const available_vehicles = Available_vehicles(db, Sequelize);
const companies = Companies(db, Sequelize);
const extra = Extra(db, Sequelize);
const extra_orders = Extra_orders(db, Sequelize);
const orders = Orders(db, Sequelize);
const roles = Roles(db, Sequelize);
const stop_stations_orders = Stop_stations_orders(db, Sequelize);
const trip = Trip(db, Sequelize);
const vehicle = Vehicle(db, Sequelize);
const vehicle_type = Vehicle_type(db, Sequelize);
const companies_files = Companies_files(db, Sequelize);
const customers = Customers(db, Sequelize);
const employees = Employees(db, Sequelize);
const waiting_customers = Waiting_customers(db, Sequelize);
const waiting_files = Waiting_files(db, Sequelize);
const employees_files = Employees_files(db, Sequelize);
const cities = Cities(db, Sequelize);
const customers_companies = db.define('customers_companies', {}, { timestamps: false, underscored: true });
const closed_orders = Closed_orders(db, Sequelize)
const closed_available_vehicles = Closed_available_vehicles(db, Sequelize)



// relationship companies available_vehicles
companies.hasMany(closed_available_vehicles, { foreignKey: 'company_id' })
closed_available_vehicles.belongsTo(companies)
// relationship customers available_vehicles
customers.hasMany(closed_available_vehicles, { foreignKey: 'customer_id' })
closed_available_vehicles.belongsTo(customers)

customers.hasMany(closed_available_vehicles, { foreignKey: 'customer_id' })
closed_available_vehicles.belongsTo(customers, {as:'userCompany'})

// relationship  available_vehicles
available_vehicles.hasMany(closed_available_vehicles)
closed_available_vehicles.belongsTo(available_vehicles)

// relationship companies available_vehicles
companies.hasMany(available_vehicles)
available_vehicles.belongsTo(companies)
// relationship customers available_vehicles
customers.hasMany(available_vehicles)
available_vehicles.belongsTo(customers)

vehicle.hasMany(available_vehicles)
available_vehicles.belongsTo(vehicle)

//relationship roles customers
roles.hasMany(customers)
customers.belongsTo(roles, { foreignKey: 'role_id' })

// relationship customers companies
companies.belongsToMany(customers, { through: customers_companies, foreignKey: 'company_id' })
customers.belongsToMany(companies, { through: customers_companies, foreignKey: 'customer_id' })

// relationship roles employees
roles.hasMany(employees)
employees.belongsTo(roles)

// relationship customers orders
customers.hasMany(orders)
orders.belongsTo(customers)



customers.hasMany(closed_orders)
closed_orders.belongsTo(customers)

companies.hasMany(closed_orders)
closed_orders.belongsTo(companies)


customers.hasMany(closed_orders)
closed_orders.belongsTo(customers, {as:'userCompany'})


orders.hasMany(closed_orders, { foreignKey: 'order_id' })
closed_orders.belongsTo(orders)

orders.hasMany(stop_stations_orders)
stop_stations_orders.belongsTo(orders)

vehicle.hasMany(orders)
orders.belongsTo(vehicle)

vehicle_type.hasMany(vehicle, { foreignKey: 'type_id' })
vehicle.belongsTo(vehicle_type, { foreignKey: 'type_id' })


orders.hasMany(extra_orders, { foreignKey: 'order_id' })
extra_orders.belongsTo(orders)

extra.hasMany(extra_orders, { foreignKey: 'extra_id' })
extra_orders.belongsTo(extra)

trip.hasMany(orders, { foreignKey: 'trip_id' })
orders.belongsTo(trip)





db.sync({ force: false }).then(() => {
    console.log('created');
});

module.exports = {
    companies,
    extra,
    extra_orders,
    orders,
    stop_stations_orders,
    trip,
    cities,
    vehicle,
    vehicle_type,
    companies_files,
    roles,
    customers,
    customers_companies,
    employees,
    employees_files,
    closed_orders,
    available_vehicles,
    closed_available_vehicles,
    waiting_files,
    waiting_customers
}
