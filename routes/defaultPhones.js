const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const DefaultPhone = require('../models/defaultPhone');
const ObjectId = require('mongodb').ObjectId;
const Phone = require('../models/phone');
const Hit = require('../models/hit');
const Shop = require('../models/shop');

// DefaultPhone list
router.get('/default-phones', async (req, res) => {
  const allDefaultPhones = await DefaultPhone.find().populate('brandId');
  return res.send(allDefaultPhones);
});
// Show DefaultPhone by BrandId

  async function addToCounter(defaultPhoneId) {
  const defaultPhone = await DefaultPhone.findById(defaultPhoneId)
  // console.log(defaultPhone);
  defaultPhone.pageViewCounter = defaultPhone.pageViewCounter+1;
  // console.log(defaultPhone.pageViewCounter);
  await DefaultPhone.findOneAndUpdate({ _id: defaultPhoneId }, defaultPhone, { new: true });
}
// List of DefaultPhones by brandId
router.get('/list-default-phones/:brandId', async (req, res) => {
  const brandId = req.params.brandId;
  if (!brandId || !mongoose.isValidObjectId(brandId)) {
    return res.status(404).send({});
  }
  const defaultPhones = await DefaultPhone.find({ brandId: brandId }).populate('brandId');
  return res.send(defaultPhones);
});

function isIn(arr, id) {
  count =0
  arr.forEach( el => {if(el._id === id){count ++;}})
  return count==0
}

router.get('/list-of-all-defaultPhone-brand', async (req, res) => {
  const allDefaultPhones = await DefaultPhone.find().populate('brandId');
  const allShops = await Shop.find({activated: true})
  let answer = [];
  allShops.forEach( el => {
    if(isIn(answer, el._id)) {
      answer.push( {
        name: el.name,
        _id: el._id,
        type: 'shop'
      })
    }
  })

  allDefaultPhones.forEach(dfp => {
    if(isIn(answer, dfp.brandId._id)) {
      answer.push({
        name: dfp.brandId.name,
        _id: dfp.brandId._id,
        type: 'brand'
      })
    }
  })
  
  allDefaultPhones.forEach(dfp => {
    if(isIn(answer, dfp._id)){
      // const series = dfp.series.replace(/\s+/g, '-');
      // const model = dfp.model.replace(/\s+/g, '-');
      // console.log(series, model, dfp.brandId.name+'_'+ series+ '_'+ model )
      answer.push( {
        name: dfp.brandId.name+' '+ dfp.series+ ' '+ dfp.model,
        brand:dfp.brandId.name,
        series: dfp.series,
        model: dfp.model,
        _id: dfp._id,
        type: 'phone'
      })
    } 
  })  
  return res.send(answer)
})
// List of DefaultPhones by brandId and series
router.get('/filter-list-default-phones/:brandId/:series', async (req, res) => {
  const brandId = req.params.brandId;
  const series = req.params.series;
  if (!brandId || !mongoose.isValidObjectId(brandId)) {
    return res.status(404).send({});
  }
  const defaultPhones = await DefaultPhone.find({ brandId: brandId, series: series }).populate('brandId');
  //  defaultPhones = await defaultPhones.find({series : series};)
  return res.send(defaultPhones);
});

