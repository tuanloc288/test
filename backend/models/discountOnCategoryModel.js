import Joi from 'joi'
import { getDB } from '../config/mongodb.js'
import { getCurrentDate  } from '../utils.js/getCurrentDate.js'

const schema = Joi.object({
    DoCID: Joi.string().required().min(3),
    categoryID: Joi.string().required(),
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
        return ({err: 'Validate DoC failed with error: ' + error})
    }
}

const getAll = async () => {
    try {
        const all = await getDB().collection('discountOnCategory').find().toArray()
        return all
    } catch (error) {
        return ({err: 'Get all DoC failed with error: ' + error})
    }
}

const updateDestroy = async () => {
    try {
        const all = await getDB().collection('discountOnCategory').find().toArray() 
        if(Object.keys(all).length !== 0){
            for(let i = 0; i < all.length; i++){
                if(all[i].duration < new Date().toLocaleDateString()){
                    getDB().collection('discountOnCategory').updateOne({DoCID: all[i].DoCID} , {_destroy: true})
                }
            }
            return ({message: 'Update destroy for all DoC successfully'})
        }
        return ({message: 'No DoC for updating...'})
    } catch (error) {
        return ({err: 'Update destroy for all DoC failed with error: ' + error})
    }
}

const createNew = async (data) => {
    try {
        const value = await validateSchema(data)
        const all = await getDB().collection('discountOnCategory').find().toArray()
        for(let i = 0; i < all.length; i++){
            if(data.DoCID === all[i].DoCID) {
                return ({err: 'Create DoC failed (DoCID already existed)!'})
            }
        }
        if(!value.err){
            await getDB().collection('discountOnCategory').insertOne(value)
            return ({message: 'Create DoC successfully'})
        }
        return ({err: 'Create DoC failed with error: ' + value.err})
    } catch(error) {
        return ({err: 'Create DoC failed with error: ' + error})
    }
}

const updateOne = async (id, data) => {
    try {
        const existed = await getDB().collection('discountOnCategory').findOne({DoCID: id})
        if(!existed){ 
            return ({err: 'DoCID not found'})
        }
        const condition = Joi.object({
            detail: Joi.number(),
            duration: Joi.date(),
            _destroy: Joi.boolean() 
        })
        let value
        try {
            if(Object.keys(data).length === 0){
                return ({err: 'Cant update DoC due to empty data!'})
            }
            value = await condition.validateAsync(data, { abortEarly: false})
        } catch (error) {
            return({err: `Validate DoCID:${id}  failed with error: ` + error})
        }
        await getDB().collection('discountOnCategory').updateOne({DoCID: id},{$set: value})
        await getDB().collection('discountOnCategory').updateOne({DoCID: id},{$set: {updatedAt: getCurrentDate()}})
        return({message: `Update DoCID:${id} successfully`})
    } catch (error) {
        return({err: `Update DoCID:${id} failed with error: ` + error})
    }
}

const deleteOne = async (id) => {
    try {
        try {
            const data = await getDB().collection('discountOnCategory').findOne({DoCID: id})
            await getDB().collection('discountOnCategory').deleteOne({DoCID: data.DoCID})
            return({message: `Delete DoCID:${id} successfully`})
        } catch (error) {
            return ({err: 'DoCID not found'})
        }
    } catch (error) {
        return({err: `Delete DoCID:${id} failed with error: ` + error})
    }
}

export const DiscountOnCategoryModel = { createNew , getAll, updateOne, updateDestroy , deleteOne}