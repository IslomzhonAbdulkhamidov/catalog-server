const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Phone = require('../models/phone');
const ObjectId = require('mongodb').ObjectId;
const DefaultPhone = require('../models/defaultPhone');
const Brand = require('../models/brand');

// Phone list
router.get('/shop-phones', async (req, res) => {
  const allPhones = await Phone.find().populate('sellerId').populate('defaultPhoneId');
  return res.send(allPhones);
});

// DefaultPhone List by sellerId and brand and series
router.post('/shop-phones/query', async (req, res) => {
  const filter = req.body;

  if (!filter.sellerId || !mongoose.isValidObjectId(filter.sellerId)) {
    return res.send([]);
  }

  let brandId;
  let active;
  let series;
  if (filter.brandId) {
    brandId = { "brandId": new ObjectId(filter.brandId) }
  }
  if (filter.series) {
    series = { "series": filter.series }
  }

  let dfIds = [];
  let defaultPhoneIds;
  if (brandId || series) {
    const res = await DefaultPhone.find({ ...brandId, ...series });
    res.forEach((doc) => {
      dfIds.push(doc._id.toString());
    })
    defaultPhoneIds = { "defaultPhoneId": { $in: dfIds } };
  }

  let sellerId;
  if (filter.sellerId) {
    sellerId = { "sellerId": new ObjectId(filter.sellerId) };
  }

  if (filter.isActive !== undefined) {
    active = { "isActive": filter.isActive };
  }
  const phones = await Phone.find({ ...sellerId, ...active, ...defaultPhoneIds }).populate({
    path: 'defaultPhoneId',
    model: DefaultPhone,
    populate: {
      path: 'brandId',
      model: Brand
    }
  })
  return res.send(phones);
})

// phone List by sellerId(shop phones) required and (bran, year, color, memory) are optional
router.post('/filtered-shop-phones/query', async (req, res) => {
  const filter = req.body;
  let dfIds = [];
  // let price;
  let defaultPhoneIds;
  // let rams;
  // let storages;
  let sellerId;

  // filter by seller & producedDate are filtered in default phones first
  let brandId = [];
  // let producedDate;
  // let colors;
  if (filter.brandId && filter.brandId.length > 0) {
    brandId = { "brandId": { $in: filter.brandId } }
  }
  // if (filter.producedDate) {
  //   producedDate = { "producedDate": filter.producedDate }
  //   // console.log('producedDate', producedDate)
  // }

  const dfQuery = { ...brandId };
  const defaultPhones = await DefaultPhone.find(dfQuery);
  defaultPhones.forEach((doc) => {
    dfIds.push(doc._id.toString());
  })

  defaultPhoneIds = { "defaultPhoneId": { $in: dfIds } };

  // if (filter.colors && filter.colors.length > 0) {
  //   colors = { "color.hex": { $in: filter.colors } }
  // }

  // if (filter.price) {
  //   const low = filter.price.low || 0;
  //   // tslint:disable-next-line: no-bitwise
  //   const high = filter.price.high || 2 << 16;
  //   price = {
  //     "price": {
  //       $gte: low,
  //       $lte: high
  //     }
  //   }
  // }

  if (filter.sellerId) {
    sellerId = { "sellerId": new ObjectId(filter.sellerId) }
    console.log(sellerId)
  }

  // if (filter.rams && filter.rams.length > 0) {
  //   rams = {
  //     "memory.ramStorage": {
  //       $in: filter.rams
  //     }
  //   }
  // }

  // if (filter.memories && filter.memories.length > 0) {
  //   storages = {
  //     "memory.memoryStorage": {
  //       $in: filter.memories
  //     }
  //   }
  // }

  const query = {
    ...sellerId,
    ...defaultPhoneIds,
    // ...price,
    // ...colors,
    // ...rams,
    // ...storages,
  };
  const filteredShopPhones = await Phone.find(query).populate({
    path: 'defaultPhoneId',
    model: DefaultPhone,
    populate: {
      path: 'brandId',
      model: Brand
    }
  })
  return res.send(filteredShopPhones);
});

function getPhoneColors(collection) {
  colors = []
  collection.forEach(col => {
    if (col.color) {
      col.color.forEach(color => {
        if (!colors.some(c => c.hex === color.hex)) {
          colors.push(color)
        }
      })
    }
  })
  return colors;
}

function getPhoneMemory(collection) {
  memories = [];
  collection.forEach(col => {
    if (!memories.some(m => m.memoryStorage === col.memory.memoryStorage)) {
      memories.push(col.memory)
    }
  })
  return memories;
}

function minMax(collection) {
  prices = [];
  collection.forEach(col => {
    prices.push(col.price);
  })
  prices = prices.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  return { low: prices[0], high: prices[prices.length - 1] }
}

