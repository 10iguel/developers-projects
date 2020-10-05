const express = require('express')

const {getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps')

const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middleware/advancedResults')


// Include other resource routers
const courseRoute = require('./courses')
const reviewRoute = require('./reviews')

const router = express.Router()

const {protect,authorize}= require('../middleware/auth')

//Re-Route into other resource router
router.use('/:bootcampId/courses',courseRoute)
router.use('/:bootcampId/reviews',reviewRoute)

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius)

router.route('/:id/photo').put(protect,authorize('publisher','admin'),bootcampPhotoUpload)

router
    .route('/')
    .get(advancedResults(Bootcamp,'courses'),getBootcamps)
    .post(protect,authorize('publisher','admin'),createBootcamp)

router
    .route('/:id')
    .get(getBootcamp)
    .put(protect,authorize('publisher','admin'),updateBootcamp)
    .delete(protect,authorize('publisher','admin'),deleteBootcamp)

module.exports = router

