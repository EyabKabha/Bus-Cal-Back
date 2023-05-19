Joi = require('joi');

module.exports = {
    customerCompanyValidation: Joi.object().keys({
        first_name: Joi.string().min(2).max(18).required(),
        last_name: Joi.string().min(2).max(18).required(),
        fax: Joi.number().required(),
        phone: Joi.number().required(),
        email: Joi.string().email().min(4).max(60).required(),
        password: Joi.string().min(6).max(100).required(),
        email_notification: Joi.number().valid('1', '0'),
        sms_notification: Joi.number().valid('1', '0'),
        creator: Joi.number().integer().required(),
        creation_date: Joi.date(),
        city: Joi.string().min(2).max(18).required(),
        street: Joi.string().min(2).max(18).required(),
        postal_code: Joi.number().required(),
        type: Joi.string().valid('חברה', 'עובד חברה','לקוח רגיל', 'מוסד חינוכי', 'רשות', 'אחר','חברה', 'עוסק מורשה').allow('').optional(),
        companyname: Joi.string().min(2).max(18).required(),
        company_t_phone: Joi.number().required(),
        code: Joi.number().required(),
        subscription: Joi.string().valid('vip', 'regular'),
        companyphone: Joi.number().required(),
        companyemail: Joi.string().email().min(4).max(60).required(),
        companyfax: Joi.number().required(),
        companycity: Joi.string().min(2).max(18).required(),
        companystreet: Joi.string().min(2).max(18).required(),
        companypostal_code : Joi.number().required(),
        company_type: Joi.string().valid('חברה', 'עוסק מורשה').allow('').optional(),
        file1: Joi.string().min(2).max(18),
        file2: Joi.string().min(2).max(18)
    }),

    customerValidation: Joi.object().keys({
        first_name: Joi.string().min(2).max(18).required(),
        last_name: Joi.string().min(2).max(18).required(),
        fax: Joi.number().required(),
        phone: Joi.number().required(),
        email: Joi.string().email().min(4).max(60).required(),
        password: Joi.string().min(6).max(100).required(),
        email_notification: Joi.number().valid('1', '0'),
        sms_notification: Joi.number().valid('1', '0'),
        city: Joi.string().min(2).max(18).required(),
        street: Joi.string().min(2).max(18).required(),
        postal_code: Joi.number().required(),
    }),

    employeeValidation: Joi.object().keys({
        first_name: Joi.string().min(2).max(18).required(),
        last_name: Joi.string().min(2).max(18).required(),
        identity: Joi.number().required(),
        phone: Joi.number().required(),
        email: Joi.string().email().min(4).max(60).required(),
        password: Joi.string().min(6).max(100).required(),
        city: Joi.string().min(2).max(18).required(),
        street: Joi.string().min(2).max(18).required(),
        postal_code: Joi.number().required(),
        role_id: Joi.number().required(),
    }),

    companiesValidation: Joi.object().keys({
        name: Joi.string().min(2).max(18).required(),
        phone: Joi.number().required(),
        t_phone: Joi.number().required(),
        email: Joi.string().email().min(4).max(60).required(),
        code: Joi.number().required(),
        fax: Joi.number().required(),
        city: Joi.string().min(2).max(18).required(),
        street: Joi.string().min(2).max(18).required(),
        postal_code: Joi.number().required(),
        subscription: Joi.string().valid('vip', 'regular'),
        type: Joi.string().valid('חברה', 'עוסק מורשה'),

    }),

    orderValidation: Joi.object().keys({
        vehicle_id: Joi.number().required(),
        trip_id: Joi.number().required(),
        start_date: Joi.date(),
        end_date: Joi.date(),
        start_point: Joi.string().min(2).max(18).required(),
        destination: Joi.string().min(2).max(18).required(),
        start_hour: Joi.string().min(2).max(18).required(),
        end_hour: Joi.string().min(2).max(18).required(),
        description: Joi.string().min(0).max(500).allow(''),
        active: Joi.number().valid('1', '0'),
        expired: Joi.number().valid('1', '0'),
        extra: Joi.array(),
        stop_stations: Joi.array(),
    }),
    
    availableVehicleValidation: Joi.object().keys({
        vehicle_id: Joi.number().integer().required(),
        start_date: Joi.date(),
        end_date: Joi.date(),
        start_hour: Joi.string().min(2).max(18).required(),
        end_hour: Joi.string().min(2).max(18).required(),
        description: Joi.string().min(0).max(500).allow(''),
        active: Joi.string().valid('1', '0'),
        expired: Joi.string().valid('1', '0'),
    }),

    closedAvailableVehicleValidation: Joi.object().keys({
        customer_id: Joi.number().integer().required(),
        available_vehicle_id: Joi.number().integer().required(),
        company_id: Joi.number().integer().required(),
    }),

    closedOrdersValidation: Joi.object().keys({
        customer_id: Joi.number().integer().required(),
        order_id: Joi.number().integer().required(),
        company_id: Joi.number().integer().required(),
    }),


    cityValidation: Joi.object().keys({
        name: Joi.string().min(2).max(18).required(),
        englishName: Joi.string().min(2).max(18).required(),
    }),


    companiesFilesValidation: Joi.object().keys({
        path: Joi.string().min(2).max(100).required(),
        company_id: Joi.number().integer().required(),
    }),
    employeesFilesValidation: Joi.object().keys({
        path: Joi.string().min(2).max(100).required(),
        employee_id: Joi.number().integer().required(),
    }),
    
    extraOrdersValidation: Joi.object().keys({
        extra_id: Joi.number().integer().required(),
        order_id: Joi.number().integer().required(),
    }),

    stopStationsOrderValidation: Joi.object().keys({
        station: Joi.string().min(2).max(30).required(),
        sequence: Joi.number().integer().required(),
        order_id: Joi.number().integer().required(),
    }),

    vehicleValidation: Joi.object().keys({
        capacity: Joi.number().integer().required(),
        type_id: Joi.number().integer().required(),
    }),

    extraValidation: Joi.object().keys({
        name: Joi.string().min(2).max(22).required(),
    }),

    tripValidation: Joi.object().keys({
        type: Joi.string().min(2).max(18).required()
    }),

    vehicleTypeValidation: Joi.object().keys({
        type: Joi.string().min(2).max(18).required()
    }),
    
    rolesValidation: Joi.object().keys({
        name: Joi.string().min(2).max(18).required()
    }),

    customersCompaniesValidation: Joi.object().keys({
        customer_id: Joi.number().integer().required(),
        company_id: Joi.number().integer().required(),
    }),

  
   
    loginValidation: Joi.object().keys({
        email: Joi.string().email().min(4).max(60).required(),
        password: Joi.string().min(6).max(100).required(),
    })
  
};
