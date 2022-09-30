import Joi from 'joi'
import { getDB } from '../config/mongodb.js'
import { getCurrentDate  } from '../utils.js/getCurrentDate.js'

const schema = Joi.object({
    DoAID: Joi.string().required().min(3),
    userName: Joi.string().required(),
    detail: Joi.number().required(),
    duration: Joi.date().required(),
    createdAt: Joi.date().timestamp().default(getCurrentDate()),
    updatedAt: Joi.date().timestamp().default(null),
    _destroy: Joi.boolean().default(false) 
})

const validateSchema = async (data) => {
    try {
        const validated = await schema.validateAsync(data, { abortEarly: false})
        return validated
    } catch (error) {
        return ({err: 'Validate DoA failed with error: ' + error})
    }
}

const getAll = async () => {
    try {
        const all = await getDB().collection('discountOnAccount').find().toArray()
        return all
    } catch (error) {
        return ({err: 'Get all DoA failed with error: ' + error})
    }
}

const updateDestroy = async () => {
    try {
        const all = await getDB().collection('discountOnAccount').find().toArray() 
        if(Object.keys(all).length !== 0){
            for(let i = 0; i < all.length; i++){
                if(all[i].duration < new Date().toLocaleDateString()){
                    getDB().collection('discountOnAccount').updateOne({DoAID: all[i].DoAID} , {_destroy: true})
                }
            }
            return ({message: 'Update destroy for all DoA successfully'})
        }
        return ({message: 'No DoA for updating...'})
    } catch (error) {
        return ({err: 'Update destroy for all DoA failed with error: ' + error})
    }
}

const createNew = async (data) => {
    try {
        const value = await validateSchema(data)
        const all = await getDB().collection('discountOnAccount').find().toArray()
        for(let i = 0; i < all.length; i++){
            if(data.DoAID === all[i].DoAID) {
                return ({err: 'Create DoA failed (DoAID already existed)!'})
            }
        }
        if(!value.err){
            await getDB().collection('discountOnAccount').insertOne(value)
            return ({message: 'Create DoA successfully'})
        }
        return ({err: 'Create DoA failed with error: ' + value.err})
    } catch(error) {
        return ({err: 'Create DoA failed with error: ' + error})
    }
}

const updateOne = async (id, data) => {
    try {
        const existed = await getDB().collection('discountOnAccount').findOne({DoAID: id})
        if(!existed){ 
            return ({err: 'DoAID not found'})
        }
        const condition = Joi.object({
            detail: Joi.number(),
            duration: Joi.date(),
            _destroy: Joi.boolean() 
        })
        let value
        try {
            if(Object.keys(data).length === 0){
                return ({err: 'Cant update DoA due to empty data!'})
            }
            value = await condition.validateAsync(data, { abortEarly: false})
        } catch (error) {
            return({err: `Validate DoAID:${id}  failed with error: ` + error})
        }
        await getDB().collection('discountOnAccount').updateOne({DoAID: id},{$set: value})
        await getDB().collection('discountOnAccount').updateOne({DoAID: id},{$set: {updatedAt: getCurrentDate()}})
        return({message: `Update DoAID:${id} successfully`})
    } catch (error) {
        return({err: `Update DoAID:${id} failed with error: ` + error})
    }
}

const deleteOne = async (id) => {
    try {
        try {
            const data = await getDB().collection('discountOnAccount').findOne({DoAID: id})
            await getDB().collection('discountOnAccount').deleteOne({DoAID: data.DoAID})
            return({message: `Delete DoAID:${id} successfully`})
        } catch (error) {
            return ({err: 'DoAID not found'})
        }
    } catch (error) {
        return({err: `Delete DoAID:${id} failed with error: ` + error})
    }
}

export const DiscountOnAccountModel = { createNew , getAll, updateOne, updateDestroy , deleteOne}