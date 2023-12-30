const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Shop = require('../models/shop');
const Phone = require('../models/phone');
const DefaultPhone = require('../models/defaultPhone');
const Brand = require('../models/brand');

router.get('/shops', async (req, res) => {
  // TODO: get only activated shops
  const allShops = await Shop.find({activated: true});
  return res.send(allShops);
});

router.get('/all-shops', async (req, res) => {
  // TODO: get only activated shops
  const allShops = await Shop.find();
  return res.send(allShops);
});

router.post('/shops', async (req, res) => {
  // TODO: validate
  const data = req.body;
  const newShop = await new Shop(data).save();
  return res.send(newShop);
});

router.get('/shops/:id', async (req, res) => {
  const shopId = req.params.id;
  if (!shopId || !mongoose.isValidObjectId(shopId)) {
    // TODO: send not found
    return res.status(404).send({});
  }
  const shop = await Shop.findById(shopId);
  return res.send(shop);
});

router.post('/shops/:id', async (req, res) => {
  const shopData = req.body;
  const shopId = req.params.id;
  if (!shopId || !mongoose.isValidObjectId(shopId)) {
    // TODO: send not found
    return res.status(404).send({});
  }
  shopData.updatedDate = new Date();
  const updatedShop = await Shop.findOneAndUpdate({ _id: shopId }, shopData, { new: true });
  return res.send(updatedShop);
});

router.delete('/shops/:id', async (req, res) => {
  const shopId = req.params.id;
  if (!shopId || !mongoose.isValidObjectId(shopId)) {
    // TODO: send not found
    return res.status(404).send({});
  }

  try {
    await Shop.deleteOne({ _id: shopId });
  } catch (e) {
    return res.status(500).send(e);
  }
  return res.status(200).send();
});

// current shops available brands
router.get('/shop-brands/:sellerId', async (req, res) => {
  const sellerId = req.params.sellerId;
  let brandId = [];
  let dfIds = [];
  let defaultPhoneIds;
  let brandIdtoOb;
  if (!sellerId || !mongoose.isValidObjectId(sellerId)) {
    return res.status(404).send({});
  }
  const phones = await Phone.find({sellerId: sellerId});
  phones.forEach((doc) => {
    dfIds.push(doc.defaultPhoneId.toString());
  })
  defaultPhoneIds = {"_id": {$in: dfIds}};
  const defPhone  = await DefaultPhone.find({...defaultPhoneIds});
  defPhone.forEach((doc) =>{
    brandId.push(doc.brandId.toString());
  })
  brandIdtoOb= {"_id": {$in: brandId}};
  const brand  = await Brand.find({...brandIdtoOb});
  return res.send(brand);


})


router.get('/user-select-shop/:shopname', async (req, res) => {
  const shopn = req.params.shopname;
  if (!shopn) {
    return res.status(404).send({});
  }
  const shop = await Shop.findOne({'name': shopn}).collation( { locale: 'en', strength: 2 } )
  return res.send(shop);
});

module.exports = router;
