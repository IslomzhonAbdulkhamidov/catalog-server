const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Brand = require('../models/brand');
// Get list of brands
router.get('/brands', async (req, res) => {
  const allBrands = await Brand.find();
  return res.send(allBrands);
});
// Create Brand
router.post('/brands', async (req, res) => {
  const data = req.body;
  const newBrand = await new Brand(data).save();
  return res.send(newBrand);
});
// Show Brand
router.get('/brands/:id', async (req, res) => {
  const brandId = req.params.id;
  if (!brandId || !mongoose.isValidObjectId(brandId)) {
    return res.status(404).send({});
  }
  const brand = await Brand.findById(brandId);
  return res.send(brand);
});
// Update Brand
router.post('/brands/:id', async (req, res) => {
  const brandData = req.body;
  const brandId = req.params.id;
  if (!brandId || !mongoose.isValidObjectId(brandId)) {
    return res.status(404).send({});
  }
  brandData.updatedDate = new Date();
  const updatedBrand = await Brand.findOneAndUpdate({_id: brandId}, brandData, {new: true});
  return res.send(updatedBrand);
});
// Delete Brand
router.delete('/brands/:id', async (req, res) => {
  const brandId = req.params.id;
  if (!brandId || !mongoose.isValidObjectId(brandId)) {
    return res.status(404).send({});
  }

  try {
    await Brand.deleteOne({_id: brandId});
  } catch (e) {
    return res.status(500).send(e);
  }
  return res.status(200).send();
});

router.get('/user-select-brand/:brandname', async (req, res) => {
  const brandId = req.params.brandname;
  if (!brandId) {
    return res.status(404).send({});
  }
  const brand = await Brand.findOne({'name': brandId.toLocaleLowerCase()}).collation( { locale: 'en', strength: 2 } )
  return res.send(brand);
});
module.exports = router;
