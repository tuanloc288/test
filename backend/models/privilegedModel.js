import Joi from 'joi'
import { getDB } from '../config/mongodb.js'
import { getCurrentDate  } from '../utils.js/getCurrentDate.js'

const schema = Joi.object({
    privilegedID: Joi.string().required().min(3),
    detail: Joi.string().required().min(5),
    createdAt: Joi.date().timestamp().default(getCurrentDate()),
    updatedAt: Joi.date().timestamp().default(null),
    _destroy: Joi.boolean().default(false)
})

const validateSchema = async (data) => {
    try {
        const validated = await schema.validateAsync(data, { abortEarly: false})
        return validated
    } catch (error) {
        return ({err: 'Validate privileged failed with error: ' + error})
    }
}

const getAll = async () => {
    try {
        const all = await getDB().collection('privileged').find().toArray()
        return all
    } catch (error) {
        return ({err: 'Get all privileged failed with error: ' + error})
    }
}

const getOne = async (id) => {
    try {
        const data = await getDB().collection('privileged').findOne({privilegedID: id})
        if(!data) {
            return ({err: 'PrivilegedID not found'})
        }
        return data
    } catch (error) {
        return ({err: `Get privilegedID:${id} failed with error: ` + error})
    }
}

const createNew = async (data) => {
    try {
        const value = await validateSchema(data)
        const all = await getDB().collection('privileged').find().toArray()
        for(let i = 0; i < all.length; i++){
            if(data.privilegedID === all[i].privilegedID) {
                return ({err: 'Create privileged failed (privilegedID already existed)!'})
            }
        }
        if(!value.err){
            await getDB().collection('privileged').insertOne(value)
            return ({message: 'Create privileged successfully'})
        }
        return ({err: 'Create privileged failed with error: ' + value.err})
    } catch(error) {
        return ({err: 'Create privileged failed with error: ' + error})
    }
}

const updateOne = async (id, data) => {
    try {
        const existed = await getDB().collection('privileged').findOne({privilegedID: id})
        if(!existed){
            return ({err: 'PrivilegedID not found'})
        }
        const condition = Joi.object({
            detail: Joi.string(),
            _destroy: Joi.boolean()
        })
        let value
        try {
            if(Object.keys(data).length === 0){
                return ({err: 'Cant update privileged due to empty data!'})
            }
            value = await condition.validateAsync(data, { abortEarly: false})
        } catch (error) {
            return({err: `Validate privilegedID:${id}  failed with error: ` + error})
        }
        await getDB().collection('privileged').updateOne({privilegedID: existed.privilegedID},{$set: value})
        await getDB().collection('privileged').updateOne({privilegedID: existed.privilegedID},{$set: {updatedAt: getCurrentDate()}})
        return({message: `Update privilegedID:${id} successfully`})
    } catch (error) {
        return({err: `Update privilegedID:${id} failed with error: ` + error})
    }
}

const deleteOne = async (id) => {
    try {
        try {
            const data = await getDB().collection('privileged').findOne({privilegedID: id})
            await getDB().collection('privileged').deleteOne({privilegedID: data.privilegedID})
            return({message: `Delete privilegedID:${id} successfully`})
        } catch (error) {
            return ({err: 'PrivilegedID not found'})
        }
    } catch (error) {
        return({err: `Delete privilegedID:${id} failed with error: ` + error})
    }
}

export const PrivilegedModel = { createNew , getAll , getOne, updateOne, deleteOne}