router.get('/get_current_shop_activated_phones/query/:id', async (req, res) => {
  const shopId = req.params.id;
  if (!shopId) {
    return res.status(404).send({});
  }

  const filteredShopPhones = await Phone.find({ sellerId: shopId }).populate({
    path: 'defaultPhoneId',
    model: DefaultPhone,
    populate: {
      path: 'brandId',
      model: Brand
    }
  }).populate('sellerId')
  const result = [];

  filteredShopPhones.forEach(phone => { 
    if(phone.sellerId.activated && phone.isActive) {
    let answerPhone = {
      _id: phone._id,
      defId: phone.defaultPhoneId._id,
      name: phone.defaultPhoneId.brandId.name + ' ' + phone.defaultPhoneId.series + ' ' + phone.defaultPhoneId.model,
      brandName: phone.defaultPhoneId.brandId.name,
      series: phone.defaultPhoneId.series,
      model:phone.defaultPhoneId.model,
      images: phone.defaultPhoneId.images,
      colors: getPhoneColors(phone.phoneCollection),
      memories: getPhoneMemory(phone.phoneCollection),
      screen: phone.defaultPhoneId.screen,
      camera: phone.defaultPhoneId.camera,
      video: phone.defaultPhoneId.video,
      batary: phone.defaultPhoneId.batary,
      cpu: phone.defaultPhoneId.cpu,
      weight: phone.defaultPhoneId.weight,
      phoneCollection: phone.phoneCollection,
      phoneUrl: phone. phoneUrl,
      price: minMax(phone.phoneCollection),
      pageViewCount: phone.defaultPhoneId.pageViewCounter,
      updatedDate: phone.updatedDate
    }
    result.push(answerPhone)
  } 
})
  return res.send(result);
})

// Create Phone
router.post('/shop-phones', async (req, res) => {
  const data = req.body;
  const newPhone = await new Phone(data).save()
  update_defaultPhone_memory(newPhone.defaultPhoneId)
  return res.send(newPhone);
});

// Show Phone
router.get('/shop-phones/:id', async (req, res) => {
  const phoneId = req.params.id;
  if (!phoneId || !mongoose.isValidObjectId(phoneId)) {
    return res.status(404).send({});
  }
  const phone = await Phone.findById(phoneId).populate('sellerId');
  return res.send(phone);
});

// Update Phone
router.post('/shop-phones/:id', async (req, res) => {
  const phoneData = req.body;
  const phoneId = req.params.id;
  if (!phoneId || !mongoose.isValidObjectId(phoneId)) {
    return res.status(404).send({});
  }
  phoneData.updatedDate = new Date();
  const updatedPhone = await Phone.findOneAndUpdate({ _id: phoneId }, phoneData, { new: true })
  update_defaultPhone_memory(updatedPhone.defaultPhoneId)
  return res.send(updatedPhone);
});

// Delete Phone
router.delete('/shop-phones/:id', async (req, res) => {
  const phoneId = req.params.id;
  if (!phoneId || !mongoose.isValidObjectId(phoneId)) {
    return res.status(404).send({});
  }
  const phone = await Phone.findOne({_id: phoneId})
  try {
    await Phone.deleteOne({ _id: phoneId }).then(() => {
      update_defaultPhone_memory(phone.defaultPhoneId)
    })
  } catch (e) {
    return res.status(500).send(e);
  }
  return res.status(200).send();
});

function isInMem(arr, memory) {
  if(arr !== undefined) {
  count =0
  arr.forEach( el => {if(el.memory.memoryStorage === memory.memoryStorage && el.memory.ramStorage === memory.ramStorage){count ++;}})
  return count==0
  }
}

// Update DefaultPhone
 async function update_defaultPhone_memory(id) {
  const defaultPhoneId = id;
  let defaultPhoneData = await DefaultPhone.findOne({'_id': defaultPhoneId});
  defaultPhoneIds = { "defaultPhoneId": defaultPhoneId };
  isActive = { "isActive": true };
  const query = {
    ...defaultPhoneIds,
    ...isActive
  };

  const filteredShopPhones = await Phone.find(query).populate('sellerId');
  let mem =[]
  defaultPhoneData.memories.forEach(el => {
    mem.push(
      {
        memoryStorage:el.memoryStorage,
        ramStorage: el.ramStorage,
        isExists: false
      }
    )
    filteredShopPhones.forEach(phone => {
      if(phone.sellerId.activated && isInMem(phone.phoneCollection, el)){
      } else {
        mem[mem.findIndex(element => { return el.memoryStorage == element.memoryStorage && el.ramStorage === element.ramStorage })].isExists = true;
      }
      })
    })
    defaultPhoneData.memories = mem
    const updatedDefaultPhone = await DefaultPhone.findOneAndUpdate({ _id: defaultPhoneId }, defaultPhoneData, { new: true });
};

