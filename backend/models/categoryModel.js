import Joi from 'joi'
import { getDB } from '../config/mongodb.js'
import { getCurrentDate  } from '../utils.js/getCurrentDate.js'

const schema = Joi.object({
    categoryID: Joi.string().required().min(5),
    name: Joi.string().required().min(5),
    createdAt: Joi.date().timestamp().default(getCurrentDate()),
    updatedAt: Joi.date().timestamp().default(null),
    _destroy: Joi.boolean().default(false) 
})

const validateSchema = async (data) => {
    try {
        const validated = await schema.validateAsync(data, { abortEarly: false})
        return validated
    } catch (error) {
        return ({err: 'Validate category failed with error: ' + error})
    }
}

const getAll = async () => {
    try {
        const all = await getDB().collection('categories').find().toArray()
        return all
    } catch (error) {
        return ({err: 'Get all category failed with error: ' + error})
    }
}

const getOne = async (id) => {
    try {
        const data = await getDB().collection('categories').findOne({categoryID: id})
        return data
    } catch (error) {
        return ({err: `Get categoryID:${id} failed with error: ` + error})
    }
}

const createNew = async (data) => {
    try {
        const value = await validateSchema(data)
        const all = await getDB().collection('categories').find().toArray()
        for(let i = 0; i < all.length; i++){
            if(data.categoryID === all[i].categoryID) {
                return ({err: 'Create category failed (categoryID already existed)!'})
            }
        }
        if(!value.err){
            await getDB().collection('categories').insertOne(value)
            return ({message: 'Create category successfully'})
        }
        return ({err: 'Create category failed with error: ' + value.err})
    } catch(error) {
        return ({err: 'Create category failed with error: ' + error})
    }
}

const updateOne = async (id, data) => {
    try {
        const existed = await getDB().collection('categories').findOne({categoryID: id})
        if(!existed){
            return ({err: 'CategoryID not found'})
        }
        const condition = Joi.object({
            name: Joi.string().required().min(5),
            _destroy: Joi.boolean() 
        })
        let value
        try {
            if(Object.keys(data).length === 0){
                return ({err: 'Cant update category due to empty data!'})
            }
            value = await condition.validateAsync(data, { abortEarly: false})
        } catch (error) {
            return({err: `Validate categoryID:${id}  failed with error: ` + error})
        }
        await getDB().collection('categories').updateOne({categoryID: id},{$set: value})
        await getDB().collection('categories').updateOne({categoryID: id},{$set: {updatedAt: getCurrentDate()}})
        return({message: `Update categoryID:${id} successfully`})
    } catch (error) {
        return({err: `Update categoryID:${id} failed with error: ` + error})
    }
}

const deleteOne = async (id) => {
    try {
        try {
            const data = await getDB().collection('categories').findOne({categoryID: id})
            await getDB().collection('categories').deleteOne({categoryID: data.categoryID})
            return({message: `Delete categoryID:${id} successfully`})
        } catch (error) {
            return ({err: 'CategoryID not found'})
        }
    } catch (error) {
        return({err: `Delete categoryID:${id} failed with error: ` + error})
    }
}

export const CategoryModel = { createNew , getAll , getOne, updateOne, deleteOne}