function minMax(phones, id, m) {
  prices = [];
  phones.forEach(phone => { 
    if (phone.defaultPhoneId.toString() == id && phone.sellerId.activated) {
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

function getExistedMemory(memories, phones) {
  
  memories.forEach(el => {
     let mem = {
      memoryStorage:el.memoryStorage,
      ramStorage: el.ramStorage,
      isExists: false
     }
    phones.forEach(phone => {
      // console.log(phone.sellerId.activated, phone.isActive, isInMem(phone.phoneCollection, el), el, phone.phoneCollection )
      if(phone.sellerId.activated && phone.isActive && isInMem(phone.phoneCollection, el)){
        mem.isExists = true
      } })
      if(mem.isExists) {
        return mem
      }
    })
}
// Query inside default phones
router.post('/default-phones/query', async (req, res) => {  
  const filter = req.body;
  let dfIds = [];
  let defaultPhoneIds;

  const defaultPhones = await DefaultPhone.find({'brandName': filter.brandId}).collation( { locale: 'en', strength: 2 } );
  console.log(defaultPhones.length)
  defaultPhones.forEach((doc) => {
    dfIds.push(doc._id.toString());
  })

  defaultPhoneIds = { "defaultPhoneId": { $in: dfIds } };
  isActive = { "isActive": true };
  const query = {
    ...defaultPhoneIds,
    ...isActive
  };

  const filteredShopPhones = await Phone.find(query).populate('sellerId');
  // console.log(filteredShopPhones.length)
  const result = [];
  defaultPhones.forEach((defaultPhone) => {
    const dfId = defaultPhone._id.toString();
    // let answerPhone = defaultPhone
    let answerPhone = {
      _id: defaultPhone._id,
      series: defaultPhone.series,
      model: defaultPhone.model,
      images: defaultPhone.images,
      colors: defaultPhone.colors,
      memories: defaultPhone.memories,
      screen: defaultPhone.screen,
      camera: defaultPhone.camera,
      video: defaultPhone.video,
      batary: defaultPhone.batary,
      cpu: defaultPhone.cpu,
      weight: defaultPhone.weight,
      shops: [],
      producedDate: defaultPhone.producedDate,
      operatingSystem: defaultPhone.operatingSystem,
      defaultCreatedDate: defaultPhone.defaultCreatedDate,
      defaultUpdatedDate: defaultPhone.defaultUpdatedDate,
      price: {},
      pageViewCounter: defaultPhone.pageViewCounter,
    }

    filteredShopPhones.forEach((phone) => { 
        if (dfId === phone.defaultPhoneId.toString() && phone.sellerId != null && defaultPhone.memories.length >= 1 && phone.sellerId.activated && phone.isActive) {
          let memoryStorage = defaultPhone.memories.find(el => {return el?.isExists === true}).memoryStorage
          answerPhone.price = minMax(filteredShopPhones, dfId, memoryStorage)
          phone.phoneCollection.forEach(collection => {
            if (collection.memory.memoryStorage === memoryStorage) {
              if (!answerPhone.shops) {
                answerPhone.shops = [];
                answerPhone.shops.push({
                  price: collection.price,
                  link: phone.phoneUrl || '',
                  localStorage: collection.memory.memoryStorage,
                  shop: {
                    name: phone.sellerId.name,
                    _id: phone.sellerId._id
                  }
                });
              } else {
                answerPhone.shops.push({
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
    
    })

    if (answerPhone.memories.length >= 1 && filteredShopPhones.length >0) { 
      // console.log(answerPhone.price)
      if(answerPhone.shops.length > 0) { 
        result.push(answerPhone)
      }
    }
  })
  console.log(result.length)

  return res.send(result);
});

// Create DefaultPhone
router.post('/default-phones', async (req, res) => {
  const data = req.body;
  const newDefaultPhone = await new DefaultPhone(data).save();
  return res.send(newDefaultPhone);
});
// Show DefaultPhone
router.get('/default-phones/:id', async (req, res) => {
  const defaultPhoneId = req.params.id;
  var ip = req.connection.remoteAddress;
  if (!defaultPhoneId || !mongoose.isValidObjectId(defaultPhoneId)) {
    return res.status(404).send({});
  } 
  // addToCounter(defaultPhoneId)
  let hit = await Hit.find({
    defaultPhoneId: defaultPhoneId,
    ip: ip
  });
  var newVisitor = false;
  if (!hit) {
    const newHit = await new Hit({
      defaultPhoneId: defaultPhoneId,
      ip: ip
    }).save();
    // console.log(newHit);
    newVisitor = true;
  }

  if (newVisitor) {
    /* update the counter on the defaultPhone */
    const defaultPhone = await DefaultPhone.findById(defaultPhoneId).populate('brandId')
    let pageViewCounter = defaultPhone.pageViewCounter;
    const updatedDefaultPhone = await DefaultPhone.findOneAndUpdate({
      _id: defaultPhoneId
    }, { pageViewCounter: pageViewCounter + 1 }, {
      new: true
    }).populate('brandId')
    return res.send(updatedDefaultPhone);
  } else {
    const defaultPhone = await DefaultPhone.findById(defaultPhoneId).populate('brandId')
    return res.send(defaultPhone);
  }
});
// Update DefaultPhone
router.post('/default-phones/:id', async (req, res) => {
  const defaultPhoneData = req.body;
  const defaultPhoneId = req.params.id;
  if (!defaultPhoneId || !mongoose.isValidObjectId(defaultPhoneId)) {
    return res.status(404).send({});
  }
  defaultPhoneData.updatedDate = new Date();
  const updatedDefaultPhone = await DefaultPhone.findOneAndUpdate({ _id: defaultPhoneId }, defaultPhoneData, { new: true });
  return res.send(updatedDefaultPhone);
});
// Delete DefaultPhone
router.delete('/default-phones/:id', async (req, res) => {
  const defaultPhoneId = req.params.id;
  if (!defaultPhoneId || !mongoose.isValidObjectId(defaultPhoneId)) {
    return res.status(404).send({});
  }
  try {
    await DefaultPhone.deleteOne({ _id: defaultPhoneId });
  } catch (e) {
    return res.status(500).send(e);
  }
  return res.status(200).send();
});
// List of DefaultPhones by brandId
router.get('/default-phones/:id', async (req, res) => {
  const brandId = req.params.id;
  if (!brandId || !mongoose.isValidObjectId(brandId)) {
    return res.status(404).send({});
  }
  const defaultPhones = await DefaultPhone.find({ brandId: brandId }).populate('brandId');
  return res.send(defaultPhones);
});
// Get list of defaultPhones by produced year(date)
router.route('/year-phones').get(async function (req, res) {
  let year = req.query.year;
  let defaultPhones = await DefaultPhone
    .find({ producedDate: year }).populate('brandId');

  return res.json(defaultPhones);
});
// Get defaultPhones by produced year(date) and brandId  TODO year[2020, 2019]
router.route('/brand-year-phones').get(async function (req, res) {
  let year = req.query.year;
  let brandId = req.query.brandId;
  let brandPhones = await DefaultPhone
    .find({ $and: [{ brandId: brandId, producedDate: year }] });

  return res.json(brandPhones);
});
// Get number of defaultPhones  TODO add active/incative field to table(collection)
router.get('/default-count', async (req, res) => {
  let defaultPhonesCount = await DefaultPhone.find().populate('brandId').countDocuments();
  // console.log("Number of default-phones: ", defaultPhonesCount);
  return res.json(defaultPhonesCount);
});
function getBooleanMemory(arr){
  let count=0;
  arr.forEach(el => {if(el.isExists){count++}})
  return count >0
}
// Get popular products(defaultPhones) by pageViewCounter
router.get('/popular-phones', async (req, res) => {
  let dfIds = [];
  let defaultPhones = await DefaultPhone.find().populate('brandId').sort({ pageViewCounter: -1 }).limit(24); // 18 popular defaultPhones
  defaultPhones.forEach((doc) => {
    dfIds.push(doc._id.toString());
  })
  defaultPhoneIds = { "defaultPhoneId": { $in: dfIds } };

  const query = {
    ...defaultPhoneIds
  };

  const filteredShopPhones = await Phone.find(query).populate('sellerId');
  const result = [];

  defaultPhones.forEach((defaultPhone) => {
    if (defaultPhone.memories.length >= 1 && getBooleanMemory(defaultPhone.memories)) {
      let answerPhone = {
        _id: defaultPhone._id,
        brandId: defaultPhone.brandId.name,
        series: defaultPhone.series,
        model: defaultPhone.model,
        images: defaultPhone.images,
        color: defaultPhone.colors,
        memory: defaultPhone.memories,
        desc: defaultPhone.camera + ', '
          + defaultPhone.video + ', '
          + defaultPhone.batary + ', ' +
          defaultPhone.cpu + ', ' +
          defaultPhone.weight,
        price: minMax(filteredShopPhones, defaultPhone._id.toString(), 1)
      }
      if(answerPhone.price.low) {
        result.push(answerPhone)
      }
    }
  })

  return res.send(result.slice(0,18));
});

// Get random phones
router.get('/random-phones', async (req, res) => {
  let dfIds = [];
  let defaultPhones = await DefaultPhone.aggregate([{ $sample: { size: 25 }}] )

  defaultPhones.forEach((doc) => {
    dfIds.push(doc._id.toString());
  })
  defaultPhoneIds = { "defaultPhoneId": { $in: dfIds } };

  const query = {
    ...defaultPhoneIds
  };

  const filteredShopPhones = await Phone.find(query).populate('sellerId');
  const result = [];

  defaultPhones.forEach((defaultPhone) => {
    if (defaultPhone.memories.length >= 1 && getBooleanMemory(defaultPhone.memories)) {
      let answerPhone = {
        _id: defaultPhone._id,
        brandId: defaultPhone.brandName,
        series: defaultPhone.series,
        model: defaultPhone.model,
        images: defaultPhone.images,
        color: defaultPhone.colors,
        memory: defaultPhone.memories,
        desc: defaultPhone.camera + ', '
          + defaultPhone.video + ', '
          + defaultPhone.batary + ', ' +
          defaultPhone.cpu + ', ' +
          defaultPhone.weight,
        price: minMax(filteredShopPhones, defaultPhone._id.toString(), 1)
      }
      if(answerPhone.price.low) {
        result.push(answerPhone)
      }
    }
  })

  return res.send(result.slice(0,20));
});
// Search by brand name, model, series
router.post('/searchDefaultPhone', async (req, res) => {
  const searchkey = req.body.text;
  let defaultPhoneIds;
  
  let dfIds = [];
  let  defaultPhones = await DefaultPhone.find({$or: [ {$text: { $search: `\"${searchkey}\"` }} ]});

    defaultPhones.forEach((doc) => {
      dfIds.push(doc._id.toString());
    })

    defaultPhoneIds = { "defaultPhoneId": { $in: dfIds } };

    const query = {
      ...defaultPhoneIds
    };
  
    const filteredShopPhones = await Phone.find(query).populate('sellerId');
    const result = [];
    defaultPhones.forEach((defaultPhone) => {
      const dfId = defaultPhone._id.toString();
      let answerPhone = defaultPhone
      filteredShopPhones.forEach((phone) => {
        if (dfId === phone.defaultPhoneId.toString() && phone.sellerId != null && defaultPhone.memories.length >= 1  && phone.sellerId.activated && phone.isActive) {
          let memoryStorage = defaultPhone.memories[0].memoryStorage
          answerPhone._doc.price = minMax(filteredShopPhones, dfId, memoryStorage)
          phone.phoneCollection.forEach(collection => {
            if (collection.memory.memoryStorage === memoryStorage) {
              if (!answerPhone._doc.shops) {
                answerPhone._doc.shops = [];
                answerPhone._doc.shops.push({
                  price: collection.price,
                  link: phone.phoneUrl || '',
                  localStorage: collection.memory.memoryStorage,
                  shop: {
                    name: phone.sellerId.name,
                    _id: phone.sellerId._id
                  }
                });
              } else {
                answerPhone._doc.shops.push({
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
      })
      if (answerPhone.memories.length >= 1) {
        result.push(answerPhone)
      }
    })
  
    return res.send(result);
})

//// 
function isInMem(arr, memory) {
  if(arr !== undefined) {
  count =0
  arr.forEach( el => {if(el.memory.memoryStorage === memory.memoryStorage && el.memory.ramStorage === memory.ramStorage){count ++;}})
  return count==0
  }
}

function isInCol(arr, color) {
  count =0
  arr.forEach( el => {
    el.color.forEach( ee => {
      if(ee.hex === color.hex){
        count ++;
      }})
    })
  return count==0
}

router.get('/get_defaoultPhone/:name', async (req, res) => {
  const name = req.params.name;
  const arr = name.split('_')
  let model = arr[2];
  model = model.split('-').join(' ')
  let series = arr[1];
  series = series.split('-').join(' ') 
  if (!arr[0] && !model && !series) {
    return res.status(404).send({});
  }
  const defaultPhone = await DefaultPhone.findOne({'series': series, 'model': model, 'brandName': arr[0]}).collation({ locale: 'en', strength: 2 } ).populate('brandId')
  if(defaultPhone) {
    addToCounter(defaultPhone._id)
    const phones = await Phone.find({'isActive': true, 'defaultPhoneId': defaultPhone._id}).populate('sellerId')
    let mem =[]
    let col =[]
    defaultPhone.memories.forEach(el => {
      mem.push(
        {
          memoryStorage:el.memoryStorage,
          ramStorage: el.ramStorage,
          isExists: false
        }
      )
      phones.forEach(phone => {
        if(phone.sellerId.activated && isInMem(phone.phoneCollection, el)){
        } else {
          mem[mem.findIndex(element => { return el.memoryStorage == element.memoryStorage && el.ramStorage === element.ramStorage })].isExists = true;
        }
        })
      })

      defaultPhone.colors.forEach(el => {
        col.push( {
          hex: el.hex,
          name: el.name,
          isExists: false})
        phones.forEach(phone => {
          if(phone.sellerId.activated && isInCol(phone.phoneCollection, el)){
          } else {
            col[col.findIndex(element => { return el.hex == element.hex})].isExists = true;
          }
        })
      });

    defaultPhone.memories = mem;
    defaultPhone.colors = col;
    return res.send(defaultPhone);
  }  else {
    return res.send(null);
  }

});

module.exports = router;