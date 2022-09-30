import Joi from 'joi'
import { getDB } from '../config/mongodb.js'
import { getCurrentDate  } from '../utils.js/getCurrentDate.js'

const schema = Joi.object({
    billDetailID: Joi.string().min(7).required(),
    billID: Joi.string().required().min(3),
    productID: Joi.string().required().min(4),
    price: Joi.number(),
    quantity: Joi.number(),
    discount: Joi.number(),
    totalAmount: Joi.number(),
    createdAt: Joi.date().timestamp().default(getCurrentDate()),
    updatedAt: Joi.date().timestamp().default(null),
    _destroy: Joi.boolean().default(false)
})

const validateSchema = async (data) => {
    try {
        const validated = await schema.validateAsync(data, { abortEarly: false})
        return validated
    } catch (error) {
        return ({err: 'Validate bill detail failed with error: ' + error})
    }
}

const getAll = async (id) => {
    try {
        const all = await getDB().collection('billDetail').find({billID: id}).toArray()
        return all
    } catch (error) {
        return ({err: 'Get all bill detail failed with error: ' + error})
    }
}

const createNew = async (data) => {
    try {
        const value = await validateSchema(data)
        const all = await getDB().collection('billDetail').find().toArray()
        for(let i = 0; i < all.length; i++){
            if(data.billDetailID === all[i].billDetailID) {
                return ({err: 'Create bill detail failed (billDetailID already existed)!'})
            }
        }
        if(!value.err){
            await getDB().collection('billDetail').insertOne(value)
            return ({message: 'Create bill detail successfully'})
        }
        return ({err: 'Create bill detail failed with error: ' + value.err})
    } catch(error) {
        return ({err: 'Create bill detail failed with error: ' + error})
    }
}

const updateDestroy = async (id, isDestroy) => {
    try {
        const existed = await getDB().collection('billDetail').findOne({billID: id})
        if(!existed){
            return ({err: 'Bill ID not found'})
        }
        await getDB().collection('billDetail').updateMany({billID: id},{$set:  {_destroy: isDestroy._destroy , updatedAt: getCurrentDate()}})
        return({message: `Set all items in billID:${id}'s _destroy to ${isDestroy._destroy} successfully`})
    } catch (error) {
        return({err: `Set all items in billID:${id}'s _destroy to ${isDestroy._destroy} failed with error: ` + error})
    }
}

const deleteOne = async (id) => {
    try {
        try {
            const data = await getDB().collection('billDetail').findOne({billDetailID: id})
            await getDB().collection('billDetail').deleteOne({billDetailID: data.billDetailID})
            return({message: `Delete billDetailID:${id} successfully`})
        } catch (error) {
            return ({err: 'billDetailID not found'})
        }
    } catch (error) {
        return({err: `Delete billDetailID:${id} failed with error: ` + error})
    }
}

export const BillDetailModel = { createNew , getAll, updateDestroy, deleteOne}