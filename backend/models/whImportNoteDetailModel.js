import Joi from 'joi'
import { getDB } from '../config/mongodb.js'
import { getCurrentDate  } from '../utils.js/getCurrentDate.js'

const schema = Joi.object({
    importNoteDetailID: Joi.string().min(8).required(),
    importNoteID: Joi.string().required().min(4),
    productID: Joi.string().required().min(4),
    price: Joi.number(),
    quantity: Joi.number(),
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
        return ({err: 'Validate import note detail failed with error: ' + error})
    }
}

const getAll = async (id) => {
    try {
        const all = await getDB().collection('whImportNoteDetail').find({importNoteID: id}).toArray()
        if(all.length === 0){
            return ({err: 'Import note ID not found'})
        }
        return all
    } catch (error) {
        return ({err: 'Get all import note detail failed with error: ' + error})
    }
}

const createNew = async (data) => {
    try {
        const value = await validateSchema(data)
        const all = await getDB().collection('whImportNoteDetail').find().toArray()
        for(let i = 0; i < all.length; i++){
            if(data.importNoteDetailID === all[i].importNoteDetailID) {
                return ({err: 'Create import note detail failed (importNoteDetailID already existed)!'})
            }
        }
        if(!value.err){
            await getDB().collection('whImportNoteDetail').insertOne(value)
            return ({message: 'Create importNote detail successfully'})
        }
        return ({err: 'Create import note detail failed with error: ' + value.err})
    } catch(error) {
        return ({err: 'Create import note detail failed with error: ' + error})
    }
}

const updateOne = async (id, data) => {
    try {
        const existed = await getDB().collection('whImportNoteDetail').findOne({importNoteDetailID: id})
        if(!existed){
            return ({err: 'Import note detail ID not found'})
        }
        const condition = Joi.object({
            price: Joi.number(),
            quantity: Joi.number(),
            totalAmount: Joi.number()
        })
        let value 
        try {
            if(Object.keys(data).length === 0){
                return ({err:  `Cant update import note detail with importNoteID:${id} due to empty data!`})
            }
            value = await condition.validateAsync(data, {abortEarly: false})
        } catch (error) {
            return ({err: `Validate import note detail with importNoteID:${id} failed with error: ` + error})
        }
        await getDB().collection('whImportNoteDetail').updateOne({importNoteDetailID: id} , {$set: value})
        await getDB().collection('whImportNoteDetail').updateOne({importNoteDetailID: id} , {$set: {updatedAt: getCurrentDate()}})
        return({message: `Set item quantity and totalAmount in importNoteID:${id} successfully`})
    } catch (error) {
        return({err: `Set item quantity and totalAmount in importNoteID:${id} failed with error: ` + error})
    }
}

const updateDestroy = async (id, isDestroy) => {
    try {
        const existed = await getDB().collection('whImportNoteDetail').findOne({importNoteID: id})
        if(!existed){
            return ({err: 'here'})
        }
        await getDB().collection('whImportNoteDetail').updateMany({importNoteID: id},{$set:  {_destroy: isDestroy._destroy , updatedAt: getCurrentDate()}})
        return({message: `Set all items in importNoteID:${id}'s _destroy to ${isDestroy._destroy} successfully`})
    } catch (error) {
        return({err: `Set all items in importNoteID:${id}'s _destroy to ${isDestroy._destroy} failed with error: ` + error})
    }
}

const deleteOne = async (id) => { 
    try {
        try {
            const data = await getDB().collection('whImportNoteDetail').findOne({importNoteDetailID: id})
            await getDB().collection('whImportNoteDetail').deleteOne({importNoteDetailID: data.importNoteDetailID})
            return({message: `Delete importNoteDetailID:${id} successfully`})
        } catch (error) {
            return ({err: 'Import note detail ID not found'})
        }
    } catch (error) {
        return({err: `Delete importNoteDetailID:${id} failed with error: ` + error})
    }
}

export const ImportNoteDetailModel = { createNew , getAll, updateOne, updateDestroy ,deleteOne}