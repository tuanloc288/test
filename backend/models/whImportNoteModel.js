import Joi from 'joi'
import { getDB } from '../config/mongodb.js'
import { getCurrentDate  } from '../utils.js/getCurrentDate.js'

const schema = Joi.object({ 
    importNoteID: Joi.string().required().min(4),
    totalItems: Joi.number().required(),
    totalAmount: Joi.number().required(),
    userName: Joi.string().required(),
    createdAt: Joi.date().timestamp().default(getCurrentDate()),
    updatedAt: Joi.date().timestamp().default(null),
    _destroy: Joi.boolean().default(false)
})

const validateSchema = async (data) => {
    try {
        const validated = await schema.validateAsync(data, { abortEarly: false})
        return validated
    } catch (error) {
        return ({err: 'Validate import note failed with error: ' + error})
    }
}

const getAll = async () => {
    try {
        const all = await getDB().collection('whImportNote').find().toArray()
        return all
    } catch (error) {
        return ({err: 'Get all import note failed with error: ' + error})
    }
}

const getOne = async (id) => {
    try {
        const data = await getDB().collection('whImportNote').findOne({importNoteID: id})
        if(!data){
            return ({err: 'ImportNoteID not found'})
        }
        return data
    } catch (error) {
        return ({err: `Get importNoteID:${id} failed with error: ` + error})
    }
}

const createNew = async (data) => {
    try {
        const value = await validateSchema(data)
        const all = await getDB().collection('whImportNote').find().toArray()
        for(let i = 0; i < all.length; i++){
            if(data.importNoteID === all[i].importNoteID) {
                return ({err: 'Create import note failed (importNoteID already existed)!'})
            }
        }
        if(!value.err){
            await getDB().collection('whImportNote').insertOne(value)
            return ({message: 'Create import note successfully'})
        }
        return ({err: 'Create import note failed with error: ' + value.err})
    } catch(error) {
        return ({err: 'Create import note failed with error: ' + error})
    }
}

const updateOne = async (id, data) => {
    try {
        const existed = await getDB().collection('whImportNote').findOne({importNoteID: id})
        if(!existed){
            return ({err: 'ImportNoteID not found'})
        }
        const condition = Joi.object({
            totalItems: Joi.number(),
            totalAmount: Joi.number(),
            _destroy: Joi.boolean().default(false)
        })
        let value
        try {
            if(Object.keys(data).length === 0){
                return ({err: 'Cant update import note due to empty data!'})
            }
            value = await condition.validateAsync(data, { abortEarly: false})
        } catch (error) {
            return({err: `Validate importNoteID:${id}  failed with error: ` + error})
        }
        await getDB().collection('whImportNote').updateOne({importNoteID: id},{$set: value})
        await getDB().collection('whImportNote').updateOne({importNoteID: id},{$set: {updatedAt: getCurrentDate()}})
        return({message: `Update importNoteID:${id} successfully`})
    } catch (error) {
        return({err: `Update importNoteID:${id} failed with error: ` + error})
    }
}

const deleteOne = async (id) => {
    try {
        try {
            const data = await getDB().collection('whImportNote').findOne({importNoteID: id})
            await getDB().collection('whImportNote').deleteOne({importNoteID: data.importNoteID})
            return({message: `Delete importNoteID:${id} successfully`})
        } catch (error) {
            return ({err: 'ImportNoteID not found'})
        }
    } catch (error) {
        return({err: `Delete importNoteID:${id} failed with error: ` + error})
    }
}

export const ImportNoteModel = { createNew , getAll , getOne, updateOne, deleteOne}