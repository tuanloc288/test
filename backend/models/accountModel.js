import Joi from 'joi'
import { getDB } from '../config/mongodb.js'
import { getCurrentDate  } from '../utils.js/getCurrentDate.js'

const schema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required(),
    isAvailable: Joi.boolean().default(true),
    isRemembered: Joi.boolean().default(false),
    privileged: Joi.array().items(Joi.string().min(3)),
    createdAt: Joi.date().timestamp().default(getCurrentDate()),
    updatedAt: Joi.date().timestamp().default(null),
    _destroy: Joi.boolean().default(false)
})

const validateSchema = async (data) => {
    try {
        const validated = await schema.validateAsync(data, { abortEarly: false})
        return validated
    } catch (error) {
        return ({err: 'Validate account failed with error: ' + error})
    }
}

const getAll = async () => {
    try {
        const all = await getDB().collection('accounts').find().toArray()
        return all
    } catch (error) {
        return ({err: 'Get all account failed with error: ' + error})
    }
}

const getOne = async (id) => {
    try {
        const data = await getDB().collection('accounts').findOne({userName: id})
        if(!data){
            return ({err: 'User name not found'})
        }
        return data
    } catch (error) {
        return ({err: `Get userName:${id} failed with error: ` + error})
    }
}

const createNew = async (data) => {
    try {
        const value = await validateSchema(data)
        const all = await getDB().collection('accounts').find().toArray()
        for(let i = 0; i < all.length; i++){
            if(data.userName === all[i].userName) {
                return ({err: 'Create account failed (userName already existed)!'})
            }
        }
        if(!value.err){
            await getDB().collection('accounts').insertOne(value)
            return ({message: 'Create account successfully'})
        }
        return ({err: 'Create account failed with error: ' + value.err})
    } catch(error) {
        return ({err: 'Create account failed with error: ' + error})
    }
}

const updateOne = async (id, data) => {
    try {
        const existed = await getDB().collection('accounts').findOne({userName: id})
        if(!existed){
            return ({err: 'User name not found'})
        }
        const condition = Joi.object({
            password: Joi.string(),
            isAvailable: Joi.boolean(),
            isRemembered: Joi.boolean(),
            privileged: Joi.array().items(Joi.string().min(3)),
            _destroy: Joi.boolean()
        })
        let value
        try {
            if(Object.keys(data).length === 0){
                return ({err: 'Cant update account due to empty data!'})
            }
            value = await condition.validateAsync(data, { abortEarly: false})
        } catch (error) {
            return({err: `Validate userName:${id}  failed with error: ` + error})
        }
        await getDB().collection('accounts').updateOne({userName: id},{$set: value})
        await getDB().collection('accounts').updateOne({userName: id},{$set: {updatedAt: getCurrentDate()}})
        return({message: `Update userName:${id} successfully`})
    } catch (error) {
        return({err: `Update userName:${id} failed with error: ` + error})
    }
}

const deleteOne = async (id) => {
    try {
        try {
            const data = await getDB().collection('accounts').findOne({userName: id})
            await getDB().collection('accounts').deleteOne({userName: data.userName})
            return({message: `Delete userName:${id} successfully`})
        } catch (error) {
            return ({err: 'User name not found'})
        }
    } catch (error) {
        return({err: `Delete userName:${id} failed with error: ` + error})
    }
}

export const AccountModel = { createNew , getAll , getOne, updateOne, deleteOne}