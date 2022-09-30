import Joi from 'joi'
import { getDB } from '../config/mongodb.js'
import { getCurrentDate  } from '../utils.js/getCurrentDate.js'

const schema = Joi.object({
    cartID: Joi.string().required().min(3),
    discount: Joi.number().default(0),
    totalAmount: Joi.number(),
    userName: Joi.string().default(null),
    createdAt: Joi.date().timestamp().default(getCurrentDate()),
    updatedAt: Joi.date().timestamp().default(null)
})

const validateSchema = async (data) => {
    try {
        const validated = await schema.validateAsync(data, { abortEarly: false})
        return validated
    } catch (error) {
        return ({err: 'Validate cart failed with error: ' + error})
    }
}

const getAll = async () => {
    try {
        const all = await getDB().collection('carts').find().toArray()
        return all
    } catch (error) {
        return ({err: 'Get all cart failed with error: ' + error})
    }
}

const getOne = async (id) => {
    try {
        const data = await getDB().collection('carts').findOne({cartID: id})
        if(!data){
            return ({err: 'CartID not found'})
        }
        return data
    } catch (error) {
        return ({err: `Get cartID:${id} failed with error: ` + error})
    }
}

const createNew = async (data) => {
    try {
        const value = await validateSchema(data)
        const all = await getDB().collection('carts').find().toArray()
        for(let i = 0; i < all.length; i++){
            if(data.cartID === all[i].cartID) {
                return ({err: 'Create cart failed (cartID already existed)!'})
            }
        }
        if(!value.err){
            await getDB().collection('carts').insertOne(value)
            return ({message: 'Create cart successfully'})
        }
        return ({err: 'Create cart failed with error: ' + value.err})
    } catch(error) {
        return ({err: 'Create cart failed with error: ' + error})
    }
}

const updateOne = async (id, data) => {
    try {
        const existed = await getDB().collection('carts').findOne({cartID: id})
        if(!existed){
            return ({err: 'CartID not found'})
        }
        const condition = Joi.object({
            discount: Joi.number(),
            totalAmount: Joi.number(),
            userName: Joi.string()
        })
        let value
        try {
            if(Object.keys(data).length === 0){
                return ({err: 'Cant update cart due to e empty data!'})
            }
            value = await condition.validateAsync(data, { abortEarly: false})
        } catch (error) {
            return({err: `Validate cartID:${id}  failed with error: ` + error})
        }
        await getDB().collection('carts').updateOne({cartID: id},{$set: value})
        await getDB().collection('carts').updateOne({cartID: id},{$set: {updatedAt: getCurrentDate()}})
        return({message: `Update cartID:${id} successfully`})
    } catch (error) {
        return({err: `Update cartID:${id} failed with error: ` + error})
    }
}

const deleteOne = async (id) => {
    try {
        try {
            const data = await getDB().collection('carts').findOne({cartID: id})
            await getDB().collection('carts').deleteOne({cartID: data.cartID})
            return({message: `Delete cartID:${id} successfully`})
        } catch (error) {
            return ({err: 'cartID not found'})
        }
    } catch (error) {
        return({err: `Delete cartID:${id} failed with error: ` + error})
    }
}

export const CartModel = { createNew , getAll , getOne, updateOne, deleteOne}