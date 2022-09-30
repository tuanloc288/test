import Joi from 'joi'
import { getDB } from '../config/mongodb.js'
import { getCurrentDate  } from '../utils.js/getCurrentDate.js'

const schema = Joi.object({
    bookid: Joi.string().required().min(4),
    bookname: Joi.string().required().min(2),
    price: Joi.number().required(),
    image: Joi.string().required(),
    category: Joi.string().min(5),
    supplier: Joi.string(),
    author: Joi.string(),
    description: Joi.string(),
    inStock: Joi.number().default(0),
    purchased: Joi.number().default(0),
    discount: Joi.number().default(0),
    issuers: Joi.string(),
    datePublic: Joi.string(),
    bookSize: Joi.string(),
    coverType: Joi.string(),
    pagesNumber: Joi.string(),
    sku: Joi.string(),
    bookMass: Joi.string(),
    createdAt: Joi.date().timestamp().default(getCurrentDate()),
    updatedAt: Joi.date().timestamp().default(null),
    isAvailable: Joi.boolean().default(true),
    _destroy: Joi.boolean().default(false) 
})

const validateSchema = async (data) => {
    try {
        const validated =  await schema.validateAsync(data, { abortEarly: false}) 
        return validated
    } catch (error) {
        return ({err: 'Validate product failed with error: ' + error})
    }
}

const getAll = async () => {
    try {
        const data = await getDB().collection('products').find().toArray()
        return  data
    } catch (error) {
        return ({err: 'Get all product failed with error: ' + error})
    }
}

const getOne = async (id) => {
    try {
        const data = await getDB().collection('products').findOne({bookid: id})
        if(!data){
            return ({err: 'BookID not found'})
        }
        return data
    } catch (error) {
        return ({err: `Get bookID:${id} failed with error: ` + error})
    }
}

const createNew = async (data) => {
    try {
        const value = await validateSchema(data)
        const all = await getDB().collection('products').find().toArray()
        for(let i = 0; i < all.length; i++){
            if(data.bookid === all[i].bookid) {
                return ({err: 'Create product failed (productID already existed)!'})
            }
        }
        if(!value.err){
            await getDB().collection('products').insertOne(value)
            return ({message: 'Create product successfully'})
        }
        return ({err: 'Create product failed with error: ' + value.err})
    } catch(error) {
        return ({err: 'Create product failed with error: ' + error})
    }
}

const updateOne = async (id, data) => {
    try {
        const existed = await getDB().collection('products').findOne({bookid: id})
        if(!existed){
            return ({err: 'BookID not found'})
        }
        const condition = Joi.object({
            bookname: Joi.string().min(2),
            price: Joi.number(),
            image: Joi.string(),
            category: Joi.string(),
            supplier: Joi.string(),
            author: Joi.string(),
            description: Joi.string(),
            inStock: Joi.number(),
            purchased: Joi.number(),
            discount: Joi.number(),
            issuers: Joi.string(),
            datePublic: Joi.string(),
            bookSize: Joi.string(),
            coverType: Joi.string(),
            pagesNumber: Joi.string(),
            bookMass: Joi.string(),
            isAvailable: Joi.boolean(),
            _destroy: Joi.boolean() 
        })
        let value
        try {
            if(Object.keys(data).length === 0){
                return ({err: 'Cant update product due to empty data'})
            }
            value = await condition.validateAsync(data, { abortEarly: false})
        } catch (error) {
            return({err: `Validate bookID:${id}  failed with error: ` + error})
        }
        await getDB().collection('products').updateOne({bookid: id},{$set: value})
        await getDB().collection('products').updateOne({bookid: id},{$set: {updatedAt: getCurrentDate()}})
        return({message: `Update bookID:${id} successfully`})
    } catch (error) {
        return({err: `Update bookID:${id} failed with error: ` + error})
    }
}

const deleteOne = async (id) => {
    try {
        try {
            const data = await getDB().collection('products').findOne({bookid: id})
            await getDB().collection('products').deleteOne({bookid: data.bookid})
            return({message: `Delete bookID:${id} successfully`})
        } catch (error) {
            return ({err: 'BookID not found'})
        }
    } catch (error) {
        return({err: `Delete bookID:${id} failed with error: ` + error})
    }
}

export const ProductModel = { createNew, getAll, getOne, updateOne, deleteOne }