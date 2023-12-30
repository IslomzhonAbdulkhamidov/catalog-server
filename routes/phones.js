const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Phone = require('../models/phone');
const DefaultPhone = require('../models/defaultPhone');
// Get list of phones by shopId
router.get('/phones/:id', async (req, res) => {
  const shopId = req.params.id;
  if (!shopId || !mongoose.isValidObjectId(shopId)) {
    return res.status(404).send({});
  }
  const phones = await Phone.find({ sellerId: shopId }).populate('defaultPhoneId').populate('sellerId');
  return res.send(phones);
});

function colorCheck(array, value) {
  count =0
  array.forEach(element => {
    if(element.hex === value) {count++;}
  })
  return count >=1;
}

function minMax(phones, id, m) {
  prices = [];
  phones.forEach(phone => { 
    if (phone.defaultPhoneId.toString() == id && phone.sellerId.activated && phone.isActive) {
      phone.phoneCollection.forEach(col => {
        prices.push(col.price);
      })
    }
  })
  prices = prices.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  return { low: prices[0], high: prices[prices.length - 1], memory: m }
}

function isInMem(arr, memory) {
  count =0
  arr.forEach( el => {if(el.memory.memoryStorage === memory.memoryStorage && el.memory.ramStorage === memory.ramStorage){count ++;}})
  // console.log(count)
  return count ===1
}

// Get phone's price and shop's name/link by defaultPhoneId
router.post('/find-shops-by-dfp/:id', async  (req, res) => {
  let name = req.params.id;
  const filter = req.body;
  let colorhex;
  let memoryStorage;
  let ramStorage;
  
  if (filter.color) {
    colorhex = filter.color
  }
  
  if (filter.memory) {
    memoryStorage = parseInt(filter.memory.split('_')[0],10)
    ramStorage = parseInt(filter.memory.split('_')[1], 10)
  }
  let filterResult = []; // to return

  const arr = name.split('_')
  let model = arr[2];
  model = model.split('-').join(' ')
  let series = arr[1];
  series = series.split('-').join(' ')

  if (!arr[0] && !model && !series) {
    return res.status(404).send({});
  }

  const defaultPhone = await DefaultPhone.findOne({'series': series, 'model': model, 'brandName': arr[0]}).collation({ locale: 'en', strength: 2 } ).populate('brandId')

  let phones = await Phone.find({
    defaultPhoneId: defaultPhone._id
  }).populate('defaultPhoneId').populate('sellerId');

  let mem = []
  defaultPhone.memories.forEach(el => {
    mem.push(
      {
        memoryStorage:el.memoryStorage,
        ramStorage: el.ramStorage,
        isExists: false
      }
    )
    phones.forEach(phone => {

      // console.log(phone.sellerId.activated, phone.isActive, isInMem(phone.phoneCollection, el), el, phone.phoneCollection )
      if(phone.sellerId.activated && phone.isActive && isInMem(phone.phoneCollection, el)){
       const index = mem.findIndex(element => { return el.memoryStorage == element.memoryStorage && el.ramStorage === element.ramStorage })
       let memory = mem[index]
       if(!memory.isExists) {
         mem[index].isExists = true
       }
      }
      })
    })

    if(!memoryStorage){
      const a = mem.find(el => {return el?.isExists === true})
      
      memoryStorage = a.memoryStorage
      ramStorage = a.ramStorage
    }
  phones.forEach(phone => {
  
    // console.log(memoryStorage, ramStorage)
    if(phone.sellerId.activated && phone.isActive) {
      phone.phoneCollection.forEach(collection => {
        if(collection.memory.memoryStorage === memoryStorage && collection.memory.ramStorage === ramStorage){
          if(colorhex && colorCheck(collection.color, colorhex)) {
            filterResult.push({
              price: collection.price,
              link: phone.phoneUrl || '',
              localStorage: collection.memory.memoryStorage,
              color: colorhex ,
              shop: {
                name: phone.sellerId.name,
                _id: phone.sellerId._id
              }
            });
          } else if(!colorhex) {
            filterResult.push({
              price: collection.price,
              link: phone.phoneUrl || '',
              localStorage: collection.memory.memoryStorage,
              shop: {
                name: phone.sellerId.name,
                _id: phone.sellerId._id
              }
            });
          }
        }
      })
    }
    
  });

  return res.json(filterResult);
});

// Get number of phones by shopId
router.get('/phones', async (req, res) => {
  let shopId = req.query.id;
  if (!shopId || !mongoose.isValidObjectId(shopId)) {
    return res.status(404).send({});
  }
  let phonesCount = await Phone.find({
    sellerId: shopId
  }).populate('defaultPhoneId').populate('sellerId').count();
  //console.log("Number of phones: ", phonesCount);
  return res.json(phonesCount);
});

router.get('/shop-phones-count/:id', async (req, res) =>{
  let shopId = req.params.id;
  if (!shopId || !mongoose.isValidObjectId(shopId)) {
    return res.status(404).send({});
  }

  let shopPhoneCount = {
    allPhones: Number,
    activePhones: Number,
    notActivePhones: Number,
  }
  shopPhoneCount.activePhones = await Phone.find({sellerId: shopId, isActive: true}).count();
  shopPhoneCount.notActivePhones = await Phone.find({sellerId: shopId, isActive: false}).count();
  shopPhoneCount.allPhones = shopPhoneCount.activePhones + shopPhoneCount.notActivePhones;
  return res.json(shopPhoneCount)
})



module.exports = router;
