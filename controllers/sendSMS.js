const axios = require('axios')

const username = `BusCal`
const password = `BusCal12!@`
const source = `BusCal`
const url = `https://www.019sms.co.il/api`

sendSingleSMS = async (phone, msg) => {
    try {
        const body = `
        <?xml version="1.0" encoding="UTF-8"?>
        <sms>
        <user>
        <username>${username}</username>
        <password>${password}</password>
        </user>
        <source>${source}</source>
        <destinations>
        <phone>${phone}</phone>
        </destinations>
        <message>${msg}</message>
        
        <response>0</response>
        </sms>
        `
        result = await axios.post(url, body)
        console.log(`SingleSMS: `, result.data)
    } catch (err) {
        throw new Error(`Can not send SMS: ${err.message}`)
    }
}

sendForAll = async (phones, msg) => {

    try {
        const bulkBody =
            `
            <?xml version="1.0" encoding="UTF-8"?>
            <bulk>
            <user> 
            <username>${username}</username>
            <password>${password}</password>
            </user>
            <messages>
               ${phones.map(phone => {
                return (
                    `
                    <sms>
                    <source>${source}</source>
                    <destinations>
                    <phone>${phone}</phone>
                    </destinations>
                    <message>${msg}</message>
                    </sms>
                    `
                )
            })}
            </messages>
            <response>0</response>
            </bulk>
            `

        result = await axios.post(url, bulkBody)
        console.log(`BulkSMS: `, result.data)
    } catch (err) {
        throw new Error(`Can not send SMS: ${err.message}`)
    }
}

checkBalance = async () => {
    try {
        const balance =
            `
        <balance>
        <user> 
        <username>${username}</username>
        <password>${password}</password>
        </user>
        </balance>
        `
        result = await axios.post(url, balance)
        console.log(result.data)
    }
    catch (err) {
        throw new Error(`Can't get balance: ${err.message}`)
    }
}

module.exports = { sendSingleSMS, sendForAll, checkBalance }