import Joi from 'joi'
import { getDB } from '../config/mongodb.js'
import { getCurrentDate  } from '../utils.js/getCurrentDate.js'

const schema = Joi.object({
    cartDetailID: Joi.string().min(7).required(),
    cartID: Joi.string().required().min(3),
    productID: Joi.string().required().min(4),
    price: Joi.number(),
    quantity: Joi.number(),
    discount: Joi.number(),
    totalAmount: Joi.number(),
    createdAt: Joi.date().timestamp().default(getCurrentDate()),
    updatedAt: Joi.date().timestamp().default(null)
})

const validateSchema = async (data) => {
    try {
        const validated = await schema.validateAsync(data, { abortEarly: false})
        return validated
    } catch (error) {
        return ({err: 'Validate cart detail failed with error: ' + error})
    }
}

const getAll = async (id) => {
    try {
        const all = await getDB().collection('cartDetail').find({cartID: id}).toArray()
        if(all.length === 0){
            return ({err: 'Cart ID not found'})
        }
        return all
    } catch (error) {
        return ({err: 'Get all cart detail failed with error: ' + error})
    }
}

const createNew = async (data) => {
    try {
        const value = await validateSchema(data)
        const all = await getDB().collection('cartDetail').find().toArray()
        for(let i = 0; i < all.length; i++){
            if(data.cartDetailID === all[i].cartDetailID) {
                return ({err: 'Create cart detail failed (cartDetailID already existed)!'})
            }
        }
        if(!value.err){
            await getDB().collection('cartDetail').insertOne(value)
            return ({message: 'Create cart detail successfully'})
        }
        return ({err: 'Create cart detail failed with error: ' + value.err})
    } catch(error) {
        return ({err: 'Create cart detail failed with error: ' + error})
    }
}

const updateOne = async (id, data) => {
    try {
        const existed = await getDB().collection('cartDetail').findOne({cartDetailID: id})
        if(!existed){
            return ({err: 'cart detail ID not found'})
        }
        const condition = Joi.object({
            quantity: Joi.number(),
            totalAmount: Joi.number()
        })
        let value 
        try {
            if(Object.keys(data).length === 0){
                return ({err:  `Cant update cart detail with cartID${id} due to empty data!`})
            }
            value = await condition.validateAsync(data, {abortEarly: false})
        } catch (error) {
            return ({err: `Validate cart detail with cartID${id} failed with error: ` + error})
        }
        await getDB().collection('cartDetail').updateOne({cartDetailID: id} , {$set: {quantity: value.quantity, totalAmount: value.totalAmount, updatedAt: getCurrentDate()}})
        return({message: `Set item quantity and totalAmount in cartID:${id} successfully`})
    } catch (error) {
        return({err: `Set item quantity and totalAmount in cartID:${id} failed with error: ` + error})
    }
}

const deleteOne = async (id) => {
    try {
        try {
            const data = await getDB().collection('cartDetail').findOne({cartDetailID: id})
            await getDB().collection('cartDetail').deleteOne({cartDetailID: data.cartDetailID})
            return({message: `Delete cartDetailID:${id} successfully`})
        } catch (error) {
            return ({err: 'Cart detail ID not found'})
        }
    } catch (error) {
        return({err: `Delete cartDetailID:${id} failed with error: ` + error})
    }
}

export const CartDetailModel = { createNew , getAll, updateOne, deleteOne}