import Joi from 'joi'
import { getDB } from '../config/mongodb.js'
import { getCurrentDate  } from '../utils.js/getCurrentDate.js'

const schema = Joi.object({
    billID: Joi.string().required().min(3),
    orderDate: Joi.date().timestamp().default(getCurrentDate()),
    status: Joi.string().default('Processing...'),
    handleDate: Joi.date().timestamp().default(null),
    discount: Joi.number().default(0),
    totalAmount: Joi.number(),
    userName: Joi.string().default(null),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    updatedAt: Joi.date().timestamp().default(null),
    _destroy: Joi.boolean().default(false)
})

const validateSchema = async (data) => {
    try {
        const validated = await schema.validateAsync(data, { abortEarly: false})
        return validated
    } catch (error) {
        return ({err: 'Validate bill failed with error: ' + error})
    }
}

const getAll = async () => {
    try {
        const all = await getDB().collection('bills').find().toArray()
        return all
    } catch (error) {
        return ({err: 'Get all bill failed with error: ' + error})
    }
}

const getOne = async (id) => {
    try {
        const data = await getDB().collection('bills').findOne({billID: id})
        if(!data){
            return ({err: 'BillID not found'})
        }
        return data
    } catch (error) {
        return ({err: `Get billID:${id} failed with error: ` + error})
    }
}

const createNew = async (data) => {
    try {
        const value = await validateSchema(data)
        const all = await getDB().collection('bills').find().toArray()
        for(let i = 0; i < all.length; i++){
            if(data.billID === all[i].billID) {
                return ({err: 'Create bill failed (billID already existed)!'})
            }
        }
        if(!value.err){
            await getDB().collection('bills').insertOne(value)
            return ({message: 'Create bill successfully'})
        }
        return ({err: 'Create bill failed with error: ' + value.err})
    } catch(error) {
        return ({err: 'Create bill failed with error: ' + error})
    }
}

const updateOne = async (id, data) => {
    try {
        const existed = await getDB().collection('bills').findOne({billID: id})
        if(!existed){
            return ({err: 'BillID not found'})
        }
        const condition = Joi.object({
            status: Joi.string(),
            handleDate: Joi.string(),
            name: Joi.string(),
            phone: Joi.string(),
            address: Joi.string(),
            _destroy: Joi.boolean()
        })
        let value
        try {
            if(Object.keys(data).length === 0){
                return ({err: 'Cant update bill due to empty data!'})
            }
            value = await condition.validateAsync(data, { abortEarly: false})
        } catch (error) {
            return({err: `Validate billID:${id}  failed with error: ` + error})
        }
        await getDB().collection('bills').updateOne({billID: id},{$set: value})
        await getDB().collection('bills').updateOne({billID: id},{$set: {updatedAt: getCurrentDate()}})
        return({message: `Update billID:${id} successfully`})
    } catch (error) {
        return({err: `Update billID:${id} failed with error: ` + error})
    }
}

const deleteOne = async (id) => {
    try {
        try {
            const data = await getDB().collection('bills').findOne({billID: id})
            await getDB().collection('bills').deleteOne({billID: data.billID})
            return({message: `Delete billID:${id} successfully`})
        } catch (error) {
            return ({err: 'BillID not found'})
        }
    } catch (error) {
        return({err: `Delete billID:${id} failed with error: ` + error})
    }
}

export const BillModel = { createNew , getAll , getOne, updateOne, deleteOne}