router.get('/shop_all_phone_price/:id', async (req, res) => {
  const shopId = req.params.id;
  let brandId;
  if (!shopId) {
    res.status(500).send("Seller id is not found!");
  } else {
    brandId = { sellerId: new ObjectId(shopId) };
  }
  // Get list of all seller phones and change default phone list
  const phonePrices = await Phone.find(brandId);
  // get all brands
  const brandList = await Brand.find();
  // Get list of all default phone and TableJson
  let defaultPhoneList = [];
  for (const bran of brandList) {
    const filteredDefaultPhone = await DefaultPhone.find({
      brandId: bran?._id,
    });
    const brand = {
      id: bran?.id,
      brandName: bran?.name,
      phoneName: null,
      phoneMemory: null,
      phoneColor: null,
      phonePrice: null,
      // phonePriceDollar: null,
      phoneExist: null,
      __children: [],
    };
    for (const dp of filteredDefaultPhone) {
      const phonePriceToDP = findPhonePriceForDP(dp?._id, phonePrices);
      // console.log(phonePriceToDP, "Phone", dp?._id);
      const defphone = {
        id: dp?.id,
        brandName: null,
        phoneName: dp?.brandName + " " + dp?.series + " " + dp?.model,
        phoneMemory: null,
        phoneColor: null,
        phonePrice: null,
        // phonePriceDollar: null,
        phoneExist: phonePriceToDP ? phonePriceToDP.isActive : false,
        __children: [],
      };
      for (const memory of dp?.memories) {
        const mem = {
          id: null,
          brandName: null,
          phoneName: null,
          phoneMemory: memory.memoryStorage + "Гб ОЗУ " + memory.ramStorage + "Гб",
          phoneColor: null,
          phonePrice: null,
          // phonePriceDollar: null,
          phoneExist: null,
          __children: [],
        };
        if (phonePriceToDP) {
          mem.__children = generateColorsTableJsonWithPrice(memory, dp?.colors, phonePriceToDP.phoneCollection,phonePriceToDP._id );
        } else {
          mem.__children = generateColorTableJson(dp.colors);
        }
        defphone.__children = [...defphone.__children, mem];
      }
      brand.__children = [...brand.__children, defphone];
    }
    defaultPhoneList = [...defaultPhoneList, brand];
  }

  res.status(200).send(defaultPhoneList);
})

function generateColorsTableJsonWithPrice(memory, colors, priceCollection, collectionId) {
   let ans = [];
   for (const color of colors) {
     const mem = {
       id: collectionId,
       brandName: null,
       phoneName: null,
       phoneMemory: null,
       phoneColor: color?.name,
       phonePrice: 0,
       //  phonePriceDollar: 0,
       phoneExist: null,
       __children: [],
     };
     ans = [...ans, mem];
   }

   for (const collection of priceCollection) {
     if (collection.memory.ramStorage === memory.ramStorage && collection.memory.memoryStorage === memory.memoryStorage) {
       for (const color of collection?.color) {
         const index = ans.findIndex(el => el.phoneColor === color.name);
         if (index != -1) {
           ans[index].phonePrice = Number(collection.price);
          //  ans[index].id = collection._id;
          //  console.log(collection._id);
         }
       }
     }
   }
   return ans;
}

function generateColorTableJson(colors) {
  let ans = [];
  for (const color of colors) {
      const mem = {
        id: null,
        brandName: null,
        phoneName: null,
        phoneMemory: null,
        phoneColor: color?.name,
        phonePrice: 0,
        // phonePriceDollar: 0,
        phoneExist: null,
        __children: [],
      };
      ans = [...ans, mem]
  }
  return ans;
}

function findPhonePriceForDP(dpId, phoneList) {
  let ans = null;
  for (const phone of phoneList) {
    if (String(phone.defaultPhoneId) === String(dpId)) {
       ans = phone;
    }
  }
  return ans;
}


router.post('/shop_edit_price_in_excel', async(req, res) => {
  const phoneCollections= req.body;
  try {
     for (const col of phoneCollections) {
       if (col._id) {
         updatePhoneCollection(col);
       } else {
         createNewPhoneCol(col);
       }
     }
     res.status(200).send({message: 'Everything updated successfully!'})
  } catch (error) {
    res.status(500).send({message: 'Something went wrong', err: error})
  }
 
  res.send();
})

async function updatePhoneCollection (phoneCol) {
  const newPhoneCol = await Phone.findByIdAndUpdate(phoneCol._id, phoneCol);
  update_defaultPhone_memory(newPhoneCol.defaultPhoneId);
  return newPhoneCol? newPhoneCol : null;
}

async function createNewPhoneCol(phoneCol) {
   const newPhone = await new Phone(phoneCol).save();
   update_defaultPhone_memory(newPhone.defaultPhoneId);
   return newPhone? newPhone : null;
}
module.exports = router;

